<template>
  <AuthChallenge />
  <Dialog />
  <TheNavBar />
  <router-view />
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import Dialog from "@/components/Dialog.vue"
  import AuthChallenge from "@/components/AuthChallenge.vue"
  import TheNavBar from "@/components/TheNavBar.vue"
  import { Capacitor } from "@capacitor/core"
  import { StatusBar, Style } from "@capacitor/status-bar"

  @Options({
    components: { TheNavBar, AuthChallenge, Dialog },
    async mounted() {
      if (Capacitor.getPlatform() === "ios") {
        await StatusBar.setStyle({ style: Style.Light })
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
