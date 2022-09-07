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
                :placeholder="$t('auth.login.label_email')"
              />
              <span class="icon is-small is-left">
                <fa-icon icon="envelope" />
              </span>
              <span class="icon is-small is-right">
                <fa-icon icon="check" />
              </span>
            </p>
          </div>
          <div class="field mb-2">
            <p class="control has-icons-left">
              <input
                v-model="password"
                class="input"
                type="password"
                placeholder="$t('auth.login.label_password')"
              />
              <span class="icon is-small is-left">
                <fa-icon icon="lock" />
              </span>
            </p>
          </div>
          <div class="forgot-password mb-4">
            <button @click="openResetPasswordUrl()" type="button">
              {{ $t("auth.login.action_forgot_password") }}
            </button>
          </div>
          <div class="login-buttons">
            <div>
              <p class="control has-text-centered">
                <button type="submit" class="button is-login">
                  {{ $t("auth.login.action_signin") }}
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
                  {{ $t("auth.login.action_signup") }}
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
          this.success = this.$t("auth.login.msg_success")
          this.$router.push({ name: "dashboard" })
          this.$persistentStore.set("loginEmail", this.email)
        } catch (e) {
          // { APIRequestFailed, InvalidCredentials }
          if (e instanceof RestExc.APIRequestFailed) {
            this.fail = this.$t("auth.login.msg_error_api_request_failed")
            return
          }
          if (e instanceof RestExc.InvalidCredentials) {
            this.fail = this.$t("auth.login.msg_error_invalid_credentials")
            return
          }
          if (e instanceof RequestExc.RequestFailed) {
            this.fail = this.$t("auth.login.msg_error_request_failed")
            return
          }
          this.fail = this.$t("auth.login.msg_error_unknown")
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