<template>
  <div v-if="isBusinessForFinanceBackend" class="badge">pro</div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  @Options({
    name: "Badge",
    props: {
      object: Object,
    },
    data: () => {
      return {
        isBusinessForFinanceBackend: false,
      }
    },
    async mounted() {
      if (typeof this.object.isBusinessForFinanceBackend == "function") {
        // This is using raw object from lokapi, providing an async function
        this.isBusinessForFinanceBackend =
          await this.object.isBusinessForFinanceBackend()
      } else if (this.object.isBusinessForFinanceBackend) {
        // This is for the virtual account tree that already resolved the previous promise
        this.isBusinessForFinanceBackend =
          this.object.isBusinessForFinanceBackend
      }
    },
  })
  export default class Badge extends Vue {}
</script>
<style lang="scss" scoped>
  @import "../assets/custom-variables";

  div.badge {
    vertical-align: top;
    margin-left: 0.5em;
    display: inline;
    border-radius: 1em;
    font-size: 0.6em;
    padding: 0em 0.5em;
    background-color: $color-2;
    color: white;
    font-weight: bold;
  }
</style>
