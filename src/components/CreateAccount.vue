<template>
  <main class="main pb-4">
    <div class="container-fluid top-bar"></div>
    <div class="container mt-5">
      <section class="top-column column">
        <h1 class="welcome-user">Créer mon portefeuille</h1>
      </section>
    </div>
    <div class="container">
      <div class="columns id-tablet">
        <div class="column">
          <div class="card">
            <div class="card-content">
              <div class="tabs is-toggle is-toggle-rounded">
                <ul>
                  <template v-for="(backend, index) in unconfiguredBackends">
                    <li
                      v-bind:class="{
                        'is-active': form.accountBackend === backend,
                      }"
                      @click="form.accountBackend = backend"
                    >
                      <a>
                        <span>{{ backend }}</span>
                      </a>
                    </li>
                  </template>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="columns is-tablet">
        <div class="column">
          <div class="card">
            <div class="card-content">
              <p class="mb-3">
                Veuillez renseigner un mot de passe (et le confirmer) pour votre
                nouveau compte {{ form.accountBackend }}.
              </p>
              <p class="mb-3">
                Ce mot de passe est différent de votre mot de passe Monujo, il
                concerne uniquement votre portefeuille
                {{ form.accountBackend }}.
              </p>
              <p class="notification is-danger">
                Attention, ce mot de passe n'est pas récupérable, alors veillez
                à le garder dans un endroit sûr et accessible.
              </p>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="card">
            <div class="card-content">
              <div class="field">
                <label class="label">Mot de passe</label>
                <div class="control has-icons-left has-icons-right">
                  <input
                    class="input"
                    autocomplete="new-password"
                    v-bind:class="{
                      'is-danger': hasError('accountPassword'),
                      'is-success':
                        !hasError('accountPassword') &&
                        form.accountPassword.length > 1,
                    }"
                    type="password"
                    placeholder="Mot de passe"
                    v-model="form.accountPassword"
                    :disabled="useSimplifiedAuth"
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-key"></i>
                  </span>
                  <span
                    v-if="hasError('accountPassword')"
                    class="icon is-small is-right"
                  >
                    <i class="fas fa-exclamation-triangle"></i>
                  </span>
                </div>
                <p v-if="hasError('accountPassword')" class="help is-danger">
                  <template v-for="err in form.errors.accountPassword">
                    <div>{{ err }}</div>
                  </template>
                </p>
              </div>

              <div class="field">
                <label class="label">Confirmation du mot de passe</label>
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
                    placeholder="Confirmation du mot de passe"
                    v-model="form.accountPasswordConfirm"
                    :disabled="useSimplifiedAuth"
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-key"></i>
                  </span>
                  <span
                    v-if="hasError('accountPasswordConfirm')"
                    class="icon is-small is-right"
                  >
                    <i class="fas fa-exclamation-triangle"></i>
                  </span>
                </div>
                <p
                  v-if="hasError('accountPasswordConfirm')"
                  class="help is-danger"
                >
                  {{ form.errors.accountPasswordConfirm[0] }}
                </p>
              </div>

              <div class="card-content">
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
                    Créer mon portefeuille
                  </button>
                </div>
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
  import { LokAPIExc } from "@/services/lokapiService"
  import AuthPref from "@/components/AuthPref.vue"
  @Options({
    name: "CreateAccount",
    components: { AuthPref },
    async created() {
      const accountAuth = await this.$auth.getAccountAuth("new")
      this.handler = markRaw(accountAuth.authPrefHandler)
    },
    mounted() {
      if (this.unconfiguredBackends.length === 0) {
        this.$router.push("/")
      }
      if (this.unconfiguredBackends.length === 1) {
        this.form.accountBackend = this.unconfiguredBackends[0]
      }
    },
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
      }
    },
    watch: {
      unconfiguredBackends(newval, oldval): void {
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
      unconfiguredBackends(): object {
        return this.$store.getters.getUnconfiguredBackends()
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
    },
    methods: {
      async checkPasswordField(fieldname: string, accountBackend: string) {
        this.form.errors[fieldname] = await this.$store.dispatch(
          "checkPasswordStrength",
          [this.form[fieldname], this.form["accountBackend"]]
        )
      },
      checkIsSame(fieldOne: string, fieldTwo: string): void {
        if (this.form[fieldOne] !== this.form[fieldTwo]) {
          this.form.errors[fieldOne] = [
            "Le mot de passe entré n'est pas identique",
          ]
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
      async createUserAccount() {
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
              "Création de compte interrompue inopinément." +
                "Veuillez ré-éssayer ou contacter votre administrateur"
            )

            return // stay on page
          }
          this.$msg.warning("Compte déjà créé")
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
              "L'enregistrement des préférences de l'authentification simplifiée ne s'est pas déroulée correctement... " +
                "Veuillez ré-éssayer dans l'écran de préférences ou contacter votre administrateur"
            )
          }
        }
        this.$router.push({ name: "dashboard" })
      },
    },
  })
  export default class CreateAccount extends Vue {}
</script>
<style lang="scss" scoped>
  .auth-card {
    margin-top: 10px;
  }
</style>
