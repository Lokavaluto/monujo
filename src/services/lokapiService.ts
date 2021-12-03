import { LokAPIBrowserAbstract, e } from '@lokavaluto/lokapi-browser'
import comchain from '@lokavaluto/lokapi-backend-comchain'
import cyclos from '@lokavaluto/lokapi-backend-cyclos'
import Swal from "sweetalert2"

import router from "../router/index"

class LokAPI extends LokAPIBrowserAbstract {

  BackendFactories = {
    comchain,
    cyclos
  }

  requestLocalPassword = async function (state: string) {
    let text
    if (state === 'firstTry') {
      text = ''  // XXXvlab: need i16n
    } else if (state === 'failedUnlock') {
      text = 'Échec du déchiffrage. ' +
        'Le mot de passe était probablement incorrect. '+
        'Ré-essayez une nouvelle fois'  // XXXvlab: need i16n
    }
    const ret = await Swal.fire({
      title: 'Entrez votre mot de passe',  // XXXvlab: need i16n
      text,
      showCloseButton: true,
      input: 'password',
      inputLabel: 'Mot de passe du portefeuille',  // XXXvlab: need i16n
      inputPlaceholder: 'Votre mot de passe',  // XXXvlab: need i16n
      inputAttributes: {
        maxlength: '32',
        autocapitalize: 'off',
        autocorrect: 'off'
      }
    })
    if (ret.isConfirmed) {
      return ret.value
    }
    throw new Error('User canceled the dialog box')
  }

  requestLogin() {
    console.log("Login requested !")
    router.push('/')
  }

  /**
   * This function will build asynchronously the simplified account
   * array that can be used to display the list of accounts
   */

  // Debouncing
  _buildAccountsInplacePromise: Promise<any> | null = null
  buildAccountsInplace (simplifiedWatchedAccounts: Array<any>)  {
    if (!this._buildAccountsInplacePromise) {
      this._buildAccountsInplacePromise = this._buildAccountsInplace(
        simplifiedWatchedAccounts
      ).then(() => {
        this._buildAccountsInplacePromise = null
      })
    }
    return this._buildAccountsInplacePromise
  }
  async _buildAccountsInplace (simplifiedWatchedAccounts: Array<any>)  {
    const sortOrder = (a: any, b: any) => `${a.backend}${a.name}` < `${b.backend}${b.name}` ? -1 : 1

    const backends = Object.values(await this.getBackends())
    const userAccounts = backends.map(
      (b: any) => Object.values(b.userAccounts)
    ).flat()

    return await Promise.allSettled(
      userAccounts.map((userAccount: any) => new Promise((resolve, reject) => {
        Promise.allSettled([
          getBankAccountName(userAccount),
          userAccount.getBalance ? userAccount.getBalance() : '-.---,--',
          userAccount.getSymbol ? userAccount.getSymbol() : '',
          userAccount.getAccounts(),
        ]).then(vals => {
          const [name, bal, curr, moneyAccounts] = vals.map(a => (<any>a).value)
          const userAccountData = {
            name, bal, curr,
            backend: userAccount.internalId.split(':')[0],
            userAccountId: userAccount.internalId,
            currencyId: userAccount.parent.internalId,
            active: userAccount.active,  // FTM only the UserAccount is active or not
            id: userAccount.internalId,
            subAccounts: [],
          }

          replaceOrInsertElt(
            simplifiedWatchedAccounts,
            userAccountData,
            (a: any) => userAccount.internalId === a.id,
            sortOrder)

          // Query moneyAccounts in this userAccount

          Promise.allSettled(moneyAccounts.map((account: any) => Promise.allSettled([
            getBankAccountName(account),
            account.getBalance(),
            account.getSymbol(),
          ]).then(vals => {
            const [name, bal, curr] = vals.map(a => (<any>a).value)
            const accountData = {
              name, bal, curr,
              backend: account.parent.internalId.split(':')[0],
              userAccountId: account.parent.internalId,
              currencyId: account.parent.parent.internalId,
              active: account.parent.active,  // FTM only the UserAccount is active or not
              id: account.internalId,
            }
            if (moneyAccounts.length === 1) { // replace the userAccount
              accountData.id = userAccountData.id
              replaceOrInsertElt(
                simplifiedWatchedAccounts,
                accountData,
                (a: any) => userAccountData.id === a.id,
                sortOrder)
            } else {  // Add as subAccounts
              replaceOrInsertElt(
                userAccountData.subAccounts,
                accountData,
                (a: any) => account.internalId === a.id,
                sortOrder)
            }
          }))).then(resolve)  // Resolving for all info related to this userAccount
        })
      }))
    )
  }
}


if (!process.env.VUE_APP_LOKAPI_HOST) {
  throw new Error("Please specify VUE_APP_LOKAPI_HOST in '.env'")
}


if (!process.env.VUE_APP_LOKAPI_DB) {
  throw new Error("Please specify VUE_APP_LOKAPI_DB in '.env'")
}



export var lokApiService = new LokAPI(
  process.env.VUE_APP_LOKAPI_HOST,
  process.env.VUE_APP_LOKAPI_DB,
)


// utilities function

export async function getBankAccountName(bankAccount: any) {
  if (bankAccount.getDisplayName) {
    return await bankAccount.getDisplayName()
  }
  const backend = bankAccount.internalId.split(':')[0]
  // XXXvlab: hopefully temporary solution to give a sane
  // french name to account types in comchain
  if (backend === "comchain" && bankAccount.type) {
    return bankAccount.type === "Nant" ? "Compte nantis": "Crédit mutuel"
  }
  return "Compte principal"
}

export function replaceOrInsertElt<T>(array: Array<T>, elt: T,
                                      sameFn: (a: T) => boolean,
                                      orderFn: (a: T, b: T) => number) {
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