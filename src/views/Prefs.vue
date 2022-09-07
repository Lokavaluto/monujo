<template>
  <main class="main">
    <div class="container mt-5">
      <div class="security-prefs">
        <div class="auth-preferences">
          <div class="card custom-card custom-card-padding custom-card-prefs">
            <div class="mb-5">
              <label class="custom-card-title">{{
                $t("auth.prefs.title_security_preferences")
              }}</label>
            </div>
            <div v-for="componentDef in componentDefs" :key="componentDef">
              <component
                :is="componentDef.component.name"
                :prefs-data="componentDef.data"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<script lang="ts">
  import { mapState } from "vuex"
  import { Options, Vue } from "vue-class-component"
  import AuthPrefs from "@/components/AuthPrefs.vue"
  import Loading from "vue-loading-overlay"
  import "vue-loading-overlay/dist/vue-loading.css"

  @Options({
    name: "Prefs",
    components: { AuthPrefs, Loading },
    computed: {
      // componentDefs() {
      //   console.log("querying:", this.$store.state.prefs.componentDefs)
      //   return this.$store.state.prefs.componentDefs
      // },
      ...mapState({
        componentDefs: (state: any) => state.prefs.componentDefs,
      }),
    },
  })
  export default class Prefs extends Vue {}
</script>
<style lang="scss" scoped>
  .custom-card-prefs {
    max-width: 550px;
    margin: auto;
  }
</style>