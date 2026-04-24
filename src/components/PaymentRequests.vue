<template>
  <div id="payment-requests">
    <FoldableSectionCard
      id="payment-requests-list"
      v-if="paymentRequestList.length"
      :title="$gettext('My unpaid payment requests')"
      :count="paymentRequestList.length"
    >
      <p class="top-up-info">
        {{ $gettext("The following payment requests need to be paid.") }}
      </p>
      <TransactionItem
        v-for="paymentRequest in displayedPaymentRequestList"
        :key="paymentRequest"
        class="payment-request-item"
        :transaction="paymentRequest"
        @click="openModal(paymentRequest)"
      />
      <div v-if="paymentRequestList.length > 5" class="has-text-centered mt-5">
        <button
          @click="
            () => {
              $modal.open('PaymentRequestListModal', {
                paymentRequestList,
                account,
                refreshTransaction,
                refreshAccounts,
              })
            }
          "
          class="button custom-button custom-inverted"
        >
          {{ $gettext("See more") }}
        </button>
      </div>
    </FoldableSectionCard>
  </div>
</template>

<script lang="ts">
  import { mapGetters } from "vuex"
  import { Options, Vue } from "vue-class-component"

  import { mapModuleState } from "@/utils/vuex"
  import { getUserAccount } from "@/utils/account"
  import TransactionItem from "./TransactionItem.vue"
  import FoldableSectionCard from "./FoldableSectionCard.vue"
  import { UIError } from "../exception"
  import { showSpinnerMethod, replaceWithLoader } from "@/utils/showSpinner"
  import applyDecorators from "@/utils/applyDecorators"

  @Options({
    name: "PaymentRequests",
    components: {
      TransactionItem,
      FoldableSectionCard,
    },
    props: {
      refreshToggle: Boolean,
      account: Object,
    },
    data(this: any) {
      return {
        paymentRequestList: [],
        hasFinishedFirstLoading: false,
      }
    },
    async mounted() {
      await this.fetchPaymentRequestList()
    },
    computed: {
      ...mapModuleState("lokapi", ["userProfile"]),
      ...mapGetters(["numericFormat", "relativeDateFormat", "dateFormat"]),
      displayedPaymentRequestList() {
        return this.paymentRequestList.slice(0, 5)
      },
    },

    methods: {
      fetchPaymentRequestList: applyDecorators(
        [
          showSpinnerMethod(function (this: any, isLoading: boolean) {
            if (this.hasFinishedFirstLoading)
              this.$emit("triggerTransactionRefresh", isLoading, this)
            if (!this.hasFinishedFirstLoading && !isLoading) {
              this.hasFinishedFirstLoading = true
            }
          }),
          showSpinnerMethod(function (this: any, isLoading: boolean) {
            if (!this.hasFinishedFirstLoading) {
              return replaceWithLoader.apply(this, ["#payment-requests"])
            }
          }),
        ],
        async function (this: any): Promise<void> {
          try {
            this.paymentRequestList = (
              await getUserAccount(this.account).getPaymentRequests([
                "open",
                "refused",
              ])
            ).map((paymentRequest: any) => {
              paymentRequest.currency = this.account.curr
              return paymentRequest
            })
          } catch (err) {
            throw new UIError(
              this.$gettext(
                "An unexpected server error occurred while fetching the payment request list"
              ),
              err
            )
          }
        }
      ),
      async openModal(paymentRequest: any) {
        await this.$modal.open("PaymentRequestModal", {
          paymentRequest: paymentRequest,
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
        this.fetchPaymentRequestList()
      },
    },
  })
  export default class PaymentRequests extends Vue {}
</script>
<style lang="scss" scoped>
  .top-up-info {
    font-style: italic;
  }
</style>
