<template>
  <Nav />
  <router-view />
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Nav from "@/components/Nav.vue";
import router from "./router/index"

@Options({
  components: { Nav },
  async mounted() {
    // If this component is loaded, we already are logged in, so
    // the store already contains the logged in user informations...
    // Maybe all the following is not useful ?
    try {
      await this.$store.dispatch("initAutoLogin")
      await this.$store.dispatch("setAccounts")
    } catch(e) {
      console.error("Error while trying to autolog", e)
      router.push("/")
      throw e
    }
  },
})
export default class Login extends Vue {}
</script>

<style lang="scss"></style>
