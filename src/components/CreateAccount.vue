<template>
  <main class="main pb-4">
    <div v-if="getUnconfiguredBackends().length > 1" class="container">
      <div class="columns mt-5">
        <div class="column">
          <div class="card custom-card-wallet">
            <div class="">
              <ul>
                <template v-for="(backend, index) in getUnconfiguredBackends()">
                  <div
                    v-bind:class="{
                      'is-wallet-active': form.accountBackend === backend,
                    }"
                    @click="form.accountBackend = backend"
                    class="
                      button
                      is-wallet
                      has-text-weight-medium
                      is-rounded
                      ml-3
                    "
                  >
                    <li>
                      <a class="wallet-tab">
                        <div>{{ backend }}</div>
                      </a>
                    </li>
                  </div>
                </template>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container mt-5">
      <div class="columns">
        <div class="column">
          <div class="card custom-card">
            <div class="card-content" role="radiogroup">
              <div class="custom-card-title">
                {{
                  canImport
                    ? $gettext("Create or import my wallet")
                    : $gettext("Create my wallet")
                }}
              </div>

              <div
                :class="{
                  notification: canImport && walletAction === 'create',
                  'wallet-option': canImport,
                }"
              >
                <label class="radio radio-title mt-2 mb-2">
                  <input
                    v-if="canImport"
                    type="radio"
                    name="walletAction"
                    value="create"
                    v-model="walletAction"
                  />
                  <span
                    v-if="canImport"
                    :class="{ 'custom-card-title': !canImport }"
                    class="ml-2"
                  >
                    {{ $gettext("Create my wallet") }}
                  </span>
                </label>

                <transition name="fold">
                  <div
                    v-if="walletAction === 'create'"
                    :class="{ 'section-body': canImport }"
                  >
                    <p class="mb-3">
                      {{
                        $gettext(
                          "Choose the password for your wallet. It is different " +
                            "from your user account password and is only related to " +
                            "your wallet."
                        )
                      }}
                    </p>

                    <div class="field">
                      <div class="control has-icons-left has-icons-right">
                        <PasswordField
                          :password="form.accountPassword"
                          @update:password="(x) => (form.accountPassword = x)"
                          autocomplete="new-password"
                          v-bind:class="{
                            'is-danger': hasError('accountPassword'),
                            'is-success':
                              !hasError('accountPassword') &&
                              form.accountPassword.length > 1,
                          }"
                          :disabled="useSimplifiedAuth"
                          :icon-right="
                            hasError('accountPassword')
                              ? 'triangle-exclamation'
                              : null
                          "
                        />
                      </div>
                      <p
                        v-if="hasError('accountPassword')"
                        class="help is-danger"
                      >
                        <template v-for="err in form.errors.accountPassword">
                          <div>{{ err }}</div>
                        </template>
                      </p>
                    </div>

                    <div class="field">
                      <div class="control has-icons-left has-icons-right">
                        <input
                          @keyup.enter="createUserAccount"
                          class="input"
                          autocomplete="new-password"
                          v-bind:class="{
                            'is-danger': hasError('accountPasswordConfirm'),
                            'is-success':
                              !hasError('accountPasswordConfirm') &&
                              form.accountPasswordConfirm.length > 1,
                          }"
                          type="password"
                          :placeholder="$gettext('Password confirmation')"
                          v-model="form.accountPasswordConfirm"
                          :disabled="useSimplifiedAuth"
                        />
                        <span class="icon is-small is-left"
                          ><fa-icon icon="key"
                        /></span>
                        <span
                          v-if="hasError('accountPasswordConfirm')"
                          class="icon is-small is-right"
                        >
                          <fa-icon icon="triangle-exclamation" />
                        </span>
                      </div>
                      <p
                        v-if="hasError('accountPasswordConfirm')"
                        class="help is-danger"
                      >
                        {{ form.errors.accountPasswordConfirm[0] }}
                      </p>
                    </div>

                    <div class="card-content p-0" v-if="!hasFieldErrors">
                      <AuthPref
                        :handler="handler"
                        :requestCredentials="requestCredentials"
                        :disabled="hasFieldErrors"
                        @saveConfig="saveSimplifiedAuthPref"
                      />
                    </div>

                    <div class="field">
                      <div class="control">
                        <button
                          class="button is-primary"
                          @click="createUserAccount()"
                          :disabled="hasFieldErrors"
                        >
                          {{ $gettext("Create my wallet") }}
                        </button>
                      </div>
                    </div>

                    <p class="notification is-warning is-light mb-2">
                      <span class="icon is-small">
                        <fa-icon icon="triangle-exclamation" />
                      </span>
                      {{
                        $gettext(
                          "Please note that this password can not be retrieved, " +
                            "so be sure to keep it in a safe and reachable place."
                        )
                      }}
                    </p>
                  </div>
                </transition>
              </div>
              <div
                class="wallet-option"
                v-if="canImport"
                :class="{ notification: walletAction === 'import' }"
              >
                <label class="radio radio-title mt-2 mb-2">
                  <input
                    type="radio"
                    name="walletAction"
                    value="import"
                    v-model="walletAction"
                  />
                  <span class="ml-2">
                    {{ $gettext("Import an existing wallet") }}
                  </span>
                </label>

                <transition name="fold">
                  <div
                    v-if="walletAction === 'import' && canImport"
                    class="section-body"
                  >
                    <div
                      v-for="configurableBackend in configurableBackends"
                      :key="configurableBackend"
                      class="mb-3"
                    >
                      <input
                        class="fileInput"
                        type="file"
                        @change="
                          (e) =>
                            registerWalletHandle(e, configurableBackend.backend)
                        "
                        style="display: none"
                      />

                      <button
                        class="button is-primary ml-2 mt-2"
                        id="import-wallet"
                        @click="triggerFileInput"
                        v-html="
                          configurableBackends.length > 1
                            ? $gettextInterpolate(
                                $gettext(
                                  'Upload&nbsp;<b>%{ backendName }</b>&nbsp;wallet file...'
                                ),
                                {
                                  backendName:
                                    configurableBackend.backend.jsonData.type.split(
                                      ':'
                                    )[0],
                                }
                              )
                            : $gettext('Upload wallet file...')
                        "
                      ></button>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
  import { markRaw } from "vue"
  import { Options, Vue } from "vue-class-component"
  import { UIError } from "@/exception"
  import { LokAPIExc } from "@/services/lokapiService"
  import AuthPref from "@/components/AuthPref.vue"
  import PasswordField from "@/components/PasswordField.vue"
  import { mapGetters } from "vuex"
  import { debounceMethod } from "@/utils/debounce"
  import applyDecorators from "@/utils/applyDecorators"
  import { showSpinnerMethod } from "@/utils/showSpinner"

  @Options({
    name: "CreateAccount",
    components: { AuthPref, PasswordField },
    data() {
      return {
        handler: false,
        useSimplifiedAuth: false,
        form: {
          accountBackend: "",
          accountPassword: "",
          accountPasswordConfirm: "",
          errors: {
            accountPassword: [],
            accountPasswordConfirm: [],
          },
        },
        configurableBackends: [],
        walletAction: "create" as "create" | "import",
      }
    },
    async created() {
      const accountAuth = await this.$auth.getAccountAuth("new")
      this.handler = markRaw(accountAuth.authPrefHandler)
    },
    async mounted() {
      const unconfiguredBackends = this.getUnconfiguredBackends()
      if (unconfiguredBackends.length === 0) {
        this.$router.push("/")
        return
      }
      this.form.accountBackend = unconfiguredBackends[0]

      for (const backend of Object.values(this.getBackends()) as {
        isUnconfigured(): Promise<boolean>
      }[]) {
        const isUnconfigured = await backend.isUnconfigured()
        if (isUnconfigured) {
          this.configurableBackends.push({ backend })
        }
      }
    },

    // of backends as { isUnconfigured(): Promise<boolean> }[]
    watch: {
      getUnconfiguredBackends(newval, oldval): void {
        if (newval.length === 1) {
          this.form.accountBackend = newval[0]
        }
      },
      "form.accountPassword": function (): void {
        this.checkPasswordField("accountPassword")
        this.checkIsSame("accountPasswordConfirm", "accountPassword")
      },
      "form.accountPasswordConfirm": function (): void {
        this.checkIsSame("accountPasswordConfirm", "accountPassword")
      },
    },
    computed: {
      canImport(): boolean {
        return (
          this.configurableBackends?.length > 0 &&
          !this.$config.disableImportWallet
        )
      },
      hasFieldErrors(): boolean {
        if (
          this.form.accountPassword.length === 0 ||
          this.form.accountPasswordConfirm.length === 0
        )
          return true
        return (
          Object.keys(this.form.errors).filter((field) => {
            return this.form.errors[field].length > 0
          }).length > 0
        )
      },
      requestCredentials() {
        return () => {
          if (this.hasFieldErrors)
            throw Error(
              "This action should not be triggerable when there are still form errors."
            )
          this.useSimplifiedAuth = true
          return this.form.accountPassword
        }
      },

      ...mapGetters(["getUnconfiguredBackends", "getBackends"]),
    },
    methods: {
      async readFileAsText(file: any) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => reject(reader.error)
          reader.readAsText(file)
        })
      },

      triggerFileInput(event: any) {
        event.target.parentElement.parentElement
          .querySelector("input[type=file]")
          .click()
      },
      registerWalletHandle: applyDecorators(
        [showSpinnerMethod(".main")],
        async function (
          this: any,
          event: any,
          backend: any
        ): Promise<Boolean | undefined> {
          const file = event.target.files[0]
          if (!file) {
            // This doesn't happen even if user has canceled dialog
            // and it is not clear when this actually occurs.
            console.log("Unexpectedly received no file. Ignoring.")
            return
          }

          let fileContent: unknown
          try {
            fileContent = await this.readFileAsText(file)
          } catch (err) {
            throw new UIError(
              this.$gettext("Failed to read the file contents"),
              err
            )
          }
          if (typeof fileContent !== "string")
            // typeguard
            throw new UIError(this.$gettext("Unexpected type of file"), null)
          let fileData: any
          try {
            fileData = JSON.parse(fileContent)
          } catch (err) {
            throw new UIError(this.$gettext("Unexpected format of file"), err)
          }
          try {
            await backend.registerWallet(fileData)
          } catch (err: any) {
            if (err.message === "User canceled the dialog box") {
              return false
            }
            throw new UIError(
              this.$gettext("Wallet registration unexpectedly failed") +
                " " +
                this.$gettext("Please try again or contact your administrator"),
              err
            )
          }
          this.$lokapi.clearBackendCache()
          this.$store.dispatch("setBackends")
          this.$store.dispatch("fetchAccounts")

          this.$router.push("/")
        }
      ),
      async checkPasswordField(fieldname: string, accountBackend: string) {
        this.form.errors[fieldname] = await this.$store.dispatch(
          "checkPasswordStrength",
          [this.form[fieldname], this.form["accountBackend"]]
        )
      },
      checkIsSame(fieldOne: string, fieldTwo: string): void {
        if (this.form[fieldOne] !== this.form[fieldTwo]) {
          this.form.errors[fieldOne] = [this.$gettext("Passwords do not match")]
        } else {
          this.form.errors[fieldOne] = []
        }
      },
      hasError(field: string): boolean {
        return this.form.errors[field].length > 0
      },
      saveSimplifiedAuthPref(accountAuthService: any, userConfigInput: any) {
        this.userAuthPref = [accountAuthService, userConfigInput]
      },
      createUserAccount: applyDecorators(
        [debounceMethod, showSpinnerMethod(".main")],
        async function (this: any): Promise<void> {
          let userAccount
          try {
            userAccount = await this.$store.dispatch("createUserAccount", [
              this.form["accountPassword"],
              this.form["accountBackend"],
            ])
          } catch (err) {
            console.error(
              "Something went wrong on createUserAccount request",
              err
            )
            if (!(err instanceof LokAPIExc.UserAccountAlreadyExists)) {
              this.$msg.error(
                this.$gettext("Wallet creation unexpectedly failed.") +
                  " " +
                  this.$gettext(
                    "Please try again or contact your administrator"
                  )
              )

              return // stay on page
            }
            this.$msg.warning(this.$gettext("Wallet already created"))
          }

          if (this.userAuthPref) {
            try {
              const [accountAuthService, userConfigInput] = this.userAuthPref
              accountAuthService.configId = userAccount.internalId
              await accountAuthService.setUserConfig(userConfigInput)
            } catch (err) {
              console.error(
                "Something went wrong on createUserAccount request",
                err
              )
              this.$msg.error(
                this.$gettext(
                  "Settings for simplified authentication were not saved correctly... " +
                    'Please try again in the "Settings" page or contact your administrator'
                )
              )
            }
          }
          this.$store.dispatch("fetchComponentDefs")
          this.$router.push({ name: "dashboard" })
        }
      ),
    },
  })
  export default class CreateAccount extends Vue {}
