<template>
  <div class="main">
    <div class="mb-5">
      <div class="mb-5 is-flex">
        <div class="is-flex">
          <div class="switch-centered">
            <label class="switch">
              <input
                type="checkbox"
                :checked="useSimplifiedAuth"
                @click="switchSimplifiedAuth"
                ref="checkbox"
              />
              <span class="slider round"></span>
            </label>
          </div>
          <div class="mr-1 switch-centered">
            {{ $gettext("Simplified authentication for this device") }}
          </div>
        </div>
        <div v-if="name">
          {{ $gettext("for account %{ name }", { name }) }}
        </div>
        <div v-if="useSimplifiedAuth" class="switch-centered">
          <button
            class="button is-payer has-text-weight-medium is-rounded action"
            @click="unlock()"
            :disabled="!locked"
          >
            <span>{{ $gettext("Edit") }}</span>
            <span class="icon mb-1">
              <fa-icon class="fa-md" :icon="locked ? 'lock' : 'lock-open'" />
            </span>
          </button>
        </div>
      </div>
      <div v-if="!locked && useSimplifiedAuth" class="ml-5">
        <component
          :is="handler.Ui.Pref.name"
          :handler="handler"
          @submitConfig="submitConfig"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import AuthPrefDirect from "@/components/AuthPrefDirect.vue"
  import AuthPrefRetention from "@/components/AuthPrefRetention.vue"

  /**
   * AuthPref component manages the Local Authentication preferences.
   *
   * Local authentication allows current device to use a usually simpler
   * authentication method in lieu of a fixed other authentication
   * method.
   *
   * Advantages here are numerous:
   *  - can leverage technology of the device (fingerprint, face, SMS, ...)
   *  - is usually quicker to provide
   *  - can combine and compose different authentication method
   *  - can change authentication tokens without changing the legacy global
   *    authentication method (that can not always easily change)
   *
   *
   */

  @Options({
    name: "AuthPref",
    components: {
      AuthPrefDirect,
      AuthPrefRetention,
    },
    props: {
      handler: Object,
      requestCredentials: Function,
      name: Boolean,
      disabled: false,
    },
    data() {
      return {
        locked: true,
        useSimplifiedAuth: false,
      }
    },
    mounted() {
      this.useSimplifiedAuth = !!this.handler.userConfig
    },
    methods: {
      async triggerChallenge(customRequestCredentialsFn?: any) {
        try {
          this.handler.accountAuthService.secret =
            await this.requestCredentials(customRequestCredentialsFn)
        } catch (err) {
          if (err.message === "User canceled the dialog box") {
            return false
          }
          console.log("Challenge failed:", err.message)
          return false
        }
        return true
      },
      /**
       * Trigger direct default challenge an disable any retention
       */
      triggerDefaultChallenge() {
        return this.triggerChallenge(async (state: any, userAccount: any) => {
          // By not asking the specific userAccount's auth, we remove
          // any retention mecanism aspect.
          const accountAuthService = await this.$auth.getAccountAuth()
          return await accountAuthService.requestCredentials(state)
        })
      },
      async submitConfig(subUserConfig: string) {
        let userConfig = { subConfig: subUserConfig }
        this.$emit("saveConfig", this.handler.accountAuthService, userConfig)
        this.handler.userConfig = null
        this.$forceUpdate()
      },
      async unlock() {
        if (!(await this.triggerChallenge())) {
          return
        }
        this.locked = false
      },
      setUseSimplifiedAuth(value: any) {
        this.useSimplifiedAuth = value
        this.$refs.checkbox.checked = value
        // XXXvlab: nextTick didn't work.
        setTimeout(() => {
          this.$refs.checkbox.checked = value
        }, 0)
      },
      async switchSimplifiedAuth(e: any) {
        e.preventDefault()
        if (this.useSimplifiedAuth) {
          // Was on, switching off
          if (!(await this.triggerDefaultChallenge())) {
            // XXXvlab: vuejs won't see any changes so won't force
            // the checkbox to be unchecked. But it is automatically checked
            // despite the preventDefault.
            // this.useSimplifiedAuth = true
            this.setUseSimplifiedAuth(true)
            return
          }
          this.setUseSimplifiedAuth(false)
          this.locked = true
          this.$emit("saveConfig", this.handler.accountAuthService, null)
          this.handler.userConfig = null
          this.$forceUpdate()
          return
        }
        // ``useSimplifiedAuth`` was off, switching on
        if (!(await this.triggerDefaultChallenge())) {
          // XXXvlab: vuejs won't see any changes so won't force
          // the checkbox to be unchecked. But it is automatically checked
          // despite the preventDefault.
          // this.useSimplifiedAuth = false
          this.setUseSimplifiedAuth(false)
          return
        }
        this.setUseSimplifiedAuth(true)
        this.locked = false
      },
    },
  })
  export default class AuthPref extends Vue {}
</script>
<style lang="scss" scoped>
  // Bulma override variables
  @import "@/assets/custom-variables";
  @import "@/assets/switch-prefs";
  .switch-centered {
    margin: auto;
    padding-right: 7px;
  }
</style>
