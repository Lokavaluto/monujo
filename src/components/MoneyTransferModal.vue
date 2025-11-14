<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <template v-if="$modal.step.value == 1">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Send money") }} - 1/2
          </p>
          <button class="delete" aria-label="close" @click="close()"></button>
        </header>

        <RecipientSelector
          :account="account"
          @clickRecipient="handleClickRecipient"
          :hideBackendId="false"
        />

        <footer class="modal-card-foot is-justify-content-flex-end">
          <!--  <button class="button is-success">Save changes</button>
        <button class="button">Cancel</button> -->
        </footer>
      </div>
    </template>
    <template v-if="$modal.step.value == 2 && selectedRecipient">
      <div
        class="modal-card"
        tabindex="0"
        @keyup.enter="isReady ? sendTransaction() : null"
      >
        <header class="modal-card-head">
          <span v-if="!transactionType" class="is-flex is-flex-shrink-0">
            <a class="mr-3 is-flex" @click="$modal.back()">
              <span class="icon has-text-white">
                <fa-icon icon="arrow-left" class="fa-lg" />
              </span>
            </a>
          </span>
          <p class="modal-card-title is-title-shrink">
            {{
              transactionType === "reconversion"
                ? $gettext("Money reconversion")
                : $gettext("Send money") + " - 2/2"
            }}
          </p>
          <button class="delete" aria-label="close" @click="close()"></button>
        </header>
        <section class="modal-card-body">
          <MoneyTransaction
            directionTransfer="send"
            :account="ownSelectedAccount"
            :selectedRecipient="selectedRecipient"
            :config="config"
            :parentErrors="errors"
            :transactionType="transactionType"
            @update:amount="(x) => ((amount = x), checkTransaction(true))"
            @update:senderMemo="(x) => ((senderMemo = x), checkTransaction(x))"
            @update:recipientMemo="
              (x) => ((recipientMemo = x), checkTransaction(x))
            "
            @update:isValid="checkTransaction"
            @change="
              (ev) => (ev ? null : ((isReady = false), (errors = false)))
            "
          />
          <div v-if="plannedTransactions.length > 1">
            <hr class="transaction-list-separator" />
            <h2 class="frame3-sub-title mt-3 mb-3">
              {{
                this.$gettext(
                  "Payment will be done in %{nbTransactions} transactions:",
                  { nbTransactions: plannedTransactions.length }
                )
              }}
            </h2>
            <TransactionItem
              v-for="transaction in plannedTransactions"
              :key="transaction"
              :transaction="transaction"
              mode="small"
            />
          </div>
        </section>
        <footer
          class="
            modal-card-foot
            custom-modal-card-foot
            is-justify-content-flex-end
          "
        >
          <button
            class="button custom-button-modal has-text-weight-medium"
            id="send-money-button"
            @click="sendTransaction()"
            :disabled="!isReady || checkOngoing > 0"
          >
            <span class="icon" v-if="checkOngoing > 0">
              <fa-icon icon="arrows-rotate" class="fa-lg refreshing" />
            </span>
            <span class="icon" v-else>
              <fa-icon icon="arrow-circle-up" class="fa-lg" />
            </span>
            <span>
              {{
                transactionType === "reconversion"
                  ? $gettext("Reconversion")
                  : $gettext("Send")
              }}
            </span>
          </button>
        </footer>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapModuleState } from "@/utils/vuex"
  import { e as LokapiExc } from "@lokavaluto/lokapi-browser"

  import "vue-loading-overlay/dist/css/index.css"
  import Loading from "vue-loading-overlay"
  import RecipientItem from "@/components/RecipientItem.vue"
  import { UIError } from "../exception"
  import { makeUIProxyBackend } from "@/services/lokapiService"
  import MoneyTransaction from "./MoneyTransaction.vue"
  import TransactionItem from "./TransactionItem.vue"

  import UseBatchLoading from "@/services/UseBatchLoading"
  import { debounceMethod } from "@/utils/debounce"
  import applyDecorators from "@/utils/applyDecorators"
  import { showSpinnerMethod } from "@/utils/showSpinner"
  import RecipientSelector from "@/components/RecipientSelector.vue"

  @Options({
    name: "MoneyTransferModal",
    components: {
      RecipientItem,
      MoneyTransaction,
      TransactionItem,
      Loading,
      RecipientSelector,
    },
    data() {
      return {
        selectedRecipient: null,
        ownSelectedAccount: null,
        amount: null,
        config: {},
        senderMemo: null,
        recipientMemo: null,
        errors: false,
        account: null,
        isValid: false,
        isReady: false,
        transactionType: null,
        plannedTransactions: [],
        checkOngoing: 0,
      }
    },
    created() {
      const [opts] = this.$modal.args.value
      let { account } = opts
      if (account._obj?.getTransactions) {
        account = account._obj
      } else {
        account = account._obj.parent
      }
      this.account = account
      // No need to declare in data, no live mechanism required here
      this.selectedBackend = makeUIProxyBackend(account.parent, this.$gettext)
      this.prepareTransactionSignalHandler = null
    },
    mounted() {
      if (this.$modal.args.value[0]?.transactionType === "reconversion") {
        this.transactionType = "reconversion"
        this.toPaymentStage({
          recipient: this.$modal.args.value[0].account.safeWalletRecipient,
        })
      }
    },
    methods: {
      handleClickRecipient(config: any): void {
        return this.toPaymentStage(config)
      },
      async toPaymentStage(config: any): Promise<void> {
        this.selectedRecipient = config.recipient
        this.selectedRecipient.currencySymbol =
          await config.recipient.getSymbol()
        this.ownSelectedAccount =
          this.$store.getters.activeVirtualAccounts.find(
            (va: any) => va.currencyId === config.recipient.backendId
          )
        this.$modal.next()
        this.plannedTransactions = []
        this.errors = false
        this.isReady = false
        this.amount = config?.amount || null
        if (this.amount) this.checkTransaction()
        this.sendermemo = config?.senderMemo
        this.recipientMemo = config?.recipientMemo
        this.config = config
      },
      checkTransaction(isValid: boolean) {
        // No debounce, as here, the last check should superseed the formers, and
        // this is only a check.
        this.isReady = false
        if (this.prepareTransactionSignalHandler) {
          this.prepareTransactionSignalHandler.abort()
          this.prepareTransactionSignalHandler = null
        }
        if (!isValid || this.errors) {
          this.isValid = false
          this.plannedTransactions = []
          return false
        }
        this.isValid = true
        this.plannedTransactions = []
        this.prepareTransactionSignalHandler = new AbortController()
        this._checkTransaction(
          this.amount,
          this.senderMemo,
          this.recipientMemo,
          this.prepareTransactionSignalHandler.signal
        )
      },
      _checkTransaction: applyDecorators(
        [
          showSpinnerMethod(function (this: any, isLoading: boolean) {
            if (isLoading) {
              this.checkOngoing++
            } else {
              this.checkOngoing--
            }
          }),
        ],
        async function (
          this: any,
          amount: any,
          senderMemo: string,
          recipientMemo: string,
          signal: AbortSignal
        ): Promise<boolean | any> {
          let txs
          try {
            txs = await this.selectedRecipient.prepareTransfer(
              amount.toString(),
              senderMemo,
              recipientMemo,
              signal
            )
          } catch (err: any) {
            if (signal.aborted) return null
            if (err instanceof DOMException) {
              console.warn(
                `Recipient: Signal was not aborted but we got the exception`
              )
              return null
            }
            if (err instanceof LokapiExc.PrepareTransferException) {
              this.$msg.error(
                this.$gettext(
                  "An unexpected issue occurred while checking available funds. " +
                    "The transaction was not sent. We are sorry for the inconvenience."
                ) +
                  "<br/>" +
                  this.$gettext(
                    "You can try again. If the issue persists, " +
                      "please contact your administrator."
                  )
              )
              if (err.origException) {
                console.error("Backend exception:", err.origException)
              }
              return false
            }
            if (err instanceof LokapiExc.PrepareTransferInsufficientBalance) {
              this.errors = this.$gettext(
                "Insufficient balance. " +
                  "You only have %{ safeAmount } %{ currency } available to spend.",
                {
                  safeAmount: err.safeAmount,
                  currency: this.ownSelectedAccount.curr,
                }
              )
              return false
            }
            if (err instanceof LokapiExc.PrepareTransferUnsafeBalance) {
              this.errors = this.$gettext(
                "The last transactions were not yet all processed. " +
                  "To ensure that this payment can be sent, you need " +
                  "to wait for these pending transactions to be processed. " +
                  "This can take a few minutes. You can also lower your " +
                  "transaction amount underneath %{ realBal } %{ currency }. " +
                  "If the problem persists, please contact an administrator.",
                {
                  realBal: err.realBal,
                  currency: this.ownSelectedAccount.curr,
                }
              )
              return false
            }
            if (err instanceof LokapiExc.PrepareTransferUnsafeSplit) {
              if (err.origException === null) {
                this.errors = this.$gettext(
                  "The last transactions were not yet all processed. " +
                    "To ensure that this payment can be sent, you need " +
                    "to wait for these pending transactions to be processed. ",
                  {
                    safeAmount: err.safeAmount,
                    currency: this.ownSelectedAccount.curr,
                  }
                )
                return false
              } else {
                this.errors = this.$gettext(
                  "The last transactions were not yet all processed. " +
                    "To ensure that this payment can be sent, you need " +
                    "to wait for these pending transactions to be processed. " +
                    "This can take a few minutes. You can also lower your " +
                    "transaction amount underneath %{ safeAmount } %{ currency }. " +
                    "If the problem persists, please contact an administrator.",
                  {
                    safeAmount: err.safeAmount,
                    currency: this.ownSelectedAccount.curr,
                  }
                )
                return false
              }
            }
            if (err instanceof LokapiExc.RecipientWouldHitCmHighLimit) {
              this.errors = this.$gettext(
                "Recipient can not receive this much mutual currency unit. " +
                  "You can lower your transaction amount underneath " +
                  "%{ safeAmount } %{ currency } so-as to avoid recipient " +
                  "to reach its mutual currency unit limit. Otherwise, you'll " +
                  "need to get more reconvertible currency units to avoid relying " +
                  "on mutual currency units with this recipient.",
                {
                  safeAmount: err.safeAmount,
                  currency: this.ownSelectedAccount.curr,
                }
              )
              return false
            }
            this.errors = this.$gettext(
              "Unexpected error while checking transfer, " +
                "pleace contact your administrator."
            )
            throw err
          }
          if (!txs) {
            this.isReady = false
            return false
          }
          this.plannedTransactions = txs
          this.isReady = true
        }
      ),
      _executeTransaction: applyDecorators(
        [showSpinnerMethod(".modal-card-body")],
        async function (this: any): Promise<boolean | any> {
          let payments = []
          try {
            for (const tx of this.plannedTransactions) {
              payments.push(await tx.execute())
            }
          } catch (err: any) {
            if (err instanceof LokapiExc.PaymentConfirmationMissing) {
              this.$modal.args.value[0].refreshTransaction()
              this.close()
              this.$msg.warning(
                this.$gettext(
                  "The transaction was sent but no confirmation was received. "
                ) +
                  "<br/>" +
                  this.$gettext(
                    "Please make sure to double check in the transaction list " +
                      "if this transaction appears in the near future. "
                  ) +
                  "<br/>" +
                  this.$gettext(
                    "Contact your administrator if it fails to show up."
                  ),
                false
              )
              return false
            }
            if (err instanceof LokapiExc.InsufficientBalance) {
              this.errors = this.$gettext(
                "Transaction was refused due to insufficient balance"
              )
              return false
            }
            if (err instanceof LokapiExc.InactiveAccount) {
              this.$msg.error(
                this.$gettext("Target account is inactive.") +
                  "<br/>" +
                  this.$gettext("You can't send money to this account.")
              )
              return false
            }
            if (err.message === "User canceled the dialog box") {
              // A warning message should have already been sent
              return false
            }
            this.$msg.error(
              this.$gettext(
                "An unexpected issue occurred during the money transfer. " +
                  "We are sorry for the inconvenience."
              ) +
                "<br/>" +
                this.$gettext(
                  "You can try again. If the issue persists, " +
                    "please contact your administrator."
                )
            )

            console.error("Payment failed:", err)
            return false
          }
          return payments
        }
      ),
      sendTransaction: applyDecorators(
        [debounceMethod],
        async function (this: any): Promise<void> {
          const payment = await this._executeTransaction()
          if (payment === false) return

          this.$modal.args.value[0].refreshTransaction()
          this.$modal.args.value[0].refreshAccounts(true)
          this.close()

          await this.$modal.open("ConfirmPaymentModal", {
            transaction: payment,
            type:
              this.transactionType === "reconversion"
                ? "reconversion"
                : "paymentConfirmation",
          })
          if (
            !this.selectedRecipient.is_favorite &&
            this.transactionType !== "reconversion"
          ) {
            let answer
            try {
              answer = await this.$dialog.show({
                title: this.$gettext("Add as favorite"),
                content: this.$gettext(
                  "Do you want to add %{ name } to your favorite list ?",
                  { name: this.selectedRecipient.name }
                ),
                buttons: [
                  { label: this.$gettext("Add"), id: "add" },
                  { label: this.$gettext("Later"), id: "later" },
                ],
              })
            } catch (err: any) {
              if (err.message === "User canceled the dialog box") {
                answer = "later"
              } else {
                throw err
              }
            }
            if (answer === "add") {
              await this.selectedRecipient.toggleFavorite()
              this.$msg.success(
                this.$gettext("%{ name } was added to your favorite list", {
                  name: this.selectedRecipient.name,
                })
              )
            }
          }
        }
      ),
      wait(ms: number): Promise<void> {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve()
          }, ms)
        })
      },
      close() {
        this.searchName = ""
        this.amount = 0
        this.activeClass = 0
        this.$modal.close()
      },
      setFocus(refLabel: string) {
        this.$nextTick(() => {
          const ref = this.$refs[refLabel]
          ref.focus()
          ref.select()
        })
      },
    },
  })
  export default class MoneyTransferModal extends Vue {}
</script>
<style lang="scss" scoped>
  @import "@/assets/custom-variables";

  .button.action {
    white-space: normal;
    height: auto;
  }
  .modal-card-body {
    min-height: 120px;
  }
  .loader-container {
    position: relative;
    height: 80px;
  }
  .amount-currency-symbol {
    margin: auto;
    font-size: 1.25em;
    font-weight: bold;
    line-height: 1em;
    padding-bottom: calc(0.5em - 1px);
    padding-left: calc(0.75em - 1px);
    padding-right: calc(0.75em - 1px);
    padding-top: calc(0.5em - 1px);
  }
  hr.transaction-list-separator {
    margin-top: 0.2em;
    margin-bottom: 0.2em;
  }
  h2 {
    font-weight: 500;
  }
</style>
