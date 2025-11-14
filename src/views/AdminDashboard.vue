<template>
  <div>
    <span id="neutralize-ribbon" style="">
      {{ $gettext("Admin") }}
    </span>
  </div>
  <section>
    <main class="main mb-5">
      <div class="container mt-5">
        <div class="columns is-tablet">
          <div class="column is-half">
            <TheCurrencyList
              @refreshTransaction="refreshTransaction"
              @currencySelected="currencySelected"
              :refreshToggle="refreshAccountsToggle"
              :currency="currency"
            />
          </div>
        </div>
      </div>
      <div class="action-footer-container">
        <div class="container">
          <TheDashboardFooter
            :isAdmin="true"
            :currency="currency"
            @refreshTransaction="refreshTransaction"
            @refreshAccounts="refreshAccounts"
          />
        </div>
      </div>
    </main>
  </section>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import TheCurrencyList from "@/components/TheCurrencyList.vue"
  import TheDashboardFooter from "@/components/TheDashboardFooter.vue"

  @Options({
    name: "AdminDashboard",
    props: {
      msg: String,
    },
    data() {
      return {
        refreshTransactionsToggle: false,
        refreshAccountsToggle: false,
        currency: null,
      }
    },
    components: {
      TheCurrencyList,
      TheDashboardFooter,
    },
    methods: {
      refreshTransaction() {
        // This change is propagated through props to children components
        this.refreshTransactionsToggle = !this.refreshTransactionsToggle
      },
      refreshAccounts() {
        // This change is propagated through props to children components
        this.refreshAccountsToggle = !this.refreshAccountsToggle
      },
      currencySelected(currency: any) {
        this.currency = currency
      },
    },
  })
  export default class AdminDashboard extends Vue {
    private appElement: HTMLElement | null = null

    mounted() {
      this.appElement = document.getElementById("app")
      if (!this.appElement) {
        return
      }

      this.appElement.style.setProperty("--size", "24px")
      this.appElement.style.setProperty("--a", "#ffe0e000")
      this.appElement.style.setProperty("--b", "#ff000010")
      this.appElement.style.backgroundImage =
        "linear-gradient(45deg, var(--a) 25%, var(--b) 25% 50%, var(--a) 50% 75%, var(--b) 75%)"
      this.appElement.style.backgroundSize = "var(--size) var(--size)"
    }

    beforeUnmount() {
      if (!this.appElement) {
        return
      }

      this.appElement.style.removeProperty("--size")
      this.appElement.style.removeProperty("--a")
      this.appElement.style.removeProperty("--b")
      this.appElement.style.removeProperty("background-image")
      this.appElement.style.removeProperty("background-size")
      this.appElement = null
    }
  }
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
  #neutralize-ribbon {
    width: 400px;
    top: 1em;
    left: -6em;
    font-size: 1.8em;
    text-align: center;
    padding: 10px;
    line-height: 0.8em;
    color: rgb(240, 240, 240);
    transform: rotate(-45deg);
    position: fixed;
    box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 0.4em;
    background: rgb(208, 68, 44);
    opacity: 0.8;
    pointer-events: none;
    text-transform: uppercase;
    z-index: 9999;
  }
</style>
