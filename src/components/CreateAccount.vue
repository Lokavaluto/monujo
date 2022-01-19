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
                  <template v-for="backend, index in unconfiguredBackends">
                    <li
                      v-bind:class="{
                        'is-active': form.accountBackend === backend
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
                Veuillez renseigner un mot de passe (et le confirmer)
                pour votre nouveau compte {{ form.accountBackend
                }}.
              </p>
              <p class="mb-3">
                Ce mot de passe est différent de votre mot de passe
                Monujo, il concerne uniquement votre portefeuille {{
                  form.accountBackend }}.
              </p>
              <p class="notification is-danger">
                Attention, ce mot de passe n'est pas récupérable,
                alors veillez à le garder dans un endroit sûr et
                accessible.
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
                      'is-success': !hasError('accountPassword') && form.accountPassword.length > 1
                    }"
                    type="password"
                    placeholder="Mot de passe"
                    v-model="form.accountPassword"
                  >
                  <span class="icon is-small is-left">
                    <i class="fas fa-key"></i>
                  </span>
                  <span v-if="hasError('accountPassword')" class="icon is-small is-right">
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
                    class="input"
                    autocomplete="new-password"
                    v-bind:class="{
                      'is-danger': hasError('accountPasswordConfirm'),
                      'is-success': !hasError('accountPasswordConfirm') && form.accountPasswordConfirm.length > 1
                    }"
                    type="password"
                    placeholder="Confirmation du mot de passe"
                    v-model="form.accountPasswordConfirm"
                  >
                  <span class="icon is-small is-left">
                    <i class="fas fa-key"></i>
                  </span>
                  <span v-if="hasError('accountPasswordConfirm')" class="icon is-small is-right">
                    <i class="fas fa-exclamation-triangle"></i>
                  </span>
                </div>
                <p v-if="hasError('accountPasswordConfirm')" class="help is-danger">{{ form.errors.accountPasswordConfirm[0] }}</p>
              </div>

              <div class="field" v-if="!hasFieldErrors">
                <div class="control">
                  <button class="button is-primary" @click="createUserAccount()">Créer mon portefeuille</button>
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
  import { Options, Vue } from 'vue-class-component';
  import router from "@/router/index"
  import { LokAPIExc } from "@/services/lokapiService"

  @Options({
    name:"CreateAccount",
    mounted() {
      if (this.unconfiguredBackends.length === 0) {
        router.push('/')
      }
      if (this.unconfiguredBackends.length === 1) {
        this.form.accountBackend = this.unconfiguredBackends[0]
      }
    },
    data() {
      return {
        form: {
          accountBackend: '',
          accountPassword: '',
          accountPasswordConfirm: '',
          errors: {
            accountPassword: [],
            accountPasswordConfirm: []
          }
        }
      }
    },
    watch: {
      unconfiguredBackends(newval, oldval): void {
        if (newval.length === 1) {
          this.form.accountBackend = newval[0]
        }
      },
      "form.accountPassword": function (): void {
        this.checkPasswordField('accountPassword')
        this.checkIsSame('accountPasswordConfirm', 'accountPassword')
      },
      "form.accountPasswordConfirm": function (): void {
        this.checkIsSame('accountPasswordConfirm', 'accountPassword')
      }
    },
    computed: {
      unconfiguredBackends(): object {
        return this.$store.getters.getUnconfiguredBackends()
      },
      hasFieldErrors(): boolean {
        if (this.form.accountPassword.length === 0 || this.form.accountPasswordConfirm.length === 0)
          return true
        return Object.keys(this.form.errors).filter(field => {
          return this.form.errors[field].length > 0
        }).length > 0
      }
    },
    methods: {
      async checkPasswordField(fieldname: string, accountBackend: string) {
        this.form.errors[fieldname] = await this.$store.dispatch(
          "checkPasswordStrength", [this.form[fieldname], this.form['accountBackend']])
      },
      checkIsSame(fieldOne:string, fieldTwo:string): void {
        if (this.form[fieldOne] !== this.form[fieldTwo]) {
          this.form.errors[fieldOne] = ["Le mot de passe entré n'est pas identique"]
        } else {
          this.form.errors[fieldOne] = []
        }
      },
      hasError(field: string): boolean {
        return this.form.errors[field].length > 0
      },
      async createUserAccount() {
        try {
          await this.$store.dispatch(
            "createUserAccount", [this.form['accountPassword'], this.form['accountBackend']])
        } catch(err) {
          console.error("Something went wrong on createUserAccount request", err)
          if (!(err instanceof LokAPIExc.UserAccountAlreadyExists)) {
            this.$toast.error(
              "Création de compte interrompue inopinément." +
                "Veuillez ré-éssayer ou contacter votre administrateur",
              { position: "top" }
            )
            return // stay on page
          }
          this.$toast.warning("Compte déjà créé")
        }
        router.push('/profile')
      }
    },
    props: {
    },
    components: {},
  })
  export default class CreateAccount extends Vue {}
</script>