<template>
  <div class="member-registration">
    <div v-if="invalidUrl || returnError" class="p-3">
      <p v-if="invalidUrl" role="alert">
        {{
          $gettext(
            "Unable to open the registration form. Please contact your administrator."
          )
        }}
      </p>
      <p v-if="returnError" role="alert">
        {{ $gettext("Unable to return to login. Please try again.") }}
      </p>
    </div>
    <iframe
      v-if="formSrc"
      ref="membershipFrame"
      :src="formSrc"
      :title="$gettext('Sign-Up')"
    ></iframe>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { rememberSurveyReturn } from "@/utils/surveyReturn"

  @Options({
    name: "MemberRegistrationForm",
    data() {
      return {
        formSrc: "",
        formOrigin: "",
        invalidUrl: false,
        returning: false,
        returnError: false,
      }
    },
    mounted() {
      try {
        const value = this.$config.signUpUrl
        if (typeof value !== "string" || !value.trim())
          throw new Error("Missing URL")
        let formUrl: URL
        try {
          // Absolute URLs must not depend on lokapiHost being configured.
          formUrl = new URL(value)
        } catch {
          const host = this.$config.lokapiHost
          if (typeof host !== "string" || !host.trim())
            throw new Error("Missing host")
          formUrl = new URL(
            value,
            host.includes("://") ? host : `https://${host}`
          )
        }
        if (
          !["http:", "https:"].includes(formUrl.protocol) ||
          formUrl.username ||
          formUrl.password ||
          (window.location.protocol === "https:" &&
            formUrl.protocol === "http:")
        ) {
          throw new Error("Unsupported registration URL")
        }
        formUrl.searchParams.set("parent_origin", window.location.origin)
        formUrl.searchParams.set("return_label", this.$gettext("Back to login"))
        this.formOrigin = formUrl.origin
        window.addEventListener("message", this.onMembershipMessage)
        this.formSrc = formUrl.href
      } catch {
        this.invalidUrl = true
      }
    },
    beforeUnmount() {
      window.removeEventListener("message", this.onMembershipMessage)
    },
    methods: {
      onMembershipMessage(event: MessageEvent) {
        const iframe = this.$refs.membershipFrame as
          | HTMLIFrameElement
          | undefined
        if (!iframe?.contentWindow) return
        if (event.origin !== this.formOrigin) return
        if (event.source !== iframe.contentWindow) return
        if (event.data?.type !== "odoo:survey:return") return
        this.returnToLogin(event.data.payload?.email)
      },
      async returnToLogin(email?: unknown) {
        if (this.returning) return
        this.returning = true
        this.returnError = false
        const clearReturn = rememberSurveyReturn(email)
        try {
          const failure = await this.$router.replace({ name: "Login" })
          if (failure) throw failure
        } catch {
          this.returning = false
          this.returnError = true
        } finally {
          clearReturn()
        }
      },
    },
  })
  export default class MemberRegistrationForm extends Vue {}
</script>

<style scoped lang="scss">
  @import "@/assets/safe-area";

  .member-registration {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: calc(4rem + #{$sa-top});
    right: #{$sa-right};
    bottom: #{$sa-bottom};
    left: #{$sa-left};

    iframe {
      display: block;
      width: 100%;
      flex: 1;
      min-height: 0;
      border: 0;
    }
  }
</style>
