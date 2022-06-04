<template>
  <section id="login">
    <div class="login-container">
      <div class="card">
        <img :src="$config.loginLogoUrl" class="pt-2 pb-5" />
        <form @submit.prevent="submit">
          <div class="field mb-5">
            <p class="control has-icons-left has-icons-right">
              <input
                v-model.trim="email"
                class="input"
                placeholder="Courriel"
              />
              <span class="icon is-small is-left">
                <i class="fas fa-envelope"></i>
              </span>
              <span class="icon is-small is-right">
                <i class="fas fa-check"></i>
              </span>
            </p>
          </div>
          <div class="field mb-2">
            <p class="control has-icons-left">
              <input
                v-model="password"
                class="input"
                type="password"
                placeholder="Mot de passe"
              />
              <span class="icon is-small is-left">
                <i class="fas fa-lock"></i>
              </span>
            </p>
          </div>
          <div class="forgot-password mb-4">
            <button @click="openResetPasswordUrl()" type="button">
              Mot de passe oublié ?
            </button>
          </div>
          <div class="login-buttons">
            <div>
              <p class="control has-text-centered">
                <button type="submit" class="button is-login">
                  Se connecter
                </button>
              </p>
            </div>
            <div>
              <p class="control has-text-centered">
                <button
                  @click="openSignupUrl()"
                  type="button"
                  class="button create-account"
                >
                  Créer un compte
                </button>
              </p>
            </div>
          </div>
          <p class="has-text-danger has-text-centered" v-if="fail">
            {{ fail }}
          </p>
        </form>
      </div>
    </div>
    <router-view></router-view>
  </section>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { RestExc } from "@lokavaluto/lokapi-browser"
  import { e as RequestExc } from "@0k.io/types-request"

  @Options({
    name: "Login",
    data() {
      return {
        email: "",
        password: "",
        fail: "",
        success: "",
      }
    },
    mounted() {
      this.email = this.$persistentStore.get("loginEmail")
    },
    methods: {
      openResetPasswordUrl(): void {
        window.open(this.$store.getters.getOdooUrl() + "/web/reset_password")
      },
      openSignupUrl(): void {
        window.open(this.$store.getters.getOdooUrl() + "/web/signup")
      },
      async submit(): Promise<void> {
        try {
          this.$loading.show()
          await this.$store.dispatch("login", {
            login: this.email,
            password: this.password,
          })
          this.success = "Connection réussie"
          this.$router.push({ name: "dashboard" })
          this.$persistentStore.set("loginEmail", this.email)
        } catch (e) {
          // { APIRequestFailed, InvalidCredentials }
          if (e instanceof RestExc.APIRequestFailed) {
            this.fail =
              "Refus du serveur distant, contactez votre administrateur"
            return
          }
          if (e instanceof RestExc.InvalidCredentials) {
            this.fail = "Identifiant ou mot de passe incorrect"
            return
          }
          if (e instanceof RequestExc.RequestFailed) {
            this.fail =
              "La requête a échoué, impossible de joindre le serveur distant."
            return
          }
          this.fail =
            "La requête s'est terminée de façon inattendue, impossible de joindre le serveur distant."
          throw e
        } finally {
          this.$loading.hide()
        }
      },
    },
  })
  export default class Login extends Vue {}
</script>
<style scoped lang="scss"></style>
