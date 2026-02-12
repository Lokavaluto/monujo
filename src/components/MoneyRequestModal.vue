<template>
  <div
    class="modal is-active"
    tabindex="0"
    @keyup.enter="isValid ? openQrCode() : null"
  >
    <div class="modal-background"></div>

    <!-- Step 1: Amount and message input -->
    <template v-if="$modal.step.value == 1">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Request money") }} - 1/3
          </p>
          <button class="delete" aria-label="close" @click="close()"></button>
        </header>
        <section class="modal-card-body">
          <MoneyTransaction
            directionTransfer="receive"
            :account="account"
            :selectedRecipient="null"
            :config="config"
            transactionType="createRequestPay"
            @update:amount="(x) => (amount = x)"
            @update:senderMemo="(x) => (senderMemo = x)"
            @update:recipientMemo="(x) => (recipientMemo = x)"
            @update:isValid="(x) => (isValid = x)"
          />

          <!-- Recurrence options -->
          <RecurrenceOptions
            v-model:enabled="isRecurrenceEnabled"
            v-model:interval="recurringInterval"
            v-model:ruleType="recurringRuleType"
            v-model:startDate="dateStart"
            v-model:endDate="dateEnd"
            :label="$gettext('Set up a recurring request')"
          />
        </section>
        <footer
          class="modal-card-foot custom-modal-card-foot is-justify-content-space-between step1-footer"
        >
          <!-- Regular mode: QR code and Generate request buttons -->
          <template v-if="!isRecurrenceEnabled">
            <button
              :disabled="!isValid"
              class="button custom-button-modal has-text-weight-medium is-flex-grow-1"
              @click="openQrCode()"
            >
              <span class="icon">
                <fa-icon icon="qrcode" />
              </span>
              <span>{{ $gettext("QR code") }}</span>
            </button>
            <button
              :disabled="!isValid"
              class="button custom-button-modal has-text-weight-medium is-flex-grow-1"
              @click="$modal.next()"
            >
              <span class="icon">
                <fa-icon icon="plus-circle" />
              </span>
              <span>{{ $gettext("Generate request") }}</span>
            </button>
          </template>
          <!-- Recurrence mode: Create recurrence contract button -->
          <button
            v-else
            :disabled="!isRecurrenceReady"
            class="button custom-button-modal has-text-weight-medium is-flex-grow-1"
            @click="$modal.next()"
          >
            <span class="icon">
              <fa-icon icon="sync" />
            </span>
            <span>{{ $gettext("Create recurrence contract") }}</span>
          </button>
        </footer>
      </div>
    </template>

    <!-- Step 2: Search and select sender -->
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
            {{ $gettext("Request money") }} - 2/3
          </p>
          <button class="delete" aria-label="close" @click="close()"></button>
        </header>
        <RecipientSelector
          :currency="selectedBackend"
          :showQrCode="false"
          :placeholder="$gettext('Search sender by name, email or phone')"
          :noRecipientsLabel="$gettext('No results found')"
          @clickRecipient="handleSelectSender"
        />
        <footer class="modal-card-foot is-justify-content-flex-end"></footer>
      </div>
    </template>

    <!-- Step 3: Confirmation -->
    <template v-if="$modal.step.value == 3">
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
            {{ $gettext("Request money") }} - 3/3
          </p>
          <button class="delete" aria-label="close" @click="close()"></button>
        </header>
        <section class="modal-card-body">
          <div class="body-content is-size-4">
            <div class="status-icon-container mb-3">
              <fa-icon icon="file-alt" class="status-icon draft" />
            </div>

            <p class="status-label draft mb-2">
              {{ $gettext("Draft") }}
            </p>

            <p class="amount has-text-weight-bold is-size-3 mb-3">
              {{ numericFormat(parseFloat(amount)) }}
              <span class="currency">{{ currency }}</span>
            </p>

            <p v-if="recipientMemo" class="message-text mb-3">
              {{ recipientMemo }}
            </p>

            <div class="parties mb-3">
              <p class="frame3-sub-title">{{ $gettext("from") }}</p>
              <p class="party-name has-text-weight-bold is-size-5">
                {{ selectedSender?.name }}
              </p>
              <p class="frame3-sub-title mt-2">{{ $gettext("to") }}</p>
              <p class="party-name has-text-weight-bold is-size-5">
                {{ userProfile.name }}
              </p>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot custom-modal-card-foot is-justify-content-center">
          <button
            class="button custom-button-modal button-modal has-text-weight-medium action"
            :disabled="isCreating"
            @click="createPaymentRequest()"
          >
            <span class="icon">
              <fa-icon icon="check" />
            </span>
            <span>{{ $gettext("Create request") }}</span>
          </button>
        </footer>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapModuleState } from "@/utils/vuex"
  import { mapGetters } from "vuex"

  import MoneyTransaction from "@/components/MoneyTransaction.vue"
  import RecipientSelector from "@/components/RecipientSelector.vue"
  import RecurrenceOptions from "@/components/RecurrenceOptions.vue"
  import { UIError } from "@/exception"
  import { makeUIProxyBackend } from "@/services/lokapiService"
  import { getUserAccount } from "@/utils/account"
  import applyDecorators from "@/utils/applyDecorators"
  import { showSpinnerMethod } from "@/utils/showSpinner"

  @Options({
    name: "MoneyRequestModal",
    components: {
      MoneyTransaction,
      RecipientSelector,
      RecurrenceOptions,
    },
    data() {
      return {
        account: null,
        amount: null,
        senderMemo: null,
        recipientMemo: null,
        isValid: false,
        config: {},
        backendAccount: null,
        selectedSender: null,
        isCreating: false,
        // Recurrence fields
        isRecurrenceEnabled: false,
        recurringRuleType: "monthly",
        recurringInterval: 1,
        dateStart: null,
        dateEnd: null,
      }
    },
    created() {
      const [opts] = this.$modal.args.value
      this.account = opts.account
      const backendAccount = getUserAccount(opts.account)

      this.backendAccount = backendAccount
      this.selectedBackend = makeUIProxyBackend(
        backendAccount.parent,
        this.$gettext
      )
    },
    mounted() {
      ;(this.$el as HTMLElement).focus()
    },
    computed: {
      ...mapModuleState("lokapi", ["userProfile"]),
      ...mapGetters(["numericFormat"]),

      currency() {
        return this.$modal.args.value[0].account?.curr || ""
      },
      isRecurrenceReady(): boolean {
        return (
          this.isRecurrenceEnabled &&
          this.isValid &&
          this.recurringInterval > 0 &&
          this.recurringRuleType &&
          this.dateStart
        )
      },

    },
    watch: {
      senderMemo: {
        handler(newVal: any) {
          this.config.senderMemo = newVal
        },
      },
      recipientMemo: {
        handler(newVal: any) {
          this.config.recipientMemo = newVal
        },
      },
      amount: {
        handler(newVal: any) {
          this.config.amount = newVal
        },
      },
    },
    methods: {
      handleSelectSender(data: any) {
        this.selectedSender = data.recipient
        if (this.isRecurrenceEnabled) {
          // Open RecurrentContractModal for recurrence creation
          this.openRecurrenceModal(data.recipient)
        } else {
          this.$modal.next()
        }
      },

      async openRecurrenceModal(sender: any) {
        await this.$modal.open("RecurrentContractModal", {
          mode: "create",
          requestMode: true, // Indicates this is a payment request (sender/receiver swapped)
          amount: this.amount,
          senderMemo: this.recipientMemo, // In request context, recipientMemo is the message
          account: this.$modal.args.value[0].account,
          selectedSender: sender, // The person who will pay
          dateStart: this.dateStart,
          dateEnd: this.dateEnd,
          recurringRuleType: this.recurringRuleType,
          recurringInterval: this.recurringInterval,
          refreshTransaction: this.$modal.args.value[0].refreshTransaction,
          refreshAccounts: this.$modal.args.value[0].refreshAccounts,
        })
        this.close()
      },

      openQrCode() {
        if (!this.isValid) return
        let name = this.$gettext(
          "QR code - Payment request to %{ name } of %{ amount } %{ currency }",
          {
            name: this.userProfile.name,
            amount: this.amount,
            currency: this.account?.curr,
          }
        )
        if (this.recipientMemo) {
          name += " (" + this.recipientMemo + ")"
        }
        this.$modal.open("QrCodeModal", {
          title: this.$gettext("Request money"),
          label: this.$gettext("Please scan the QR code above to proceed"),
          name,
          data: {
            rp: this.userProfile.id,
            rpb: this.account.id,
            amount: this.amount,
            senderMemo: this.senderMemo,
            recipientMemo: this.recipientMemo,
          },
        })
      },

      createPaymentRequest: applyDecorators(
        [showSpinnerMethod(".modal-card-body")],
        async function (this: any): Promise<void> {
          if (this.isCreating) return
          this.isCreating = true

          try {
            const senderWalletUri = this.selectedSender.userAccountInternalId

            await this.backendAccount.createPaymentRequest([
              {
                sender_wallet_uri: senderWalletUri,
                receiver_wallet_uri: this.backendAccount.internalId,
                amount: parseFloat(this.amount),
                message: this.recipientMemo || null,
              },
            ])

            this.$msg.success(
              this.$gettext("Payment request created successfully")
            )

            const { refreshTransaction, refreshAccounts } =
              this.$modal.args.value[0]
            if (refreshTransaction) refreshTransaction()
            if (refreshAccounts) refreshAccounts()

            this.$modal.close()
          } catch (err) {
            throw new UIError(
              this.$gettext(
                "Failed to create payment request. Please try again or contact your administrator."
              ),
              err
            )
          } finally {
            this.isCreating = false
          }
        }
      ),

      close() {
        this.amount = 0
        this.$modal.close()
      },

      setFocus(refLabel: string) {
        this.$nextTick(() => {
          const ref = this.$refs[refLabel]
          if (ref) {
            ref.focus()
            ref.select()
          }
        })
      },
    },
  })
  export default class MoneyRequestModal extends Vue {}
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
  .w-100 {
    width: 100%;
  }
  .custom-search-bar {
    margin: auto;
  }
  .search-bar-container {
    width: 75%;
  }
  .custom-search-bar input {
    background: #ffffff;
    border: 1px solid #e8e8e8;
    border-radius: 24px;
    width: 100% !important;
  }

  .qrcode-container {
    width: fit-content;
    margin: auto;
  }

  // Confirmation step styles (similar to PaymentRequestModal)
  .body-content {
    text-align: center;
  }

  .status-icon-container {
    width: fit-content;
    margin: auto;
  }

  .status-icon {
    font-size: 4em;

    &.draft {
      color: #6c757d;
    }
  }

  .status-label {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.05em;

    &.draft {
      color: #6c757d;
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

  .modal-card-foot {
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .step1-footer {
    flex-wrap: nowrap;
    gap: 0.75rem;

    .button {
      flex: 1 1 0;
      min-width: 0;
      padding-left: 0.5em;
      padding-right: 0.5em;
    }
  }

  .button .icon {
    margin-right: 0.3em;
  }
</style>
