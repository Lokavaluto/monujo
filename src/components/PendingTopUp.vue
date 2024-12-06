<template>
  <loading
    v-if="!pendingPaidTopUpList.length && !pendingUnpaidTopUpList.length"
    v-model:active="isPendingTopUpLoading"
    id="topup-loading-spinner"
    :can-cancel="false"
    :is-full-page="false"
  />
  <div
    class="section-card"
    id="pending-top-up-list"
    v-if="pendingUnpaidTopUpList.length"
  >
    <h2 class="custom-card-title title-card">
      {{ $gettext("Unpaid top-up requests") }}
    </h2>
    <p class="top-up-info">
      {{
        $gettext("The following top up requests needs to be paid or canceled")
      }}
    </p>
    <TransactionItem
      v-for="topup in pendingUnpaidTopUpList"
      :key="topup"
      class="pending-top-up-item"
      :transaction="topup"
      @click="openModal(topup)"
    />
  </div>
  <div class="section-card" v-if="pendingPaidTopUpList.length">
    <h2 class="custom-card-title">
      {{ $gettext("Top up waiting admin validation") }}
    </h2>
    <p class="top-up-info">
      {{
        $gettext(
          "The following top up have been paid and are waiting for an administrator of your local currency to validate them."
        )
      }}
    </p>
    <TransactionItem
      v-for="topup in pendingPaidTopUpList"
      :key="topup"
      :transaction="topup"
      @click="openModal(topup)"
    />
  </div>
</template>

<script lang="ts">
  import { mapGetters } from "vuex"
  import { Options, Vue } from "vue-class-component"
  import Loading from "vue-loading-overlay"

  import TransactionItem from "./TransactionItem.vue"
  import { UIError } from "../exception"
  import "vue-loading-overlay/dist/css/index.css"

  @Options({
    name: "PendingTopUp",
    components: {
      Loading,
      TransactionItem,
    },
    props: {
      refreshToggle: Boolean,
      account: Object,
    },
    data(this: any) {
      return {
        pendingTopUpList: [],
        isPendingTopUpLoading: false,
      }
    },
    async mounted() {
      await this.fetchTopUpList()
    },
    computed: {
      pendingPaidTopUpList() {
        return this.pendingTopUpList.filter((topup: any) => topup.paid)
      },
      pendingUnpaidTopUpList() {
        return this.pendingTopUpList.filter((topup: any) => !topup.paid)
      },
      ...mapGetters(["numericFormat", "relativeDateFormat", "dateFormat"]),
    },

    methods: {
      async fetchTopUpList() {
        this.isPendingTopUpLoading = true
        try {
          this.pendingTopUpList = await this.account._obj.getPendingTopUp()
        } catch (err) {
          throw new UIError(
            this.$gettext(
              "An unexpected server error occured while fetching pending topup list"
            ),
            err
          )
        } finally {
          this.isPendingTopUpLoading = false
        }
      },
      async openModal(transactionObject: any) {
        await this.$modal.open("ConfirmPaymentModal", {
          transaction: transactionObject,
          type: "topup",
          account: this.account,
          refreshTransaction: this.refreshTransaction,
          refreshAccounts: this.refreshAccounts,
        })
      },
      refreshTransaction() {
        this.$emit("refreshTransaction")
      },
      refreshAccounts() {
        this.$emit("refreshAccounts")
      },
    },
    watch: {
      refreshToggle: async function () {
        this.fetchTopUpList()
      },
      isPendingTopUpLoading(newVal: boolean) {
        this.$emit("triggerTransactionRefresh", newVal)
      },
    },
  })
  export default class PendingTopUp extends Vue {}
</script>
<style lang="scss" scoped>
  .top-up-info {
    font-style: italic;
  }
</style>
