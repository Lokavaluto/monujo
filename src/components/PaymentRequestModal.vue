<template>
  <div class="modal is-active">
    <div class="modal-background"></div>

    <!-- Step 1: Payment request details -->
    <template v-if="$modal.step.value == 1">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Payment request") }}
          </p>
          <button
            class="delete"
            aria-label="close"
            @click="$modal.close()"
          ></button>
        </header>
        <section class="modal-card-body">
          <div class="body-content is-size-4">
            <!-- Status icon -->
            <div class="status-icon-container mb-3">
              <fa-icon
                v-if="paymentRequest.state === 'open'"
                icon="clock"
                class="status-icon pending"
              />
              <fa-icon
                v-else-if="paymentRequest.state === 'refused'"
                icon="times-circle"
                class="status-icon refused"
              />
              <fa-icon
                v-else-if="paymentRequest.state === 'paid'"
                icon="check-circle"
                class="status-icon paid"
              />
              <fa-icon
                v-else-if="paymentRequest.state === 'cancelled'"
                icon="ban"
                class="status-icon cancelled"
              />
            </div>

            <!-- Status label -->
            <p class="status-label mb-2" :class="paymentRequest.state">
              {{ stateLabel }}
            </p>

            <!-- Amount -->
            <p class="amount has-text-weight-bold is-size-3 mb-3">
              {{ numericFormat(parseFloat(paymentRequest.amount)) }}
              <span class="currency">{{ currency }}</span>
            </p>

            <!-- Message if present -->
            <p v-if="paymentRequest.message" class="message-text mb-3">
              « {{ paymentRequest.message }} »
            </p>

            <!-- From / To -->
            <div class="parties mb-3">
              <p class="frame3-sub-title">{{ $gettext("from") }}</p>
              <p class="party-name has-text-weight-bold is-size-5">
                {{ paymentRequest.jsonData.sender_name }}
              </p>
              <p class="frame3-sub-title mt-2">{{ $gettext("to") }}</p>
              <p class="party-name has-text-weight-bold is-size-5">
                {{ paymentRequest.jsonData.receiver_name }}
              </p>
            </div>

            <!-- Date and creator -->
            <p class="frame3-sub-title date-info">
              {{ $gettext("Created on") }} {{ dateFormat(paymentRequest.date) }}
              {{ $gettext("by") }} {{ paymentRequest.creatorName }}
            </p>
          </div>
        </section>
        <footer class="modal-card-foot custom-modal-card-foot is-justify-content-center">
          <button
            v-if="paymentRequest.isSender && paymentRequest.state === 'open'"
            class="button custom-button-modal button-modal has-text-weight-medium action"
            :disabled="isPaymentInProgress"
            @click="pay()"
          >
            <span class="icon">
              <fa-icon icon="paper-plane" />
            </span>
            <span>{{ $gettext("Pay") }}</span>
          </button>
          <button
            v-if="paymentRequest.isSender && paymentRequest.state === 'open'"
            class="button custom-button-modal button-modal has-text-weight-medium action btn-danger"
            @click="startRefuse()"
          >
            <span class="icon">
              <fa-icon icon="times" />
            </span>
            <span>{{ $gettext("Refuse") }}</span>
          </button>
          <button
            v-if="paymentRequest.isCreator && (paymentRequest.state === 'open' || paymentRequest.state === 'refused')"
            class="button custom-button-modal button-modal has-text-weight-medium action btn-secondary"
            @click="startCancel()"
          >
            <span class="icon">
              <fa-icon icon="ban" />
            </span>
            <span>{{ $gettext("Cancel") }}</span>
          </button>
          <button
            v-if="paymentRequest.state === 'paid' || paymentRequest.state === 'cancelled'"
            class="button custom-button-modal button-modal has-text-weight-medium"
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
                rows="3"
              ></textarea>
            </div>
            <p v-if="isReasonRequired && !reason" class="help is-danger">
              {{ $gettext("This field is required") }}
            </p>
          </div>
        </section>
        <footer class="modal-card-foot custom-modal-card-foot is-justify-content-flex-end">
          <button
            class="button custom-button-modal button-modal has-text-weight-medium"
            @click="$modal.back()"
          >
            {{ $gettext("Back") }}
          </button>
          <button
            class="button custom-button-modal button-modal has-text-weight-medium btn-danger"
            :disabled="isReasonRequired && !reason"
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
    computed: {
      ...mapGetters(["dateFormat", "numericFormat"]),

      paymentRequest() {
        return this.$modal.args.value[0].paymentRequest
      },

      currency() {
        return this.$modal.args.value[0].account?.curr || ""
      },

      stateLabel() {
        const stateTranslations: { [key: string]: string } = {
          open: this.$gettext("pending"),
          paid: this.$gettext("paid"),
          refused: this.$gettext("refused"),
          cancelled: this.$gettext("cancelled"),
        }
        return stateTranslations[this.paymentRequest.state] || this.paymentRequest.state
      },

      isReasonRequired() {
        return this.actionType === "refuse"
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
        try {
          if (this.actionType === "refuse") {
            await this.paymentRequest.refuse(this.reason)
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

  .status-icon-container {
    width: fit-content;
    margin: auto;
  }

  .status-icon {
    font-size: 4em;

    &.pending {
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

  .status-label {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.05em;

    &.open {
      color: #856404;
    }

    &.paid {
      color: #155724;
    }

    &.refused {
      color: #721c24;
    }

    &.cancelled {
      color: #383d41;
    }
  }

  .amount {
    .currency {
      font-size: 0.7em;
      opacity: 0.8;
    }
  }

  .message-text {
    font-style: italic;
    color: #666;
    font-size: 1rem;
  }

  .parties {
    .frame3-sub-title {
      color: #888;
      font-size: 0.9rem;
    }

    .party-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .date-info {
    color: #888;
    font-size: 0.85rem;
  }

  .modal-card-foot {
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .button.action {
    white-space: normal;
    height: auto;

    .icon {
      margin-right: 0.3em;
    }
  }

  .btn-danger {
    background-color: #cc0f35 !important;
    color: white !important;
  }

  .btn-secondary {
    background-color: #6c757d !important;
    color: white !important;
  }

  .textarea {
    resize: vertical;
  }
</style>
