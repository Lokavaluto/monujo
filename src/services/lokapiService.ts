import LokAPIBrowserAbstract from '@lokavaluto/lokapi-browser'
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
