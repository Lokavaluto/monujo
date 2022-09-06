<template>
  <AuthChallenge />
  <TheNavBar />
  <router-view />
</template>

<script lang="ts">
  import { RestExc } from "@lokavaluto/lokapi-browser"
  import { Options, Vue } from "vue-class-component"
  import AuthChallenge from "@/components/AuthChallenge.vue"
  import TheNavBar from "@/components/TheNavBar.vue"
  import { StatusBar, Style } from '@capacitor/status-bar';

  @Options({
    components: { TheNavBar, AuthChallenge },
    async mounted() {
      await StatusBar.setStyle({ style: Style.Light });
      if (!this.userProfile) {
        try {
          await this.$store.dispatch("setupAfterLogin")
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
        if (this.$store.getters.isAuthenticated && this.$route.name === "Login")
          this.$router.push({ name: "dashboard" })
      }
    },
    computed: {
      userProfile(): string {
        return this.$store.state.lokapi.userProfile
      },
      getModalState() {
        return this.$store.state.isModalOpen
      },
    },
    watch: {
      getModalState() {
        if (this.getModalState) document.body.classList.add("is-clipped")
        else document.body.classList.remove("is-clipped")
      },
    },
  })
  export default class Login extends Vue {}
</script>

<style lang="scss"></style>
