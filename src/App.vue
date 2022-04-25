<template>
  <Nav />
  <router-view />
</template>

<script lang="ts">
  import { RestExc } from "@lokavaluto/lokapi-browser"
  import { Options, Vue } from "vue-class-component"
  import Nav from "@/components/Nav.vue"

  @Options({
    components: { Nav },
    async mounted() {
      if (!this.userProfile) {
        try {
          console.log("Trying to Autolog")
          await this.$store.dispatch("initAutoLogin")
        } catch (e) {
          if (e instanceof RestExc.TokenRequired) {
            // TokenRequired is cast by lokapi as one of 2 mecanism to
            // react upon failure of auto-login. As we are already using
            // the ``requestLogin`` callback, and that this callback issues
            // a ``router.push("/")`` that won't do anything when already
            // on this URL, this code will be run and this exception will
            // be thrown and catched here. Notice that if the login page
            // was on the URL "/login", that would not be necessary.
            return
          }
          console.log("Error while trying to autolog", e)
        }
      }
    },
    computed: {
      userProfile(): string {
        return this.$store.state.lokapi.userProfile
      },
    },
  })
  export default class Login extends Vue {}
</script>

<style lang="scss"></style>
