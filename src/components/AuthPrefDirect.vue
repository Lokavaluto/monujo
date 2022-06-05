<template></template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  @Options({
    name: "AuthPrefDirect",
    props: {
      configs: {
        type: Object,
        default() {
          return [{}, {}]
        },
      },
    },
    data() {
      return {}
    },
    async mounted() {
      let [configDef, userConfig] = this.configs
      this.$emit("validUserConfig", {})
    },
  })
  export default class AuthPrefDirect extends Vue {}
</script>
<style lang="scss" scoped></style>
