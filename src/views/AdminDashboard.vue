<template>
  <div>
    <span id="neutralize-ribbon">
      {{ $gettext("Admin") }}
    </span>
  </div>
  <section>
    <main class="main mb-5">
      <div class="container mt-5">
        <div class="columns">
          <div class="column is-half">
            <div class="accounts card custom-card custom-card-padding">
              <TheCurrencyList
                @refreshTransaction="refreshTransaction"
                @currencySelected="currencySelected"
                :refreshToggle="refreshAccountsToggle"
                :currency="currency"
              />
            </div>
            <div
              v-if="hasUserAccountValidationRights"
              v-show="showPendingAccounts"
              class="mt-5 accounts card custom-card custom-card-padding"
            >
              <PendingAccounts @hasAccounts="showPendingAccounts = $event" />
            </div>
          </div>
          <div
            v-if="hasCreditRequestValidationRights"
            v-show="showPendingCredits"
            class="column is-half"
          >
            <div class="accounts card custom-card custom-card-padding">
              <PendingCredits
                @hasCredits="showPendingCredits = $event"
                @refreshTransaction="refreshTransaction"
                @refreshAccounts="refreshAccounts"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-if="hasInspectRights" class="action-footer-container">
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

  import { mapModuleState } from "@/utils/vuex"
  import { mapGetters } from "vuex"
  import TheCurrencyList from "@/components/TheCurrencyList.vue"
  import TheDashboardFooter from "@/components/TheDashboardFooter.vue"
  import PendingAccounts from "@/components/PendingAccounts.vue"
  import PendingCredits from "@/components/PendingCredits.vue"
  @Options({
    name: "AdminDashboard",
    data() {
      return {
        refreshTransactionsToggle: false,
        refreshAccountsToggle: false,
        currency: null,
        showPendingCredits: false,
        showPendingAccounts: false,
        hasInspectRights: false,
      }
    },
    components: {
      TheCurrencyList,
      TheDashboardFooter,
      PendingAccounts,
      PendingCredits,
    },
    computed: {
      ...mapModuleState("lokapi", [
        "hasUserAccountValidationRights",
        "hasCreditRequestValidationRights",
        "adminRightsLoaded",
      ]),
      ...mapGetters(["hasAnyAdminRights"]),
    },
    watch: {
      hasAnyAdminRights: {
        handler: "checkAdminAccess",
        immediate: true,
      },
      adminRightsLoaded: "checkAdminAccess",
    },
    methods: {
      checkAdminAccess() {
        if (this.adminRightsLoaded && !this.hasAnyAdminRights) {
          this.$router.push("/dashboard")
        }
      },
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
        this.checkInspectRights(currency)
      },
      async checkInspectRights(currency: any) {
        if (!currency?.canSearchAllRecipients) {
          this.hasInspectRights = false
          return
        }
        try {
          this.hasInspectRights = await currency.canSearchAllRecipients()
        } catch {
          this.hasInspectRights = false
        }
      },
    },
  })
  export default class AdminDashboard extends Vue {
    mounted() {
      document.getElementById("app")?.classList.add("admin-mode")
    }

    beforeUnmount() {
      document.getElementById("app")?.classList.remove("admin-mode")
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
  :global(#app.admin-mode) {
    background-image: linear-gradient(
      45deg,
      #ffe0e000 25%,
      #ff000010 25% 50%,
      #ffe0e000 50% 75%,
      #ff000010 75%
    );
    background-size: 24px 24px;
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
