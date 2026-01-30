<template>
  <div class="modal is-active" ref="paymentRequest">
    <div class="modal-background"></div>

    <!-- Step 1: Payment request details -->
    <template v-if="$modal.step.value == 1">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Payment request details") }}
          </p>
          <button
            class="delete"
            aria-label="close"
            @click="$modal.close()"
          ></button>
        </header>
        <section class="modal-card-body">
          <div class="body-content is-size-4">
            <!-- Status title -->
            <p class="custom-card-title has-text-weight-bold">
              {{ statusTitle }}
            </p>

            <!-- Status icon -->
            <div class="confirm-icon-container">
              <fa-icon
                :icon="statusIcon"
                class="confirm-icon fa-thin"
                :class="paymentRequest.state"
              />
            </div>

            <!-- Amount -->
            <p class="amount has-text-weight-bold is-size-4">
              {{ amountSentence }}
            </p>

            <!-- Sender and receiver -->
            <div>
              <h2 class="frame3-sub-title">{{ $gettext("from") }}</h2>
              <p
                class="
                  frame3-sub-title
                  has-text-weight-bold
                  is-size-3
                  hide-overflow
                "
              >
                {{ paymentRequest.jsonData.sender_name }}
              </p>
            </div>
            <div>
              <h2 class="frame3-sub-title">{{ $gettext("to") }}</h2>
              <p
                class="
                  frame3-sub-title
                  has-text-weight-bold
                  is-size-3
                  hide-overflow
                "
              >
                {{ paymentRequest.jsonData.receiver_name }}
              </p>
            </div>

            <!-- Description if present -->
            <div v-if="paymentRequest.message" class="request-message">
              <h2 class="frame3-sub-title">{{ $gettext("Description") }}</h2>
              <p class="message-text">“{{ paymentRequest.message }}”</p>
            </div>

            <!-- Date and creator -->
            <p class="frame3-sub-title mb-3">
              <template v-if="paymentRequest.creatorName">
                {{ createdBySentence }}<br />
              </template>
              {{ createdOnSentence }}
            </p>

            <!-- Purpose and available actions -->
            <p class="payment-request-guidance is-size-5 mb-3">
              {{ paymentRequestGuidance }}
            </p>
          </div>
        </section>
        <footer
          class="
            modal-card-foot
            custom-modal-card-foot
            payment-request-actions
            is-justify-content-flex-end
          "
        >
          <button
            v-if="paymentRequest.isSender && paymentRequest.state === 'open'"
            class="button custom-button-modal has-text-weight-medium"
            :disabled="isPaymentInProgress"
            @click="pay()"
          >
            <span>{{ $gettext("Pay") }}</span>
          </button>
          <button
            v-if="paymentRequest.isSender && paymentRequest.state === 'open'"
            class="button custom-button-modal has-text-weight-medium"
            @click="openAction('refuse')"
          >
            <span>{{ $gettext("Refuse") }}</span>
          </button>
          <button
            v-if="
              paymentRequest.isCreator &&
              (paymentRequest.state === 'open' ||
                paymentRequest.state === 'refused')
            "
            class="button custom-button-modal has-text-weight-medium"
            @click="openAction('cancel')"
          >
            <span>{{ $gettext("Cancel") }}</span>
          </button>
          <button
            v-if="
              paymentRequest.state === 'paid' ||
              paymentRequest.state === 'cancelled'
            "
            class="button custom-button-modal has-text-weight-medium"
            @click="$modal.close()"
          >
            <span>{{ $gettext("Ok") }}</span>
          </button>
        </footer>
      </div>
    </template>

    <!-- Step 2: Explanation for refusal/cancellation -->
    <template v-if="$modal.step.value == 2">
      <div class="modal-card">
        <header class="modal-card-head">
          <span class="is-flex is-flex-shrink-0">
            <a class="mr-3 is-flex" @click="$modal.back()">
              <span class="icon has-text-white">
                <fa-icon icon="arrow-left" class="fa-lg" />
              </span>
            </a>
          </span>
          <p class="modal-card-title is-title-shrink">
            {{
              actionType === "refuse"
                ? $gettext("Refuse payment request")
                : $gettext("Cancel payment request")
            }}
          </p>
          <button
            class="delete"
            aria-label="close"
            @click="$modal.close()"
          ></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">
              {{
                actionType === "refuse"
                  ? $gettext("Explanation")
                  : $gettext("Explanation (optional)")
              }}
            </label>
            <div class="control">
              <textarea
                class="textarea"
                v-model="explanation"
                :placeholder="$gettext('Add an explanation...')"
                rows="3"
              ></textarea>
            </div>
            <p v-if="explanationError" class="help is-danger">
              {{ explanationError }}
            </p>
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
            :disabled="Boolean(explanationError) || isActionInProgress"
            @click="confirmAction()"
          >
            {{
              actionType === "refuse"
                ? $gettext("Refuse")
                : $gettext("Cancel request")
            }}
          </button>
        </footer>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapGetters } from "vuex"
  import moment from "moment"
  import { UIError } from "../exception"
  import { makeUIProxyBackend } from "@/services/lokapiService"
  import { getUserAccount } from "@/utils/account"
  import applyDecorators from "@/utils/applyDecorators"
  import { debounceMethod } from "@/utils/debounce"
  import { showSpinnerMethod } from "@/utils/showSpinner"

  @Options({
    name: "PaymentRequestModal",
    data() {
      return {
        actionType: "",
        explanation: "",
        isPaymentInProgress: false,
        isActionInProgress: false,
      }
    },
    created() {
      const [opts] = this.$modal.args.value
      const account = getUserAccount(opts.account)

      this.account = account
      this.selectedBackend = makeUIProxyBackend(account.parent, this.$gettext)
    },
    mounted() {
      this.$refs.paymentRequest.focus()
    },
    computed: {
      ...mapGetters(["numericFormat"]),

      paymentRequest() {
        return this.$modal.args.value[0].paymentRequest
      },

      currency() {
        return this.$modal.args.value[0].account?.curr || ""
      },

      statusTitle() {
        const titles: Record<string, string> = {
          open: this.$gettext("Payment requested"),
          paid: this.$gettext("Payment request paid"),
          refused: this.$gettext("Payment request refused"),
          cancelled: this.$gettext("Payment request cancelled"),
        }
        return (
          titles[this.paymentRequest.state] || this.$gettext("Payment request")
        )
      },

      statusIcon() {
        const icons: Record<string, string> = {
          open: "clock",
          paid: "check",
          refused: "times-circle",
          cancelled: "ban",
        }
        return icons[this.paymentRequest.state] || "clock"
      },

      amountSentence() {
        return this.$gettext("Requested %{amount} %{currency}", {
          amount: this.numericFormat(parseFloat(this.paymentRequest.amount)),
          currency: this.currency,
        })
      },

      createdOnSentence() {
        const date = moment(this.paymentRequest.date).format(
          "YYYY-MM-DD HH:mm:ssZ"
        )
        return this.paymentRequest.creatorName
          ? date
          : this.$gettext("Created on %{date}", { date })
      },

      createdBySentence() {
        return this.$gettext("Created by %{creator}", {
          creator: this.paymentRequest.creatorName,
        })
      },

      paymentRequestGuidance() {
        if (this.paymentRequest.state === "open") {
          if (this.paymentRequest.isSender) {
            return this.$gettext(
              "This payment request is waiting for you to pay or refuse it."
            )
          }
          if (this.paymentRequest.isCreator) {
            return this.$gettext(
              "Your payment request is waiting for the payer's response. You can cancel it."
            )
          }
          return this.$gettext(
            "This payment request is waiting for the payer's response."
          )
        }
        const messages: Record<string, string> = {
          paid: this.$gettext("This payment request has been paid."),
          refused: this.$gettext(
            "This payment request has been refused and can no longer be paid."
          ),
          cancelled: this.$gettext(
            "This payment request has been cancelled and can no longer be paid."
          ),
        }
        return messages[this.paymentRequest.state] || ""
      },

      explanationText() {
        return this.explanation.trim()
      },

      explanationError() {
        if (this.actionType === "refuse" && this.explanationText.length < 10) {
          return this.$gettext(
            "Please enter an explanation of at least 10 characters"
          )
        }
        return ""
      },
    },
    methods: {
      pay: applyDecorators(
        [showSpinnerMethod(".modal-card-body")],
        async function (this: any): Promise<void> {
          if (this.isPaymentInProgress) return
          this.isPaymentInProgress = true

          try {
            const rp = this.paymentRequest.jsonData.receiver_partner_id
            const rpb = this.paymentRequest.receiverWalletUri

            let recipient
            try {
              recipient = await this.selectedBackend.searchRecipientByUri({
                rp,
                rpb,
              })
            } catch (err) {
              throw new UIError(
                this.$gettext("An error occurred while searching recipient"),
                err
              )
            }

            const memo = this.paymentRequest.message || ""
            const { account, refreshTransaction, refreshAccounts } =
              this.$modal.args.value[0]
            const paymentRequest = this.paymentRequest

            this.$modal.close()
            await this.$modal.open("MoneyTransferModal", {
              account,
              recipient,
              transactionType: "paymentRequest",
              config: {
                amount: paymentRequest.amount,
                senderMemo: memo,
                recipientMemo: memo,
              },
              paymentRequest,
              refreshTransaction,
              refreshAccounts,
            })
          } finally {
            this.isPaymentInProgress = false
          }
        }
      ),
      openAction(actionType: "refuse" | "cancel") {
        this.actionType = actionType
        this.explanation = ""
        this.$modal.next()
      },
      confirmAction: applyDecorators(
        [debounceMethod],
        async function (this: any): Promise<void> {
          if (this.explanationError) return
          this.isActionInProgress = true
          let successMessage: string
          const explanation = this.explanationText

          try {
            if (this.actionType === "refuse") {
              await this.paymentRequest.refuse(explanation)
              successMessage = this.$gettext("Payment request refused")
            } else {
              await this.paymentRequest.cancel(explanation || undefined)
              successMessage = this.$gettext("Payment request cancelled")
            }
          } catch (err) {
            throw new UIError(
              this.$gettext(
                "Payment request status update failed, please retry or contact your administrator."
              ),
              err
            )
          } finally {
            this.isActionInProgress = false
          }

          this.$msg.success(successMessage)

          const { refreshTransaction, refreshAccounts } =
            this.$modal.args.value[0]
          if (refreshTransaction) refreshTransaction()
          if (refreshAccounts) refreshAccounts()
          this.$modal.close()
        }
      ),
    },
  })
  export default class PaymentRequestModal extends Vue {}
