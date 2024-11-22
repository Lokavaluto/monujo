import { LokAPIBrowserAbstract, e, t } from "@lokavaluto/lokapi-browser"
import comchain from "@lokavaluto/lokapi-backend-comchain"
import cyclos from "@lokavaluto/lokapi-backend-cyclos"

import { UIError } from "../exception"

const isFulfilled = <T>(
  p: PromiseSettledResult<T>
): p is PromiseFulfilledResult<T> => p.status === "fulfilled"
export class LokAPI extends LokAPIBrowserAbstract {
  BackendFactories = {
    comchain,
    cyclos,
  }

  requestLogin = () => {}

  getBankAccountName: (bankAccount: any) => Promise<any> = async () => {}

  /**
   * This function will build asynchronously the virtual account
   * array that can be used to display the list of accounts
   */

  // Debouncing
  _buildVirtualAccountTreePromise: Promise<any> | null = null
  buildVirtualAccountTree() {
    if (!this._buildVirtualAccountTreePromise) {
      this._buildVirtualAccountTreePromise =
        this._buildVirtualAccountTree().then((r) => {
          this._buildVirtualAccountTreePromise = null
          return r
        })
    }
    return this._buildVirtualAccountTreePromise
  }
  async _buildVirtualAccountTree() {
    const virtualAccountTree: any[] = []
    const sortOrder = (a: any, b: any) =>
      `${a.backend}${a.name}` < `${b.backend}${b.name}` ? -1 : 1

    const allMoneyAccounts: any[] = []
    const userAccounts = await this.getUserAccounts()
    const errors: any[] = []

    await Promise.allSettled(
      userAccounts.map(async (userAccount: any) => {
        let vals: any[] = await Promise.allSettled([
          this.getBankAccountName(userAccount),
          userAccount.getBalance
            ? userAccount.getBalance().catch((e: any) => e)
            : "-.---,--",
          userAccount.getSymbol
            ? userAccount.getSymbol().catch((e: any) => e)
            : "",
          userAccount.getAccounts().catch((e: any) => e),
        ])
        vals = vals.filter(isFulfilled).map((v) => v.value)
        const exceptions = vals.filter((v) => v instanceof Error)
        const accountErrors: any[] = []
        if (exceptions.length > 0) {
          for (const exception of exceptions) {
            if (accountErrors.every((e) => e !== exception)) {
              accountErrors.push(exception)
            }
            if (exception instanceof e.BackendUnavailableTransient) {
              continue
            }
            if (errors.every((e) => e !== exception)) {
              errors.push(exception)
            }
          }
          replaceOrInsertElt(
            virtualAccountTree,
            accountErrors,
            (a: any) => false,
            sortOrder
          )
          return
        }
        const [name, bal, curr, moneyAccounts] = vals
        const _errorLogged: any[] = []
        const getSafeWalletRecipient = (account: any) => {
          let safeWalletRecipient
          try {
            safeWalletRecipient = account.safeWalletRecipient
          } catch (e: any) {
            if (!_errorLogged.includes(account.internalId)) {
              console.error(`Couldn't get safeWalletRecipient`, e)
              _errorLogged.push(account.internalId)
            }
            return null
          }
          return safeWalletRecipient
        }
        let getWalletData = (account: any) => {
          let walletData
          try {
            walletData = account.jsonData.wallet
          } catch (e: any) {
            return null
          }
          return walletData
        }
        const userAccountData = {
          name,
          bal,
          curr,
          backend: userAccount.internalId.split(":")[0],
          minCreditAmount: userAccount.parent.minCreditAmount,
          maxCreditAmount: userAccount.parent.maxCreditAmount,
          walletData: getWalletData(userAccount),
          safeWalletRecipient: getSafeWalletRecipient(userAccount.parent),
          userAccountId: userAccount.internalId,
          currencyId: userAccount.parent.internalId,
          active: userAccount.active, // FTM only the UserAccount is active or not
          id: userAccount.internalId,
          subAccounts: [],
          _obj: userAccount,
          creditable: false,
        }

        // Query moneyAccounts in this userAccount
        const r = Promise.allSettled(
          (moneyAccounts || []).map(async (account: any) => {
            const vals = await Promise.allSettled([
              this.getBankAccountName(account),
              account.getBalance(),
              account.getSymbol(),
            ])
            const [name, bal, curr] = vals.map((a) => (<any>a).value)
            const accountData = {
              name,
              bal,
              curr,
              backend: account.parent.internalId.split(":")[0],
              minCreditAmount: account.parent.parent.minCreditAmount,
              maxCreditAmount: account.parent.parent.maxCreditAmount,
              walletData: getWalletData(account.parent),
              safeWalletRecipient: getSafeWalletRecipient(
                account.parent.parent
              ),
              userAccountId: account.parent.internalId,
              currencyId: account.parent.parent.internalId,
              active: account.parent.active, // FTM only the UserAccount is active or not
              id: account.internalId,
              _obj: account,
              creditable: account.creditable,
            }
            allMoneyAccounts.push(accountData)
            if (moneyAccounts.length === 1) {
              // replace the userAccount
              accountData.id = userAccountData.id
              replaceOrInsertElt(
                virtualAccountTree,
                accountData,
                (a: any) => userAccountData.id === a.id,
                sortOrder
              )
            } else {
              // Add as subAccounts
              replaceOrInsertElt(
                userAccountData.subAccounts,
                accountData,
                (a: any) => account.internalId === a.id,
                sortOrder
              )
            }
          })
        )

        if (moneyAccounts && moneyAccounts.length !== 1) {
          replaceOrInsertElt(
            virtualAccountTree,
            userAccountData,
            (a: any) => userAccount.internalId === a.id,
            sortOrder
          )
        }

        return r // Resolving for all info related to this userAccount
      })
    )
    return { virtualAccountTree, allMoneyAccounts, errors }
  }

