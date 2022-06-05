import { LokAPIBrowserAbstract, e } from "@lokavaluto/lokapi-browser"
import comchain from "@lokavaluto/lokapi-backend-comchain"
import cyclos from "@lokavaluto/lokapi-backend-cyclos"


export class LokAPI extends LokAPIBrowserAbstract {
  BackendFactories = {
    comchain,
    cyclos,
  }

  requestLogin = () => {}

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
              getBankAccountName(userAccount),
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
                    getBankAccountName(account),
                    account.getBalance(),
                    account.getSymbol(),
                  ]).then((vals) => {
                    const [name, bal, curr] = vals.map((a) => (<any>a).value)
                    const accountData = {
                      name,
                      bal,
                      curr,
                      backend: account.parent.internalId.split(":")[0],
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

  // XXXvlab: this is less than ideal way to handle the cache
  // clearance. Waiting for a generalized cache management
  clearBackendCache() {
    this._backends = null
    this._backendCredentials = null
  }
}

// utilities function

export async function getBankAccountName(bankAccount: any) {
  if (bankAccount.getDisplayName) {
    return await bankAccount.getDisplayName()
  }
  const backend = bankAccount.internalId.split(":")[0]
  // XXXvlab: hopefully temporary solution to give a sane
  // french name to account types in comchain
  if (backend === "comchain" && bankAccount.type) {
    return bankAccount.type === "Nant" ? "Compte nantis" : "Crédit mutuel"
  }
  return "Compte principal"
}

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

export const LokAPIExc = e
