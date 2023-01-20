<template>
  <AuthChallenge />
  <Dialog />
  <TheNavBar />
  <router-view />
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapGetters } from "vuex"
  import Dialog from "@/components/Dialog.vue"
  import AuthChallenge from "@/components/AuthChallenge.vue"
  import TheNavBar from "@/components/TheNavBar.vue"
  import { Capacitor } from "@capacitor/core"
  import { StatusBar, Style } from "@capacitor/status-bar"
  import { App as CapacitorApp } from "@capacitor/app"

  @Options({
    components: { TheNavBar, AuthChallenge, Dialog },
    async mounted() {
      if (Capacitor.getPlatform() === "ios") {
        await StatusBar.setStyle({ style: Style.Light })
      }
      CapacitorApp.addListener("backButton", ({ canGoBack }) => {
        if (this.getCurrentModal?.step) {
          const { currentComponent, currentStep } = this.getCurrentModal
          this.$modal.close(currentComponent, currentStep)
          return
        } else {
          this.$store.commit("setModalState", false)
        }
        if (canGoBack) {
          window.history.back()
        } else {
          CapacitorApp.exitApp()
        }
      })
    },
    computed: {
      ...mapGetters(["getCurrentModal"]),
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