  async getUserAccountsRequiringUnlock() {
    const userAccounts = await this.getUserAccounts()
    // XXXvlab: typeforcing to any as typescript doesn't seem to
    // understand that a allSettled is actually a Promise of an
    // array.
    const filteredAccounts = (await Promise.allSettled(
      userAccounts.map(async function (account: any) {
        return [account, await account.requiresUnlock()]
      })
    )) as any

    return filteredAccounts
      .filter((p: any) => p.status === "fulfilled")
      .map((p: any) => p.value)
      .filter((accountWithrequiresUnlock: any) => accountWithrequiresUnlock[1])
      .map((accountWithrequiresUnlock: any) => accountWithrequiresUnlock[0])
  }

  // XXXvlab: this is less than ideal way to handle the cache
  // clearance. Waiting for a generalized cache management
  clearBackendCache() {
    this._backends = null
    this._backendCredentials = null
  }
}

// utilities function

export function replaceOrInsertElt<T>(
  array: Array<T>,
  elt: T,
  sameFn: (a: T) => boolean,
  orderFn: (a: T, b: T) => number
) {
  let idx = array.findIndex(sameFn)
  let replace
  if (idx === -1) {
    replace = 0
    idx = 0
    while (idx < array.length && orderFn(elt, array[idx]) > 0) idx++
  } else {
    replace = 1
  }
  array.splice(idx, replace, elt)
}

function makeUIProxyRecipient(recipient: t.IRecipient, $gettext: any) {
  return new Proxy(recipient, {
    get: (target, prop, receiver) => {
      if (prop == "toggleFavorite") {
        return async function toggleFavorite(this: any): Promise<void> {
          try {
            await Reflect.get(target, prop, receiver).apply(this)
          } catch (e) {
            let errorMessage = ""
            if (!target.is_favorite)
              errorMessage = $gettext(
                "An error occurred while adding to favorites."
              )
            else
              errorMessage = $gettext(
                "An error occurred while removing from favorites."
              )
            throw new UIError(
              errorMessage +
                " " +
                $gettext("Please try again or contact your administrator"),
              e
            )
          }
        }
      }
      return Reflect.get(target, prop, receiver)
    },
  })
}

export function makeUIProxyBackend(backend: t.IBackend, $gettext: any) {
  return new Proxy(backend, {
    get: (target, prop, receiver) => {
      if (prop === "searchRecipients") {
        return async function* (value: string): AsyncGenerator<t.IRecipient> {
          const recipients = backend.searchRecipients(value)
          for await (const recipient of recipients) {
            yield makeUIProxyRecipient(recipient, $gettext)
          }
        }
      }
      return Reflect.get(target, prop, receiver)
    },
  })
}

export const LokAPIExc = e
