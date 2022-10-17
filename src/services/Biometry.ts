import { NativeBiometric, BiometryType } from "capacitor-native-biometric"

export default class Biometry {
  realms: any = {}
  store: any
  constructor(store: any, realms: any) {
    this.store = store
    this.realms = realms
  }

  public install(app: any): void {
    app.config.globalProperties.$biometry = this
  }

  public async isAvailable(): Promise<boolean> {
    let result
    try {
      result = await NativeBiometric.isAvailable()
    } catch (e) {
      console.log("No biometric authentication support")
      return false
    }
    if (!result.isAvailable) {
      console.log("No biometric authentication set up")
      return false
    }
    return true
  }

  public async hasCredentialsAvailable(realmId: string): Promise<boolean> {
    if (!(await this.isAvailable())) return false

    const realm = this.realms[realmId]
    if (!realm) {
      console.error(`Unknown realm '${realmId}'`)
      return false
    }
    const hasCredentials = (await this.store.load())?.hasCredentials
    if (!hasCredentials || !hasCredentials[realmId]) {
      return false
    }

    return true
  }

  public async challenge(realmId: string): Promise<any> {
    const realm = this.realms[realmId]
    if (!realm) {
      throw new Error(`Unknown realm '${realmId}'`)
    }

    let result
    try {
      result = await NativeBiometric.verifyIdentity(realm.ui)
    } catch (e) {
      console.log("verifyIdentity Failed")
      throw e
    }
    return await NativeBiometric.getCredentials(realm.creds)
  }

  public async saveCredentials(
    realmId: string,
    credentials: any
  ): Promise<void> {
    const realm = this.realms[realmId]
    if (!realm) {
      throw new Error(`Unknown realm '${realmId}'`)
    }
    await NativeBiometric.setCredentials({ ...credentials, ...realm.creds })
    const biometricSettings: any = {
      hasCredentials: {},
    }
    biometricSettings.hasCredentials[realmId] = true
    await this.store.save(biometricSettings)
  }

  public async deleteCredentials(realmId: string): Promise<void> {
    const realm = this.realms[realmId]
    if (!realm) {
      throw new Error(`Unknown realm '${realmId}'`)
    }
    const store = await this.store.load()
    await NativeBiometric.deleteCredentials(realm.creds)
    if (store?.hasCredentials && realmId in store.hasCredentials)
      delete store.hasCredentials[realmId]
    await this.store.save(store)
  }
}
