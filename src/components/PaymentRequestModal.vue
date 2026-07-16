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
                class="frame3-sub-title has-text-weight-bold is-size-3 hide-overflow"
              >
                {{ paymentRequest.jsonData.sender_name }}
              </p>
            </div>
            <div>
              <h2 class="frame3-sub-title">{{ $gettext("to") }}</h2>
              <p
                class="frame3-sub-title has-text-weight-bold is-size-3 hide-overflow"
              >
                {{ paymentRequest.jsonData.receiver_name }}
              </p>
            </div>

            <!-- Description if present -->
            <div v-if="paymentRequest.message" class="request-message">
              <h2 class="frame3-sub-title">{{ $gettext("Description") }}</h2>
              <p class="message-text">
                “{{ paymentRequest.message }}”
              </p>
            </div>

            <!-- Date and creator -->
            <p class="frame3-sub-title mb-3">
              <template v-if="paymentRequest.creatorName">
                {{ createdBySentence }}<br />
              </template>
              {{ createdOnSentence }}
            </p>
          </div>
        </section>
        <footer
          class="modal-card-foot custom-modal-card-foot is-justify-content-flex-end"
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
            @click="startRefuse()"
          >
            <span>{{ $gettext("Refuse") }}</span>
          </button>
          <button
            v-if="paymentRequest.isCreator && (paymentRequest.state === 'open' || paymentRequest.state === 'refused')"
            class="button custom-button-modal has-text-weight-medium"
            @click="startCancel()"
          >
            <span>{{ $gettext("Cancel") }}</span>
          </button>
          <button
            v-if="paymentRequest.state === 'paid' || paymentRequest.state === 'cancelled'"
            class="button custom-button-modal has-text-weight-medium"
            @click="$modal.close()"
          >
            <span>{{ $gettext("Ok") }}</span>
          </button>
        </footer>
      </div>
    </template>

    <!-- Step 2: Reason input for refuse/cancel -->
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
            {{ actionType === 'refuse' ? $gettext("Refuse payment request") : $gettext("Cancel payment request") }}
          </p>
          <button
            class="delete"
            aria-label="close"
            @click="$modal.close()"
          ></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">{{ reasonLabel }}</label>
            <div class="control">
              <textarea
                class="textarea"
                v-model="reason"
                :placeholder="reasonPlaceholder"
                :minlength="reasonMinLength"
                rows="3"
              ></textarea>
            </div>
            <p v-if="isReasonRequired && !reason" class="help is-danger">
              {{ $gettext("This field is required") }}
            </p>
            <p v-else-if="isReasonTooShort" class="help is-danger">
              {{ $gettext("Please enter at least 10 characters") }}
            </p>
          </div>
        </section>
        <footer
          class="modal-card-foot custom-modal-card-foot is-justify-content-flex-end"
        >
          <button
            class="button custom-button-modal has-text-weight-medium"
            :disabled="!canConfirmAction"
            @click="confirmAction()"
          >
            {{ actionType === 'refuse' ? $gettext("Refuse") : $gettext("Cancel request") }}
          </button>
        </footer>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapGetters } from "vuex"
  import { e as LokapiExc } from "@lokavaluto/lokapi-browser"
  import moment from "moment"
  import { UIError } from "../exception"
  import { makeUIProxyBackend } from "@/services/lokapiService"
  import { getUserAccount } from "@/utils/account"
  import applyDecorators from "@/utils/applyDecorators"
  import { showSpinnerMethod } from "@/utils/showSpinner"

  @Options({
    name: "PaymentRequestModal",
    data() {
      return {
        actionType: "",
        reason: "",
        isPaymentInProgress: false,
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
        return titles[this.paymentRequest.state] || this.$gettext("Payment request")
      },

      statusIcon() {
        const icons: Record<string, string> = {
          open: "clock",
          paid: "fa-check",
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

      isReasonRequired() {
        return this.actionType === "refuse"
      },

      reasonMinLength() {
        return this.isReasonRequired ? 10 : undefined
      },

      reasonText() {
        return this.reason.trim()
      },

      isReasonTooShort() {
        return (
          this.isReasonRequired &&
          this.reasonText.length > 0 &&
          this.reasonText.length < 10
        )
      },

      canConfirmAction() {
        return !this.isReasonRequired || this.reasonText.length >= 10
      },

      reasonLabel() {
        if (this.actionType === "refuse") {
          return this.$gettext("Reason for refusal")
        }
        return this.$gettext("Reason for cancellation (optional)")
      },

      reasonPlaceholder() {
        if (this.actionType === "refuse") {
          return this.$gettext("Please explain why you are refusing this payment request...")
        }
        return this.$gettext("You can explain why you are cancelling this payment request...")
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
              recipient = await this.selectedBackend.searchRecipientByUri({ rp, rpb })
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
      startRefuse() {
        this.actionType = "refuse"
        this.reason = ""
        this.$modal.next()
      },
      startCancel() {
        this.actionType = "cancel"
        this.reason = ""
        this.$modal.next()
      },
      async confirmAction() {
        if (!this.canConfirmAction) return

        try {
          if (this.actionType === "refuse") {
            await this.paymentRequest.refuse(this.reasonText)
            this.$msg.success(this.$gettext("Payment request refused"))
          } else {
            await this.paymentRequest.cancel(this.reason || undefined)
            this.$msg.success(this.$gettext("Payment request cancelled"))
          }
          // Refresh data
          const { refreshTransaction, refreshAccounts } = this.$modal.args.value[0]
          if (refreshTransaction) refreshTransaction()
          if (refreshAccounts) refreshAccounts()
          // Close modal
          this.$modal.close()
        } catch (err) {
          throw new UIError(
            this.$gettext("Payment request status update failed, please retry or contact your administrator."),
            err
          )
        }
      },
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

  .message-text {
    font-style: italic;
    color: #666;
    font-size: 1rem;
    overflow-wrap: anywhere;
  }

  .textarea {
    resize: vertical;
  }
</style>
