<template>
  <div class="modal is-active" ref="paymentConfirmation">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head" :class="type">
        <p class="modal-card-title is-title-shrink">{{ modalTitle }}</p>
        <button
          class="delete"
          aria-label="close"
          @click="$modal.close()"
        ></button>
      </header>

      <section class="modal-card-body">
        <div class="body-content is-size-4">
          <!-- Pending top-up warning -->
          <p
            v-if="showPendingTopUpWarning"
            class="mt-2 mb-5 is-size-5 notification is-danger is-light"
          >
            {{
              $gettext(
                "You already have a pending top-up. Please either pay or delete it before proceeding"
              )
            }}
          </p>

          <!-- Status title -->
          <p class="custom-card-title has-text-weight-bold">
            {{ statusTitle }}
          </p>

          <!-- Icon -->
          <div class="confirm-icon-container" :class="{ 'mb-2': isTopUp }">
            <fa-icon :icon="icon" class="confirm-icon fa-thin" />
          </div>

          <!-- Amount display: v-html required because translations may
               reorder verb and amount, and we need to inject a <span>
               around the numeric amount for barter pill styling (see
               p.amount.cm span.amount rule) -->
          <p
            class="amount has-text-weight-bold is-size-4"
            :class="{ cm: transactionsTags.includes('barter') }"
            v-html="amountSentence"
          ></p>

          <!-- Requester info (when not own request) -->
          <div v-if="showRequesterInfo">
            <h2 class="frame3-sub-title">{{ $gettext("by") }}</h2>
            <p
              class="
                frame3-sub-title
                has-text-weight-bold
                is-size-3
                hide-overflow
              "
            >
              {{ requesterName }}
            </p>
          </div>

          <!-- Regular transaction recipient -->
          <div v-if="showRecipientInfo">
            <h2 class="frame3-sub-title">{{ recipientLabel }}</h2>
            <p
              class="
                frame3-sub-title
                has-text-weight-bold
                is-size-3
                hide-overflow
              "
            >
              {{ recipientName }}
            </p>
          </div>

          <!-- TopUp status message -->
          <div v-if="topUpStatusMessage">
            <h2 class="frame3-sub-title">
              {{ topUpStatusMessage }}
            </h2>
          </div>

          <!-- Reconversion status indicator -->
          <div v-if="showReconversionStatus" class="center mb-2 mt-2">
            <div class="status-indicator">
              <WorkflowIndicator
                format="large"
                :stages="reconversionStatuses"
                :current="reconversionStatus"
                :size="17"
                :spacing="25"
              />
            </div>
          </div>

          <!-- Date -->
          <p class="frame3-sub-title mb-3">{{ dateFormat }}</p>

          <!-- Multiple transactions list -->
          <div v-if="hasMultipleTransactions">
            <hr />
            <div class="transaction-list-description">
              {{
                $gettext(
                  "Payment was done in %{nbTransactions} transactions:",
                  { nbTransactions: transactions.length }
                )
              }}
            </div>
            <TransactionItem
              v-for="transaction in transactions"
              :key="transaction"
              :transaction="transaction"
              mode="small"
            />
          </div>
        </div>
      </section>

      <footer
        class="
          modal-card-foot
          custom-modal-card-foot
          is-justify-content-flex-end
        "
      >
        <!-- TopUp action buttons -->
        <div v-if="showTopUpActions" class="ml-2 mr-2">
          <button
            class="button custom-button-modal has-text-weight-medium"
            id="delete"
            @click="cancelTopUpRequest"
          >
            <span>{{ $gettext("Delete") }}</span>
          </button>
          <button
            class="button custom-button-modal has-text-weight-medium"
            @click="payTopUpRequest"
          >
            <span>{{ $gettext("Pay") }}</span>
          </button>
        </div>
        <button
          class="button custom-button-modal has-text-weight-medium"
          @click="handleApprove"
          v-if="showApproveButton"
        >
          <span>{{ $gettext("Approve") }}</span>
        </button>
        <button
          class="button custom-button-modal has-text-weight-medium"
          @click="$modal.close()"
        >
          <span>{{ $gettext("Ok") }}</span>
        </button>
      </footer>
    </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapModuleState } from "@/utils/vuex"
  import { mapGetters } from "vuex"
  import { getCurrentInstance } from "vue"
  import moment from "moment"
  import { UIError } from "../exception"
  import { showSpinnerMethod, replaceWithLoader } from "@/utils/showSpinner"
  import { debounceMethod } from "@/utils/debounce"
  import applyDecorators from "@/utils/applyDecorators"
  import TransactionItem from "./TransactionItem.vue"
  import WorkflowIndicator from "./WorkflowIndicator.vue"

  let intCents2strAmount = (dataIntCents: bigint): string => {
    let sign = ""
    if (dataIntCents < 0n) {
      dataIntCents = -dataIntCents
      sign = "-"
    }
    let dataStr = dataIntCents.toString().padStart(3, "0")
    return `${sign}${dataStr.slice(0, -2)}.${dataStr.slice(-2)}`
  }

  let strAmount2intCents = (dataStrAmount: string): bigint => {
    // Check format XX...XX.YY
    if (!/^-?[0-9]+\.[0-9]{2}$/.test(dataStrAmount)) {
      throw Error(`Unexpected amount string: ${JSON.stringify(dataStrAmount)}`)
    }
    return BigInt(dataStrAmount.replace(".", ""))
  }

  @Options({
    name: "ConfirmPaymentModal",
    components: {
      TransactionItem,
      WorkflowIndicator,
    },
    created() {
      this.reconversionStatusTranslations = {
        true: this.$gettext("sent"),
        received: this.$gettext("received"),
        invoiced: this.$gettext("invoiced"),
        paid: this.$gettext("processed"),
      }

      this.reconversionStatuses = [true, "received", "invoiced", "paid"]
        .map((v) => this.reconversionStatusTranslations[v.toString()])
        .join("|")
    },
    mounted() {
      this.$refs.paymentConfirmation.focus()
    },
    computed: {
      ...mapGetters(["numericFormat"]),
      ...mapModuleState("lokapi", ["userProfile"]),

      // ─── Base Accessors ───
      args() {
        return this.$modal.args?.value[0] || {}
      },
      type() {
        return this.args.type
      },
      account() {
        return this.args.account
      },
      transactions() {
        const transaction = this.args.transaction
        return Array.isArray(transaction) ? transaction : [transaction]
      },

      // ─── Type Guards ───
      isTopUp() {
        return this.type === "topup"
      },
      isReconversion() {
        return this.type === "reconversion"
      },
      isTransactionDetail() {
        return this.type === "transactionDetail"
      },
      isPaymentConfirmation() {
        return this.type === "paymentConfirmation"
      },
      isPendingApproval() {
        return this.type === "topUpsPendingForApproval"
      },

      // ─── Derived Display Properties ───
      modalTitle() {
        const titles: Record<string, string> = {
          transactionDetail: this.$gettext("Transaction details"),
          paymentConfirmation: this.$gettext("Payment confirmation"),
          topup: this.$gettext("Top-up details"),
          reconversion: this.$gettext("Reconversion details"),
          topUpsPendingForApproval: this.$gettext("Top-up request"),
        }
        return titles[this.type] || ""
      },
      statusTitle() {
        const titles: Record<string, () => string> = {
          transactionDetail: () =>
            this.transactions[0].pending
              ? this.$gettext("Transaction sent")
              : this.$gettext("Transaction processed"),
          paymentConfirmation: () => this.$gettext("Payment sent"),
          topup: () =>
            this.isTopUpAwaitingAdminApproval
              ? this.$gettext("Top-up requested")
              : this.$gettext("Top-up received"),
          reconversion: () =>
            this.$gettext("Reconversion %{ reconversionStatus }", {
              reconversionStatus: this.reconversionStatus,
            }),
          topUpsPendingForApproval: () =>
            this.$gettext("Pending top-up requested"),
        }
        return titles[this.type]?.() || ""
      },
      icon() {
        return this.isTopUp || this.isPendingApproval
          ? "plus-circle"
          : "fa-check"
      },
      showPendingTopUpWarning() {
        return this.args.source === "askTopUp"
      },
      isTopUpPaid() {
        return this.transactions[0].paid === true
      },
      isTopUpPending() {
        const tx = this.transactions[0]
        // A top-up is pending if:
        // - It has a cancel method (CreditRequest from getPendingTopUp)
        // - OR it has pending === true (transaction from history)
        // AND it's not yet paid
        return (
          (tx.cancel !== undefined || tx.pending === true) && tx.paid === false
        )
      },
      isTopUpAwaitingAdminApproval() {
        const tx = this.transactions[0]
        // A top-up is received if:
        // It doesn't have a cancel method (CreditRequest from getPendingTopUp)
        // AND it's paid
        return tx.cancel !== undefined && tx.paid === true
      },
      isOwnTopUpRequest() {
        const requester = this.transactions[0].requester
        return requester === undefined || requester.id === this.userProfile.id
      },
      showTopUpActions() {
        return (
          this.isTopUp &&
          this.isTopUpPending &&
          this.account?.isTopUpAllowed &&
          this.isOwnTopUpRequest
        )
      },
      topUpStatusMessage() {
        if (this.isPendingApproval) {
          return this.$gettext(
            "This top-up request has been paid by the user and is waiting for approval"
          )
        }

        if (this.isTopUpAwaitingAdminApproval) {
          return this.$gettext(
            "This top-up request is waiting for an administrator of your local currency to validate it"
          )
        }
        if (
          this.isTopUpPending &&
          this.account?.isTopUpAllowed &&
          this.isOwnTopUpRequest
        ) {
          return this.$gettext(
            "Your top-up request is waiting for you to pay it or delete it"
          )
        }
        return ""
      },
      showRequesterInfo() {
        const requester = this.transactions[0].requester
        return (
          this.isPendingApproval ||
          (requester !== undefined && requester.id !== this.userProfile.id)
        )
      },
      requesterName() {
        return this.transactions[0].requester?.name || ""
      },

      // ─── Amount Display ───
      transactionCurrency() {
        return this.transactions[0].currency
      },
      transactionTotalAmount() {
        let totalCents = this.transactions
          .map((t: any) => strAmount2intCents(parseFloat(t.amount).toFixed(2)))
          .reduce((acc: bigint, val: bigint) => acc + val, 0n)
        return intCents2strAmount(totalCents)
      },
      transactionsTags() {
        return Array.from(
          new Set(this.transactions.map((t: any) => t.tags).flat())
        )
      },
      amountSentence() {
        const amount = this.transactionTotalAmount
        const currency = this.transactionCurrency
        const displayAmount = amount < 0 ? -amount : amount
        const amountPreGettext = `[${this.numericFormat(
          displayAmount
        )}] ${currency}`

        let translatedFullSentence: string
        if (this.isTopUpAwaitingAdminApproval) {
          translatedFullSentence = this.$gettext("Requested %{amount}", {
            amount: amountPreGettext,
          })
        } else if (amount < 0) {
          translatedFullSentence = this.$gettext("Sent %{amount}", {
            amount: amountPreGettext,
          })
        } else {
          translatedFullSentence = this.$gettext("Received %{amount}", {
            amount: amountPreGettext,
          })
        }

        const instance = getCurrentInstance()
        const scopeId = (instance?.type as any).__scopeId || ""
        return translatedFullSentence.replace(
          /\[(.*?)\]/,
          `<span class="amount" ${scopeId}>$1</span>`
        )
      },

      // ─── Date & Status ───
      dateFormat() {
        return moment(this.transactions[0].date.toString()).format(
          "YYYY-MM-DD HH:mm:ssZ"
        )
      },
      reconversionStatus(): string {
        const transaction = this.transactions[0]
        if (!transaction.isReconversion) return ""
        return (
          (
            {
              true: this.$gettext("sent"),
              false: null,
              received: this.$gettext("received"),
              invoiced: this.$gettext("invoiced"),
              paid: this.$gettext("processed"),
            } as Record<string, string | null>
          )[transaction.isReconversion.toString()] || ""
        )
      },
      showRecipientInfo() {
        const requester = this.transactions[0].requester
        const recipient = this.transactions[0].related
        // XXXvlab: 2026-03-02 comparison by name is much weaker than by id
        return (
          (this.isPendingApproval &&
            requester !== undefined &&
            requester.name !== recipient) ||
          (!this.isReconversion && !this.transactions[0].isTopUp)
        )
      },
      recipientLabel() {
        if (this.isPendingApproval) return this.$gettext("for")
        return this.transactionTotalAmount < 0
          ? this.$gettext("to")
          : this.$gettext("from")
      },
      recipientName() {
        return this.transactions[0].related
      },
      showReconversionStatus() {
        return (
          this.$config.disableReconversionStatusDisplay !== true &&
          this.transactions[0].isReconversion &&
          this.reconversionStatuses.indexOf(this.reconversionStatus) !== -1
        )
      },
      hasMultipleTransactions() {
        return this.transactions.length > 1
      },
      showApproveButton() {
        return this.isPendingApproval
      },
    },
    methods: {
      async payTopUpRequest(): Promise<void> {
        const transaction = this.transactions[0]
        // XXXvlab: we would need to launch regular checks
        // here to acknowledge the payment
        window.open(transaction.jsonData.odoo.order_url, "_blank")
        if (this.promiseWaitPayment) {
          console.log("Already waiting for payment")
          return
        }
        let paymentStatus = null
        let orderId = transaction.jsonData.odoo.order_id
        try {
          this.promiseWaitPayment = this.waitPayment(orderId)
          paymentStatus = await this.promiseWaitPayment
        } catch (err) {
          if (err === false) {
            // The current modal was closed while waiting
            return
          }
          throw new UIError(
            this.$gettext(
              "An unexpected server error occurred while fetching pending topup list"
            ),
            err
          )
        }
        let modalName = this.$modal.modal.value
        if (modalName !== "ConfirmPaymentModal") {
          // The modal was likely closed while waiting
          return
        }
        let myCurrentOrderId = this.transactions[0].jsonData.odoo.order_id
        if (myCurrentOrderId !== orderId) {
          // The modal was likely closed while waiting
          return
        }
        this.closeAndRefresh()
        this.$msg.success(
          this.$gettext("The Top-up request has been successfully payed")
        )
      },
      async waitPayment(orderId: number) {
        return await new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
            let pendingTopUp = null
            let modalName = this.$modal.modal.value
            if (modalName !== "ConfirmPaymentModal") {
              // The modal was likely closed while waiting
              clearInterval(interval)
              reject(false)
              return
            }
            let myCurrentOrderId = this.transactions[0].jsonData.odoo.order_id
            if (myCurrentOrderId !== orderId) {
              // The modal was likely closed while waiting
              clearInterval(interval)
              reject(false)
              return
            }
            try {
              pendingTopUp = await this.account._obj.getPendingTopUp()
            } catch (err) {
              console.error(
                "getPendingTopUp exception while waiting for paid status",
                err
              )
              clearInterval(interval)
              reject(err)
              return
            }
            const result = pendingTopUp.filter(
              (topup: any) =>
                topup.paid === false && topup.jsonData.odoo.order_id === orderId
            )
            if (!result?.length) {
              clearInterval(interval)
              resolve(true)
            }
          }, 5000)
        })
      },
      cancelTopUpRequest: applyDecorators(
        [debounceMethod, showSpinnerMethod(".modal-card-body")],
        async function (this: any): Promise<void> {
          try {
            await this.transactions[0].cancel()
          } catch (err) {
            throw new UIError(
              this.$gettext(
                "An error occurred while deleting top-up request, please try again or contact an administrator"
              ),
              err
            )
          }
          await this.closeAndRefresh()
          this.$msg.success(
            this.$gettext("The top-up request has been successfully deleted")
          )
        }
      ),
      async closeAndRefresh(): Promise<void> {
        this.args.refreshTransaction?.()
        this.args.refreshAccounts?.(true)
        this.$modal.close()
      },
      handleApprove: applyDecorators(
        [debounceMethod, showSpinnerMethod(".modal-card-body")],
        async function (this: any): Promise<void> {
          const transaction = this.transactions[0]
          try {
            await transaction.validate()
          } catch (err: any) {
            if (err.message === "User canceled the dialog box") {
              return
            }
            this.$msg.error(
              this.$gettext(
                "An issue occurred upon the approval of the credit request of %{ name }",
                { name: transaction.related }
              )
            )
            throw err
          }
          this.$msg.success(
            this.$gettext(
              "Top up request from %{ name } of %{ amount } %{ currency } was validated.",
              {
                name: transaction.related,
                amount: transaction.amount,
                currency: transaction.currency,
              }
            )
          )
          await this.closeAndRefresh()
        }
      ),
    },
  })
  export default class ConfirmPaymentModal extends Vue {}
</script>
<style lang="scss" scoped>
  @import "../assets/custom-variables";

  .confirm-icon-container {
    width: fit-content;
    margin: auto;
  }
  .confirm-icon {
    font-size: 4em;
    color: $color-2;
  }
  .body-content {
    text-align: center;
  }
  .hide-overflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  #delete {
    background-color: #cc0f35;
  }
  .transaction-list-description {
    font-size: 0.9em;
  }

  p.amount.cm span.amount {
    background-color: $barter-bg-color;
    display: inline;
    border-radius: 1em;
    padding: 0em 0.5em;
  }
  .status-indicator {
    width: fit-content;
    margin: auto;
    padding-left: 2.5em;
    margin-top: 0.8em;
  }
</style>
