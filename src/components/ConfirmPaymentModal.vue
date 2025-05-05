<template>
  <div class="modal is-active" ref="paymentConfirmation">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head" :class="$modal.args?.value[0].type">
        <p class="modal-card-title is-title-shrink">
          {{
            {
              transactionDetail: $gettext("Transaction details"),
              paymentConfirmation: $gettext("Payment confirmation"),
              topup: $gettext("Top-up details"),
              reconversion: $gettext("Reconversion details"),
            }[$modal.args?.value[0].type]
          }}
        </p>
        <button
          class="delete"
          aria-label="close"
          @click="$modal.close()"
        ></button>
      </header>

      <section class="modal-card-body">
        <div class="body-content is-size-4">
          <p
            v-if="$modal.args?.value[0]?.source == 'askTopUp'"
            class="mt-2 mb-5 is-size-5 notification is-danger is-light"
          >
            {{
              $gettext(
                "You already have a pending top-up. Please either pay or delete it before proceeding"
              )
            }}
          </p>
          <p class="custom-card-title has-text-weight-bold">
            {{
              {
                transactionDetail: $modal.args?.value[0].transaction.pending
                  ? $gettext("Transaction sent")
                  : $gettext("Transaction processed"),
                paymentConfirmation: $gettext("Payment sent"),
                topup:
                  typeof $modal.args?.value[0].transaction.cancel !==
                  "undefined"
                    ? $gettext("Top-up requested")
                    : $gettext("Top-up received"),
                reconversion: reconversionStatus,
              }[$modal.args?.value[0].type]
            }}
          </p>
          <div
            v-if="$modal.args?.value[0].type == 'topup'"
            class="confirm-icon-container mb-2"
          >
            <fa-icon icon="plus-circle" class="confirm-icon fa-thin" />
          </div>
          <div v-else class="confirm-icon-container">
            <fa-icon icon="fa-check" class="confirm-icon fa-thin" />
          </div>

          <p
            v-if="$modal.args?.value[0].type != 'topup'"
            class="amount has-text-weight-bold is-size-4"
            :class="{
              cm: transactionsTags.includes('barter'),
            }"
            v-html="amountSentence"
          ></p>
          <p v-else class="amount has-text-weight-bold is-size-4">
            {{
              ((t) =>
                typeof t.cancel !== "undefined"
                  ? $gettext("Requested %{amount}", {
                      amount: `${numericFormat(t.amount)} ${t.currency}`,
                    })
                  : $gettext("Received %{amount}", {
                      amount: `${numericFormat(t.amount)} ${t.currency}`,
                    }))($modal.args?.value[0].transaction)
            }}
          </p>
          <div v-if="$modal.args?.value[0].type !== 'reconversion'">
            <h2 v-if="$modal.args?.value[0].transaction.isTopUp">
              <h2
                v-if="$modal.args?.value[0].type == 'topup'"
                class="frame3-sub-title"
              >
                {{
                  $modal.args?.value[0].transaction.paid === true
                    ? $gettext(
                        "This top-up request is waiting for an administrator of your local currency to validate it"
                      )
                    : typeof $modal.args?.value[0].transaction.cancel !==
                        "undefined" &&
                      ($modal.args?.value[0].transaction.requester ===
                        undefined ||
                        $modal.args?.value[0].transaction.requester.id ===
                          userProfile.id)
                    ? $gettext(
                        "Your top-up request is waiting for you to pay it or delete it"
                      )
                    : ""
                }}
                <div
                  v-if="
                    $modal.args?.value[0].transaction.requester !== undefined &&
                    $modal.args?.value[0].transaction.requester.id !==
                      userProfile.id
                  "
                >
                  <h2 class="frame3-sub-title">
                    {{ $gettext("by") }}
                  </h2>
                  <p
                    class="
                      frame3-sub-title
                      has-text-weight-bold
                      is-size-3
                      hide-overflow
                    "
                  >
                    {{ $modal.args?.value[0].transaction.requester.name }}
                  </p>
                </div>
              </h2>
            </h2>
            <h2 v-else>
              <h2 class="frame3-sub-title">
                {{
                  transactionTotalAmount < 0 ? $gettext("to") : $gettext("from")
                }}
              </h2>
              <p
                class="
                  frame3-sub-title
                  has-text-weight-bold
                  is-size-3
                  hide-overflow
                "
              >
                {{ transactions[0].related }}
              </p>
            </h2>
          </div>

          <p class="frame3-sub-title mb-3">
            {{ dateFormat }}
          </p>

          <div v-if="transactions.length > 1">
            <hr />
            <div class="transaction-list-description">
              {{
                this.$gettext(
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
        <div
          v-if="
            $modal.args?.value[0].type == 'topup' &&
            $modal.args?.value[0].transaction.paid === false &&
            $modal.args?.value[0].account.isTopUpAllowed &&
            ($modal.args?.value[0].transaction?.requester === undefined ||
              $modal.args?.value[0].transaction?.requester?.id ===
                this.userProfile.id)
          "
          class="ml-2 mr-2"
        >
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
  import { showSpinnerMethod } from "@/utils/showSpinner"
  import { debounceMethod } from "@/utils/debounce"
  import applyDecorators from "@/utils/applyDecorators"
  import TransactionItem from "./TransactionItem.vue"

  function safeCentsToAmount(cents: number) {
    let sign = ""
    if (cents < 0) {
      cents = -cents
      sign = "-"
    }
    // garanteed >3 sized string representing uint
    const data_str = cents.toString().padStart(3, "0")
    return `${sign}${data_str.slice(0, -2)}.${data_str.slice(-2)}`
  }

  @Options({
    name: "ConfirmPaymentModal",
    components: {
      TransactionItem,
    },
    mounted() {
      this.$refs.paymentConfirmation.focus()
    },
    computed: {
      ...mapGetters(["numericFormat"]),
      ...mapModuleState("lokapi", ["userProfile"]),
      dateFormat() {
        return moment(this.transactionDate.toString()).format(
          "YYYY-MM-DD HH:mm:ssZ"
        )
      },
      transactionsTags() {
        return Array.from(
          new Set(this.transactions.map((t: any) => t.tags).flat())
        )
      },
      amountSentence() {
        const amount = this.transactionTotalAmount
        const currency = this.transactionCurrency

        let translatedFullSentence
        if (amount < 0) {
          // Using brackets to find our amount and add <span> around afterwards
          const amountPreGettext = `[${this.numericFormat(
            -amount
          )}] ${currency}`
          translatedFullSentence = this.$gettext("Sent %{amount}", {
            amount: amountPreGettext,
          })
        } else {
          // Using brackets to find our amount and add <span> around afterwards
          const amountPreGettext = `[${this.numericFormat(amount)}] ${currency}`
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
      transactionDate() {
        const transaction = this.$modal.args?.value[0].transaction

        const transactions = Array.isArray(transaction)
          ? transaction
          : [transaction]

        return transactions[0].date
      },

      transactions() {
        const transaction = this.$modal.args?.value[0].transaction
        return Array.isArray(transaction) ? transaction : [transaction]
      },
      transactionCurrency() {
        return this.transactions[0].currency
      },
      transactionType() {
        const transaction = this.$modal.args?.value[0].transaction
        let transactionType = ""
        if (
          transaction.amount < 0 &&
          transaction.parent.parent.safeWalletRecipient?.name ===
            transaction.related
        ) {
          transactionType = "reconversion"
        } else if (transaction.isTopUp) {
          if (transaction.paid) transactionType = "topup"
          else transactionType = "pendingTopup"
        } else {
          transactionType = "transactionDetail"
        }
        return transactionType
      },
      transactionTotalAmount() {
        // YYYvlab: inconsistent conversion
        let totalCents = this.transactions
          .map((t: any) => parseFloat(t.amount) * 100)
          .reduce((acc: number, val: number) => acc + val, 0)
        return safeCentsToAmount(totalCents)
      },
      reconversionStatus(): string {
        const transaction = this.$modal.args?.value[0].transaction
        if (!transaction.isReconversion) return ""
        return {
          true: this.$gettext("Reconversion sent"),
          false: null, // This should not happen
          received: this.$gettext("Reconversion received"),
          invoiced: this.$gettext("Reconversion invoiced"),
          paid: this.$gettext("Reconversion processed"),
        }[transaction.isReconversion.toString() as string]
      },
    },
    methods: {
      async payTopUpRequest(): Promise<void> {
        // XXXvlab: we would need to launch regular checks
        // here to acknowledge the payment
        window.open(
          this.$modal.args?.value[0].transaction.jsonData.odoo.order_url,
          "_blank"
        )
        if (this.promiseWaitPayment) {
          console.log("Already waiting for payment")
          return
        }
        let paymentStatus = null
        let orderId =
          this.$modal.args?.value[0].transaction.jsonData.odoo.order_id
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
        let myCurrentOrderId =
          this.$modal.args?.value[0].transaction.jsonData.odoo.order_id
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
            let modalArgs = this.$modal.args?.value
            let modalName = this.$modal.modal.value
            if (modalName !== "ConfirmPaymentModal") {
              // The modal was likely closed while waiting
              clearInterval(interval)
              reject(false)
              return
            }
            let myCurrentOrderId =
              this.$modal.args?.value[0].transaction.jsonData.odoo.order_id
            if (myCurrentOrderId !== orderId) {
              // The modal was likely closed while waiting
              clearInterval(interval)
              reject(false)
              return
            }
            try {
              pendingTopUp = await modalArgs[0].account._obj.getPendingTopUp()
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
            await this.$modal.args?.value[0].transaction.cancel()
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
        this.$modal.args?.value[0].refreshTransaction()
        this.$modal.args?.value[0].refreshAccounts(true)
        this.$modal.close()
      },
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
</style>
