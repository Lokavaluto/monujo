import { LokAPIBrowserAbstract, e, t } from "@lokavaluto/lokapi-browser"
import comchain from "@lokavaluto/lokapi-backend-comchain"
import cyclos from "@lokavaluto/lokapi-backend-cyclos"

import { UIError } from "../exception"

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

    await Promise.allSettled(
      userAccounts.map(
        (userAccount: any) =>
          new Promise((resolve, reject) => {
            Promise.allSettled([
              this.getBankAccountName(userAccount),
              userAccount.getBalance ? userAccount.getBalance() : "-.---,--",
              userAccount.getSymbol ? userAccount.getSymbol() : "",
              userAccount.getAccounts(),
            ]).then((vals) => {
              const [name, bal, curr, moneyAccounts] = vals.map(
                (a) => (<any>a).value
              )
              const userAccountData = {
                name,
                bal,
                curr,
                backend: userAccount.internalId.split(":")[0],
                minCreditAmount: userAccount.parent.minCreditAmount,
                userAccountId: userAccount.internalId,
                currencyId: userAccount.parent.internalId,
                active: userAccount.active, // FTM only the UserAccount is active or not
                id: userAccount.internalId,
                subAccounts: [],
                _obj: userAccount,
                creditable: false,
              }

              // Query moneyAccounts in this userAccount
              Promise.allSettled(
                (moneyAccounts || []).map((account: any) =>
                  Promise.allSettled([
                    this.getBankAccountName(account),
                    account.getBalance(),
                    account.getSymbol(),
                  ]).then((vals) => {
                    const [name, bal, curr] = vals.map((a) => (<any>a).value)
                    const accountData = {
                      name,
                      bal: parseFloat(bal),
                      curr,
                      backend: account.parent.internalId.split(":")[0],
                      minCreditAmount: account.parent.parent.minCreditAmount,
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
              ).then((r) => {
                if (moneyAccounts && moneyAccounts.length !== 1) {
                  replaceOrInsertElt(
                    virtualAccountTree,
                    userAccountData,
                    (a: any) => userAccount.internalId === a.id,
                    sortOrder
                  )
                }

                resolve(r)
              }) // Resolving for all info related to this userAccount
            })
          })
      )
    )
    return { virtualAccountTree, allMoneyAccounts }
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

  public async searchRecipients(value: string): Promise<t.IRecipient[]> {
    const uiRecipients = []
    // Not using a ``.map`` because we expect ``super.searchRecipient``
    // to return a generator anyway in the near future.
    const recipients = await super.searchRecipients(value)
    for (const recipient of recipients) {
      uiRecipients.push(makeUIProxyRecipient(recipient))
    }
    return uiRecipients
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

function makeUIProxyRecipient(recipient: t.IRecipient) {
  return new Proxy(recipient, {
    get: (target, prop, receiver) => {
      if (prop == "toggleFavorite") {
        return async function toggleFavorite(this: any): Promise<void> {
          try {
            await Reflect.get(target, prop, receiver).apply(this)
          } catch (e) {
            let errorMessage = ""
            if (!target.is_favorite)
              errorMessage =
                "Une erreur est survenue lors de la mise en favoris,"
            else
              errorMessage =
                "Une erreur est survenue lors de la suppression du favori,"
            throw new UIError(
              errorMessage +
                " veuillez ré-essayer ou contacter votre administrateur",
              e
            )
          }
        }
      }
      return Reflect.get(target, prop, receiver)
    },
  })
}

export const LokAPIExc = e
