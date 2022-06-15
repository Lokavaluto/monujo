import { LokAPIBrowserAbstract, e, t } from "@lokavaluto/lokapi-browser"

/**
 * Store
 */

interface IConfigStore {
  load(): Promise<{}>
  save(config: {}): Promise<void>
}

export class PersistentConfigStore implements IConfigStore {
  private label: string
  private store: t.IPersistentStore
  constructor(persistentStore: t.IPersistentStore, label: string) {
    this.store = persistentStore
    this.label = label
  }
  async load(): Promise<any> {
    const storedString = this.store.get(this.label)
    let storedData = null
    if (storedString) {
      try {
        storedData = JSON.parse(storedString)
      } catch (err) {
        console.error("Invalid configuration stored. Ignoring.")
      }
    }
    return storedData
  }

  async save(data: any): Promise<void> {
    this.store.set(this.label, JSON.stringify(data))
  }
}

/**
 * Auth Handlers
 */

abstract class AbstractAuthHandler {
  accountAuthService: AccountAuthService
  configDef: any
  userConfig: any
  Ui: any

  constructor(accountAuthService: AccountAuthService, Ui: any, data: any) {
    this.accountAuthService = accountAuthService
    this.Ui = Ui
    this.configDef = data[0]
    this.userConfig = data[1]
  }

  abstract inferKey(creds: any): Promise<{}>
  get configs() {
    return [this.configDef, this.userConfig]
  }
  static flush() {
    // Placeholder for flushing all memory stores
  }
}

abstract class AbstractAuthHandlerWrapper extends AbstractAuthHandler {
  get subHandler() {
    const subConfig = this.configDef?.subConfig
    if (!subConfig) {
      throw new Error(
        "Invalid config for Retention plugin: no 'subConfig' value."
      )
    }
    if (!(subConfig instanceof Array)) {
      throw new Error(
        "Invalid config for Retention plugin: 'subConfig' value is not an array."
      )
    }
    if (subConfig.length !== 2) {
      throw new Error(
        "Invalid config for Retention plugin: 'subConfig' array should only have 2 values."
      )
    }
    const subAuthConfigs = [subConfig[1], this.userConfig?.subConfig]
    const { Handler, Ui } =
      this.accountAuthService.authService.AuthRegistry[subConfig[0]]
    return new Handler(this.accountAuthService, Ui, subAuthConfigs)
  }
}

export class DirectAuthHandler extends AbstractAuthHandler {
  async checkUserInput(userInput: string): Promise<any> {
    // nothing to check locally
    return true
  }
  async inferKey(userInput: { password: string }): Promise<any> {
    return userInput.password
  }
}

export class RetentionAuthHandler extends AbstractAuthHandlerWrapper {
  static globalRetentionMemStore: any = {}

  async checkUserInput(userInput: string = ""): Promise<boolean> {
    // we actually don't have user input
    const configId = this.accountAuthService.configId
    if (typeof configId !== "string") return false
    const AccountRetentionStore: any =
      RetentionAuthHandler.globalRetentionMemStore[configId] || {}
    const { lastCredsInput } = AccountRetentionStore
    const lastInputTime = AccountRetentionStore.lastInputTime || 0
    if (
      lastCredsInput &&
      lastInputTime + this.configDef.time * 1000 > Date.now()
    ) {
      return true
    }
    // No valid pwd, so we make sure the pwd is reset and ask for it
    // again
    RetentionAuthHandler.globalRetentionMemStore[configId] = {}
    return false
  }
  async inferKey(userInput?: any): Promise<{}> {
    const configId = this.accountAuthService.configId
    if (typeof configId !== "string") throw Error("YYYvlab, Typing error")
    const AccountRetentionStore: any =
      RetentionAuthHandler.globalRetentionMemStore[configId] || {}
    if (typeof userInput === "undefined") {
      userInput = AccountRetentionStore.lastCredsInput
    }
    RetentionAuthHandler.globalRetentionMemStore[configId] = {
      lastCredsInput: userInput,
      lastInputTime: Date.now(),
    }
    return userInput
  }
  static flush() {
    RetentionAuthHandler.globalRetentionMemStore = {}
  }
}

