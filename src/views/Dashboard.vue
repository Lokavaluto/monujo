<template>
  <section>
    <main class="main">
      <div class="container mt-5">
        <div class="columns is-tablet">
          <div class="column is-half">
            <TheBankAccountList @refreshTransaction="refreshTransaction" />
          </div>
          <div class="column is-half">
            <TheTransactionList :refreshToggle="refreshToggle" />
          </div>
        </div>
      </div>
      <div class="action-footer-container">
        <div class="container">
          <TheDashboardFooter @refreshTransaction="refreshTransaction" />
        </div>
      </div>
    </main>
  </section>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import TheBankAccountList from "@/components//TheBankAccountList.vue"
  import TheTransactionList from "@/components/TheTransactionList.vue"
  import TheDashboardFooter from "@/components/TheDashboardFooter.vue"

  @Options({
    name: "core",
    props: {
      msg: String,
    },
    data() {
      return {
        refreshToggle: false,
      }
    },
    components: {
      TheTransactionList,
      TheBankAccountList,
      TheDashboardFooter,
    },
    methods: {
      refreshTransaction() {
        // This change is propagated through props to children components
        this.refreshToggle = !this.refreshToggle
      },
    },
  })
  export default class Core extends Vue {}
</script>
<style lang="scss" scoped>
  .action-footer-container {
    position: fixed !important;
    z-index: 20;
    bottom: 0 !important;
    width: 100%;

    @media screen and (min-width: 1024px) {
      bottom: 20px !important;
    }
  }
</style>
