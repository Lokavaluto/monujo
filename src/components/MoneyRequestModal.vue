<template>
  <div class="modal is-active" tabindex="0">
    <div class="modal-background"></div>

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
            :config="form"
            transactionType="createRequestPay"
            @update:amount="form.amount = $event"
            @update:senderMemo="form.senderMemo = $event"
            @update:recipientMemo="form.recipientMemo = $event"
            @update:isValid="(x) => (isValid = x)"
          />

          <!-- Recurrence options -->
          <RecurrenceOptions
            v-if="isPaymentRequestAllowed"
            v-model:enabled="isRecurrenceEnabled"
            v-model:interval="recurringInterval"
            v-model:ruleType="recurringRuleType"
            v-model:startDate="dateStart"
            v-model:endDate="dateEnd"
            :label="$gettext('Set up a recurring request')"
          />
        </section>
        <footer
          class="
            modal-card-foot
            custom-modal-card-foot
            is-justify-content-flex-end
          "
        >
          <!-- Regular mode: QR code and Generate request buttons -->
          <template v-if="!isRecurrenceEnabled">
            <button
              :disabled="!isValid"
              class="button custom-button-modal has-text-weight-medium"
              @click="openQrCode()"
            >
              <span class="icon">
                <fa-icon icon="qrcode" />
              </span>
              <span>{{ $gettext("QR code") }}</span>
            </button>
            <button
              v-if="isPaymentRequestAllowed"
              :disabled="!isValid"
              class="button custom-button-modal has-text-weight-medium"
              @click="$modal.next()"
            >
              <span class="icon">
                <fa-icon icon="plus-circle" />
              </span>
              <span>{{ $gettext("Generate request") }}</span>
            </button>
          </template>
          <!-- Recurrence mode: Create recurrence payment button -->
          <button
            v-else-if="isPaymentRequestAllowed"
            :disabled="!isRecurrenceReady"
            class="button custom-button-modal has-text-weight-medium"
            @click="$modal.next()"
          >
            <span class="icon">
              <fa-icon icon="sync" />
            </span>
            <span>{{ $gettext("Create recurrence payment") }}</span>
          </button>
        </footer>
      </div>
    </template>

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
          @clickRecipient="handleSelectSender"
        />
        <footer class="modal-card-foot is-justify-content-flex-end"></footer>
      </div>
    </template>

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
              {{ numericFormat(parseFloat(form.amount)) }}
              <span class="currency">{{ currency }}</span>
            </p>

            <p v-if="form.recipientMemo" class="message-text mb-3">
              {{ form.recipientMemo }}
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
        <footer
          class="
            modal-card-foot
            custom-modal-card-foot
            is-justify-content-center
          "
        >
          <button
            class="
              button
              custom-button-modal
              button-modal
              has-text-weight-medium
              action
            "
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
        isValid: false,
        form: {
          amount: null,
          senderMemo: null,
          recipientMemo: null,
        },
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
      isPaymentRequestAllowed(): boolean {
        return (
          this.$modal.args.value[0].account?.isPaymentRequestAllowed === true
        )
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
          amount: this.form.amount,
          senderMemo: this.form.recipientMemo, // In request context, recipientMemo is the message
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
            amount: this.form.amount,
            currency: this.account?.curr,
          }
        )
        if (this.form.recipientMemo) {
          name += " (" + this.form.recipientMemo + ")"
        }
        this.$modal.open("QrCodeModal", {
          title: this.$gettext("Request money"),
          label: this.$gettext("Please scan the QR code above to proceed"),
          name,
          data: {
            rp: this.userProfile.id,
            rpb: this.account.id,
            amount: this.form.amount,
            senderMemo: this.form.senderMemo,
            recipientMemo: this.form.recipientMemo,
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
                amount: parseFloat(this.form.amount),
                message: this.form.recipientMemo || null,
              },
            ])
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

          this.$msg.success(
            this.$gettext("Payment request created successfully")
          )

          const { refreshTransaction, refreshAccounts } =
            this.$modal.args.value[0]
          if (refreshTransaction) refreshTransaction()
          if (refreshAccounts) refreshAccounts()

          this.$modal.close()
        }
      ),

      close() {
        this.form.amount = 0
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

  .button .icon {
    margin-right: 0.3em;
  }
</style>