type TAuthRegistry = {
  [k: string]: {
    Handler: (new (...args: any[]) => AbstractAuthHandler) & {
      flush: () => void
    }
    Ui: {
      Challenge: new (...args: any[]) => any
    }
  }
}

export class AuthService {
  private store: IConfigStore
  private configDef: [string, any]
  public AuthRegistry: TAuthRegistry
  constructor(
    configDef: [string, any],
    store: IConfigStore,
    AuthRegistry: TAuthRegistry
  ) {
    this.configDef = configDef || [
      "Retention",
      {
        time: 900,
        subConfig: ["Direct", {}],
      },
    ]
    this.store = store
    this.AuthRegistry = AuthRegistry
  }

  /**
   * Allow interface to query for configuration, this will return
   * both config definition and user config.
   */
  public async getConfigs(): Promise<[any, any]> {
    const userConfig = await this.store.load()
    return [this.configDef || [null, null], userConfig || {}]
  }

  async setUserConfig(config: {}): Promise<void> {
    this.store.save(config)
  }

  async _requestCredentials(state: any, configs: any) {
    console.error(
      `No callback was registered with '$auth.registerRequestCredentials(..)'. Ignoring.`
    )
    return false
  }
  registerRequestCredentials(requestCredentialsFn: any) {
    this._requestCredentials = requestCredentialsFn
  }

  async getAccountAuth(configId: string) {
    const [configDef, userConfig] = await this.getConfigs()
    const configs = [configDef, userConfig[configId]]
    return new AccountAuthService(this, configId, configs as [any, any])
  }

  flush(): void {
    for (const defRegistry of Object.values(this.AuthRegistry)) {
      defRegistry.Handler.flush()
    }
  }
}

export class AccountAuthService {
  authService: AuthService
  configId: string
  configs: [any, any]
  private _secret: false | string = false

  constructor(authService: AuthService, configId: string, configs: [any, any]) {
    this.authService = authService
    this.configId = configId
    this.configs = configs
  }

  get secret() {
    if (this._secret === false) {
      throw new Error("Secret was not yet provided.")
    }
    return this._secret
  }
  set secret(value) {
    this._secret = value
  }

  async setUserConfig(config: {}): Promise<void> {
    const [_configDef, userConfig] = await this.authService.getConfigs()
    userConfig[this.configId] = config
    await this.authService.setUserConfig(userConfig)
  }

  /**
   * Triggers user request credential using local config or direct
   * password if no local config was yet saved.
   *
   * Authentication challenge will require to default to simpler direct
   * authentication system.
   */
  async requestCredentials(state: any): Promise<{}> {
    return await this.authService._requestCredentials(
      state,
      this.authChallengeHandler
    )
  }

  private mkAuthHandlerFromConfig(configs: any) {
    const [configDef, userConfig] = configs
    const pluginName = configDef[0]
    const { Handler, Ui } = this.authService.AuthRegistry[pluginName]
    if (!Handler) {
      throw new Error(`Handler '${pluginName}' not found.`)
    }
    const subUserConfig = userConfig ? userConfig.subConfig : null
    return new Handler(this, Ui, [configDef[1], subUserConfig])
  }

  get authPrefHandler() {
    return this.mkAuthHandlerFromConfig(this.configs)
  }

  get authChallengeHandler() {
    const [configDef, userConfig] = this.configs
    const configs = userConfig
      ? this.configs
      : [
          [
            "Retention",
            {
              time: 900,
              subConfig: ["Direct", {}],
            },
          ],
          null,
        ]
    return this.mkAuthHandlerFromConfig(configs)
  }

  get userConfig() {
    return this.configs[1]
  }
  get configDef() {
    return this.configs[0]
  }
}
