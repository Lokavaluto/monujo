<template>
  <Nav />
  <router-view />
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import Nav from "@/components/Nav.vue";

  @Options({
    components: { Nav },
    async mounted() {
      if (!this.userProfile) {
        try {
          console.log("Trying to Autolog")
          await this.$store.dispatch("initAutoLogin")
        } catch(e) {
          console.error("Error while trying to autolog", e)
        }
      }
    },
    computed: {
      userProfile(): string {
        return this.$store.state.lokapi.userProfile
      }
    },
  })
  export default class Login extends Vue {}
</script>

<style lang="scss"></style>
