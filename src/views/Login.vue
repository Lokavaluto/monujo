<template>
  <section id="login">
    <div class="login-container">
      <div class="card">
        <img :src="$config.loginLogoUrl" class="pt-2 pb-5" />
        <form @submit.prevent="submit">
          <div class="field mb-5 has-addons">
            <p class="control has-icons-left is-expanded">
              <input
                v-model.trim="email"
                class="input"
                :placeholder="$gettext('Email')"
              />
              <span class="icon is-small is-left">
                <fa-icon icon="envelope" />
              </span>
            </p>
            <p class="control" v-if="biometryEnabled && biometryAvailable">
              <a class="button is-info">
                <fa-icon
                  icon="fingerprint"
                  @click="requestBiometricAuthentication()"
                />
              </a>
            </p>
          </div>
          <div class="field mb-2">
            <p class="control has-icons-left">
              <input
                v-model="password"
                class="input"
                type="password"
                :placeholder="$gettext('Password')"
              />
              <span class="icon is-small is-left">
                <fa-icon icon="lock" />
              </span>
            </p>
          </div>
          <div class="forgot-password mb-4">
            <button @click="openResetPasswordUrl()" type="button">
              {{ $gettext("Forgot password ?") }}
            </button>
          </div>
          <div class="login-buttons">
            <div>
              <p class="control has-text-centered">
                <button type="submit" class="button is-login">
                  {{ $gettext("Sign in") }}
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
                  {{ $gettext("Sign up") }}
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
        biometryEnabled: false, // User preference
        biometryAvailable: false, // Biometry available and credential saved
      }
    },
    async mounted() {
      this.biometryEnabled =
        (await this.hasBiometricCredentialsEnabled()) || false
      if (
        this.biometryEnabled &&
        (await this.hasBiometricCredentialsAvailable())
      ) {
        this.biometryAvailable = true
        await this.requestBiometricAuthentication()
      }
      this.email = this.$persistentStore.get("loginEmail")
    },
    methods: {
      openResetPasswordUrl(): void {
        window.open(this.$store.getters.getOdooUrl() + "/web/reset_password")
      },
      openSignupUrl(): void {
        window.open(this.$store.getters.getOdooUrl() + "/web/signup")
      },
      async hasBiometricCredentialsEnabled() {
        return (await this.$localSettings.load())?.biometryEnabled
      },
      async hasBiometricCredentialsAvailable() {
        return await this.$biometry.hasCredentialsAvailable("login")
      },
      async hasBiometricCredentials() {
        return (
          (await this.hasBiometricCredentialsEnabled()) &&
          (await this.hasBiometricCredentialsAvailable())
        )
      },
      async requestBiometricAuthentication(): Promise<void> {
        let credentials: any
        try {
          credentials = await this.$biometry.challenge("login")
        } catch (e) {
          console.log(e)
          credentials = false
        }
        if (credentials) {
          this.password = credentials.password
          this.email = credentials.username
          this.submit()
        }
      },
      async submit(): Promise<void> {
        try {
          this.$loading.show()
          await this.$store.dispatch("login", {
            login: this.email,
            password: this.password,
          })
          this.success = this.$gettext("Connection successful")
          this.$router.push({ name: "dashboard" })
          this.$persistentStore.set("loginEmail", this.email)
        } catch (e) {
          // { APIRequestFailed, InvalidCredentials }
          if (e instanceof RestExc.APIRequestFailed) {
            this.fail = this.$gettext(
              "Request refused by remote server. Contact your administrator"
            )
            return
          }
          if (e instanceof RestExc.InvalidCredentials) {
            this.fail = this.$gettext("Invalid credentials")
            return
          }
          if (e instanceof RequestExc.RequestFailed) {
            this.fail = this.$gettext("Request failed to remote server.")
            return
          }
          this.fail = this.$gettext(
            "Unexpected issue when attempting to connect to remote server."
          )
          throw e
        } finally {
          this.$loading.hide()
        }

        const biometryAvailable = await this.$biometry.isAvailable()
        if (!biometryAvailable) return

        const prefs = (await this.$localSettings.load()) || {}
        const biometryEnabled = prefs?.biometryEnabled
        if (biometryEnabled === false) return
        if (
          biometryEnabled === null ||
          typeof biometryEnabled === "undefined"
        ) {
          const answer = await this.$dialog.show({
            title: this.$gettext("Enable biometric login"),
            content: this.$gettext(
              "Would you like to use your device's biometric (fingerprint, face recognition, ...) capability to login ?"
            ),
            buttons: [
              { label: this.$gettext("Yes"), id: "yes" },
              { label: this.$gettext("No"), id: "no" },
              { label: this.$gettext("Ask me later"), id: "later" },
            ],
          })
          console.log(answer)
          if (answer === "later") return
          if (answer === "no") {
            prefs.biometryEnabled = false
            await this.$localSettings.save(prefs)
            return
          }
          prefs.biometryEnabled = true
          await this.$localSettings.save(prefs)
        }
        // biometryEnabled is true
        const hasCredentialsAvailable =
          await this.$biometry.hasCredentialsAvailable("login")
        console.log("has", hasCredentialsAvailable)
        if (hasCredentialsAvailable) return
        try {
          await this.$biometry.saveCredentials("login", {
            username: this.email,
            password: this.password,
          })
        } catch (e) {
          this.$msg.error(
            this.$gettext(
              "Unexpected issue occurred while saving your credentials"
            )
          )
          throw e
        }

        this.$msg.success(this.$gettext("Biometric login successfully set up"))
      },
    },
  })
  export default class Login extends Vue {}
</script>
<style scoped lang="scss">
  @import "@/assets/custom-variables.scss";
  .control a.is-info {
    background-color: var(--btn-payer-background-color, $color-2);
    z-index: 10;
  }
</style>
