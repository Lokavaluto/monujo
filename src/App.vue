<template>
  <TheNavBar />
  <Modal />
  <Dialog />
  <AuthChallenge />
  <router-view />
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import Dialog from "@/components/Dialog.vue"
  import Modal from "@/components/Modal.vue"
  import AuthChallenge from "@/components/AuthChallenge.vue"
  import TheNavBar from "@/components/TheNavBar.vue"
  import { Capacitor } from "@capacitor/core"
  import { StatusBar, Style } from "@capacitor/status-bar"
  import { App as CapacitorApp } from "@capacitor/app"

  @Options({
    components: { TheNavBar, AuthChallenge, Dialog, Modal },
    async mounted() {
      if (Capacitor.getPlatform() === "ios") {
        await StatusBar.setStyle({ style: Style.Light })
      }
      CapacitorApp.addListener("backButton", ({ canGoBack }) => {
        // XXXvlab: will need a back button service to insert these
        if (this.$qrCode.isActive()) return
        if (this.$modal.isActive.value) {
          this.$modal.back()
          return
        }
        if (canGoBack) {
          window.history.back()
        } else {
          CapacitorApp.exitApp()
        }
      })
    },
    watch: {
      $route(to, from) {
        if (this.$modal.isActive.value) this.$modal.close()
      },
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