</script>
<style lang="scss" scoped>
  @import "@/assets/custom-variables";
  .auth-card {
    margin-top: 10px;
  }
  .is-wallet {
    color: $btn-top-up-text-color !important;
    border-color: $btn-top-up-border-color !important;
    background: $color-2;
    opacity: 0.7;
  }
  .is-wallet-active {
    color: $btn-top-up-text-color !important;
    border-color: $btn-top-up-border-color !important;
    background: $color-2;
    opacity: 1;
  }
  .wallet-tab {
    background-color: $color-1;
    color: #ffffff;
  }
  .wallet-tab:hover {
    color: #ffffff;
  }
  .custom-card-wallet {
    border-radius: 16px !important;
    padding: 0.8em;
  }

  #import-wallet {
    position: relative;
    bottom: 0.4em;
  }
  .radio-title {
    display: flex;
    align-items: center;
  }
  .section-body {
    margin-left: 1rem;
  }

  .fold-enter-active,
  .fold-leave-active {
    transition: max-height 0.8s ease, opacity 0.8s ease;
    overflow: hidden;
  }

  .fold-enter-from,
  .fold-leave-to {
    max-height: 0;
    opacity: 0;
  }

  .fold-enter-to,
  .fold-leave-from {
    max-height: 1000px;
    opacity: 1;
  }
  .wallet-option {
    padding: 0.7em;
    border-radius: 0.5rem;
  }
  label.label {
    color: hsl(0, 0%, 21%);
    display: block;
    font-size: 1rem;
    font-weight: normal;
  }
  .column {
    max-width: 50em;
  }
  .columns {
    justify-content: center;
  }
  .custom-card-title {
    font-weight: 500;
  }
  .custom-notification {
    background-color: #ff4444ff;
    border-radius: 4px;
    position: relative;
    padding: 1.25rem 2.5rem 1.25rem 1.5rem;
  }
</style>