</script>

<style scoped lang="scss">
  @import "../assets/custom-variables";

  .body-content {
    text-align: center;
  }

  .confirm-icon-container {
    width: fit-content;
    margin: auto;
  }

  .confirm-icon {
    font-size: 4em;

    &.open {
      color: #856404;
    }

    &.paid {
      color: $color-2;
    }

    &.refused {
      color: #cc0f35;
    }

    &.cancelled {
      color: #6c757d;
    }
  }

  .hide-overflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .request-message {
    margin-bottom: 0.75rem;
  }

  .payment-request-guidance {
    color: #666;
    font-style: italic;
  }

  .message-text {
    font-style: italic;
    color: #666;
    font-size: 1rem;
    overflow-wrap: anywhere;
  }

  .textarea {
    resize: vertical;
  }

  .payment-request-actions {
    flex-wrap: nowrap;
    gap: clamp(0.25rem, 1vw, 0.5rem);

    .button {
      flex: 0 0 auto;
      margin: 0;
      border-color: $modal-btn-border-color;
      padding-right: clamp(0.75em, 2.5vw, 1.25em);
      padding-left: clamp(0.75em, 2.5vw, 1.25em);

      &:hover {
        color: $modal-btn-text-color;
        border-color: $modal-btn-border-color;
        background: $modal-btn-background-color;
        padding-right: clamp(0.75em, 2.5vw, 1.25em) !important;
        padding-left: clamp(0.75em, 2.5vw, 1.25em) !important;
      }
    }
  }
</style>
