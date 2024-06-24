<template>
  <section>
    <main class="main">
      <div class="container mt-5">
        <div class="columns is-tablet">
          <div class="column is-half">
            <TheBankAccountList
              @refreshTransaction="refreshTransaction"
              @accountSelected="accountSelected"
              :account="account"
            />
          </div>
          <div class="column is-half">
            <TheTransactionList
              v-if="account"
              @refreshTransaction="refreshTransaction"
              :refreshToggle="refreshToggle"
              :account="account"
              :key="account"
            />
          </div>
        </div>
      </div>
      <div class="action-footer-container">
        <div class="container">
          <TheDashboardFooter
            :account="account"
            @refreshTransaction="refreshTransaction"
          />
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
    emits: ["update:account"],
    data() {
      return {
        refreshToggle: false,
        account: null,
      }
    },
    components: {
      TheTransactionList,
      TheBankAccountList,
      TheDashboardFooter,
    },
    mounted() {
      this.$emit("update:account", this.account)
    },
    methods: {
      refreshTransaction() {
        // This change is propagated through props to children components
        this.refreshToggle = !this.refreshToggle
      },
      accountSelected(account: any) {
        if (account?._obj?.internalId === this.account?._obj?.internalId) return
        this.account = account
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
  :deep(div.card div.section-card > p) {
    margin-left: 1em;
    margin-bottom: 0.5em;
    font-style: italic;
    color: #888;
  }
  :deep(div.card div.section-card > h2) {
    border-bottom: 1px solid black;
    padding-bottom: 0.2em;
    margin-bottom: 0.5em;
    font-weight: bold;
    color: #666;
  }
  :deep(main > div > div > div > div.card div.section-card) {
    margin-bottom: 2em;
  }
</style>
