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
                  <template v-for="backend, index in availableBackends">
                  <li
                    v-if="isUnconfigured(backend)"
                    v-bind:class="{
                      'is-active': form.walletBackend === backend
                    }"
                    @click="form.walletBackend = backend"
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
              <p class="mb-3">Veuillez renseigner un mot de passe (et le confirmer) pour votre nouveau compte {{ form.walletBackend }}.</p>
              <p class="mb-3">Ce mot de passe est différent de votre mot de passe Monetujo, il concerne uniquement votre portefeuille {{ form.walletBackend }}.</p>
              <p class="notification is-danger">
                Attention, ce mot de passe n'est pas récupérable, alors veillez à le garder dans un endroit sûr et accessible.
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
                      'is-danger': hasError('walletPassword'),
                      'is-success': !hasError('walletPassword') && form.walletPassword.length > 1
                    }"
                    type="password"
                    placeholder="Mot de passe"
                    v-model="form.walletPassword"
                  >
                  <span class="icon is-small is-left">
                    <i class="fas fa-key"></i>
                  </span>
                  <span v-if="hasError('walletPassword')" class="icon is-small is-right">
                    <i class="fas fa-exclamation-triangle"></i>
                  </span>
                </div>
                <p v-if="hasError('walletPassword')" class="help is-danger">
                  <template v-for="err in form.errors.walletPassword">
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
                      'is-danger': hasError('walletPasswordConfirm'),
                      'is-success': !hasError('walletPasswordConfirm') && form.walletPasswordConfirm.length > 1
                    }"
                    type="password"
                    placeholder="Confirmation du mot de passe"
                    v-model="form.walletPasswordConfirm"
                  >
                  <span class="icon is-small is-left">
                    <i class="fas fa-key"></i>
                  </span>
                  <span v-if="hasError('walletPasswordConfirm')" class="icon is-small is-right">
                    <i class="fas fa-exclamation-triangle"></i>
                  </span>
                <p v-if="hasError('walletPasswordConfirm')" class="help is-danger">{{ form.errors.walletPasswordConfirm[0] }}</p>

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

@Options({
  name:"CreateWallet",
  mounted() {
    if (this.unconfiguredBackends.length === 1) {
      this.form.walletBackend = this.unconfiguredBackends[0]
    }
  },
  data() {
    return {
      form: {
        walletBackend: 'comchain',
        walletPassword: '',
        walletPasswordConfirm: '',
        errors: {
          walletPassword: [],
          walletPasswordConfirm: []
        }
      }
    }
  },
  watch: {
    unconfiguredBackends(newval, oldval): void {
      if (newval.length === 1) {
        this.form.walletBackend = newval[0]
      }
    },
    "form.walletPassword": function (): void {
      this.checkPasswordField('walletPassword')
      this.checkIsSame('walletPasswordConfirm', 'walletPassword')
    },
    "form.walletPasswordConfirm": function (): void {
      this.checkIsSame('walletPasswordConfirm', 'walletPassword')
    }
  },
  computed: {
    unconfiguredBackends(): object {
      return this.$store.getters.getUnconfiguredBackends()
    },
    availableBackends(): object {
      return this.$store.state.lokapi.availableBackends
    },
    hasFieldErrors(): boolean {
      if (this.form.walletPassword.length === 0 || this.form.walletPasswordConfirm.length === 0)
        return true
      return Object.keys(this.form.errors).filter(field => {
        return this.form.errors[field].length > 0
      }).length > 0
    }
  },
  methods: {
    async checkPasswordField(fieldname: string) {
      this.form.errors[fieldname] = await this.$store.dispatch("checkPasswordStrength", this.form[fieldname])
    },
    checkIsSame(fieldOne:string, fieldTwo:string): void {
      if (this.form[fieldOne] !== this.form[fieldTwo]) {
        this.form.errors[fieldOne] = ["Le mot de passe entré n'est pas identique"]
      } else {
        this.form.errors[fieldOne] = []
      }
    },
    isUnconfigured(backend: string): boolean {
      return this.unconfiguredBackends.indexOf(backend) > -1
    },
    hasError(field: string): boolean {
      return this.form.errors[field].length > 0
    }
  },
  props: {
  },
  components: {},
})
export default class CreateWallet extends Vue {}
</script>