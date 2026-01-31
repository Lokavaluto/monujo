<template>
  <div class="modal is-active">
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
            :account="$modal.args.value[0].account"
            :selectedRecipient="null"
            :config="config"
            transactionType="createRequestPay"
            @update:amount="(x) => (amount = x)"
            @update:senderMemo="(x) => (senderMemo = x)"
            @update:recipientMemo="(x) => (recipientMemo = x)"
            @update:isValid="(x) => (isValid = x)"
          />
        </section>
        <footer
          class="modal-card-foot custom-modal-card-foot is-justify-content-space-between step1-footer"
        >
          <button
            class="button custom-button-modal has-text-weight-medium is-flex-grow-1"
            @click="goToQrCode()"
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
        <div class="search-area">
          <div
            class="mt-4 is-flex is-justify-content-space-evenly is-align-items-center custom-search-bar"
          >
            <span class="search-bar-container">
              <p class="control has-icons-left custom-search-bar">
                <input
                  v-model="recipientsSearchString"
                  @input="onSearchInput"
                  class="input"
                  type="text"
                  :placeholder="$gettext('Search sender by name, email or phone')"
                  ref="searchRecipient"
                />
                <span class="icon is-small is-left">
                  <fa-icon icon="search" />
                </span>
              </p>
            </span>
          </div>
          <div class="container is-fluid custom-heavy-line-separator mt-3"></div>
        </div>
        <section
          class="modal-card-body"
          ref="recipientsContainer"
          @scroll="recipientBatchLoader.getNextElements"
        >
          <div
            v-if="recipientsSearchError"
            class="notification is-light is-danger"
          >
            {{ $gettext("An unexpected issue occurred while performing search.") }}
          </div>
          <div
            v-else
            class="custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between"
          >
            <template v-if="ownCurrenciesRecipients">
              <div
                class="is-clickable py-2"
                v-for="(recipient, index) in ownCurrenciesRecipients"
                :key="index"
              >
                <RecipientItem
                  :recipient="recipient"
                  @mousedown.prevent
                  @select="handleSelectSender(recipient)"
                />
              </div>
            </template>
            <loading
              v-if="recipientBatchLoader.isNewBatchLoading.value"
              v-model:active="recipientBatchLoader.isNewBatchLoading.value"
              :can-cancel="false"
              :is-full-page="false"
              :width="30"
              :height="30"
              class="loader-container"
            />
            <div
              v-if="recipientBatchLoader.hasNoMoreElements.value && ownCurrenciesRecipients.length === 0"
              class="is-flex is-align-items-center is-justify-content-center"
            >
              {{ $gettext("No results found") }}
            </div>
          </div>
        </section>
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
            <!-- Draft icon -->
            <div class="status-icon-container mb-3">
              <fa-icon icon="file-alt" class="status-icon draft" />
            </div>

            <!-- Status label -->
            <p class="status-label draft mb-2">
              {{ $gettext("Draft") }}
            </p>

            <!-- Amount -->
            <p class="amount has-text-weight-bold is-size-3 mb-3">
              {{ numericFormat(parseFloat(amount)) }}
              <span class="currency">{{ currency }}</span>
            </p>

            <!-- Message if present -->
            <p v-if="recipientMemo" class="message-text mb-3">
              {{ recipientMemo }}
            </p>

            <!-- From / To -->
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

    <!-- Step 4: QR Code (alternative flow) -->
    <template v-if="$modal.step.value == 4">
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
            {{ $gettext("Request money") }} - QR Code
          </p>
          <span
            v-if="$platform === 'web'"
            @click="downloadQrCodePdf"
            class="button download is-default is-rounded refresh mr-2 ml-2"
          >
            <span class="icon">
              <fa-icon icon="download" />
            </span>
          </span>
          <button class="delete" aria-label="close" @click="close()"></button>
        </header>
        <section class="modal-card-body">
          <div class="qrcode-container" ref="qrCodeTransaction">
            <QrCodeVue
              render-as="svg"
              :size="200"
              :value="qrCodeValue"
            />
          </div>
          <p class="has-text-centered is-size-4 mt-2">
            {{ $gettext("Please scan the QR code above to proceed") }}
          </p>
        </section>
        <footer class="modal-card-foot custom-modal-card-foot is-justify-content-flex-end">
          <button
            class="button custom-button-modal has-text-weight-medium"
            @click="$modal.close()"
          >
            {{ $gettext("Close") }}
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

  import "vue-loading-overlay/dist/css/index.css"
  import Loading from "vue-loading-overlay"
  import QrCodeVue from "qrcode.vue"
  import MoneyTransaction from "@/components/MoneyTransaction.vue"
  import RecipientItem from "@/components/RecipientItem.vue"
  import { UIError } from "@/exception"
  import { makeUIProxyBackend } from "@/services/lokapiService"
  import UseBatchLoading from "@/services/UseBatchLoading"
  import applyDecorators from "@/utils/applyDecorators"
  import { showSpinnerMethod } from "@/utils/showSpinner"

  @Options({
    name: "MoneyRequestModal",
    components: {
      QrCodeVue,
      MoneyTransaction,
      RecipientItem,
      Loading,
    },
    data() {
      return {
        amount: null,
        senderMemo: null,
        recipientMemo: null,
        isValid: false,
        config: {},
        recipientsSearchString: "",
        recipientsSearchError: false,
        selectedSender: null,
        isCreating: false,
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
      this.selectedBackend = makeUIProxyBackend(account.parent, this.$gettext)

      this.recipientBatchLoader = UseBatchLoading({
        genFactory: this.selectedBackend.searchRecipients.bind(
          this.selectedBackend
        ),
        needMorePredicate: () =>
          this.$refs.recipientsContainer &&
          this.$refs.recipientsContainer.scrollHeight -
            (this.$refs.recipientsContainer.scrollTop +
              this.$refs.recipientsContainer.offsetHeight) <=
            50,
        onError: (e: any) => {
          this.$msg.error(
            this.$gettext("An unexpected issue occurred while downloading recipient list")
          )
          console.error(e)
        },
      })
    },
    mounted() {
      (this.$el as HTMLElement).focus()
    },
    computed: {
      ...mapModuleState("lokapi", ["userProfile"]),
      ...mapGetters(["numericFormat"]),

      currency() {
        return this.$modal.args.value[0].account?.curr || ""
      },

      ownCurrenciesRecipients(): Array<any> {
        let currencyIds = this.$store.getters.activeVirtualAccounts.map(
          (a: any) => a.currencyId
        )
        return this.recipientBatchLoader.elements.value.filter((p: any) => {
          return currencyIds.indexOf(p.backendId) > -1
        })
      },

      qrCodeValue() {
        return JSON.stringify({
          rp: this.userProfile.id,
          rpb: this.$modal.args.value[0].account.id,
          amount: this.amount,
          senderMemo: this.senderMemo,
          recipientMemo: this.recipientMemo,
        })
      },
    },
    watch: {
      "$modal.step.value": {
        handler(newStep: number) {
          if (newStep === 2 && this.recipientBatchLoader.elements.value.length === 0) {
            this.recipientBatchLoader.newGen("")
          }
        },
      },
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
      onSearchInput(e: any) {
        this.recipientsSearchString = e.target.value
        if (
          this.recipientsSearchString.length === 0 ||
          this.recipientsSearchString.length >= 3
        ) {
          this.recipientBatchLoader.newGen(this.recipientsSearchString)
        }
      },

      handleSelectSender(recipient: any) {
        this.selectedSender = recipient
        this.$modal.next()
      },

      goToQrCode() {
        if (!this.isValid) return
        this.$modal.goTo(4)
      },

      async downloadQrCodePdf() {
        let svgQrCode = this.$refs.qrCodeTransaction.firstChild.outerHTML
        let fileName = this.$gettext(
          "QR code - Payment request to %{ name } of %{ amount } %{ currency }",
          {
            name: this.userProfile.name,
            amount: this.amount,
            currency: this.$modal.args?.value[0].account?.curr,
          }
        )
        if (this.recipientMemo) {
          fileName += " (" + this.recipientMemo + ")"
        }
        await this.$export.DownloadQrCode(svgQrCode, fileName)
      },

      createPaymentRequest: applyDecorators(
        [showSpinnerMethod(".modal-card-body")],
        async function (this: any): Promise<void> {
          if (this.isCreating) return
          this.isCreating = true

          try {
            const senderWalletUri = this.selectedSender.userAccountInternalId

            await this.account.createPaymentRequest([
              {
                sender_wallet_uri: senderWalletUri,
                receiver_wallet_uri: this.account.internalId,
                amount: parseFloat(this.amount),
                message: this.recipientMemo || null,
              }
            ])

            this.$msg.success(this.$gettext("Payment request created successfully"))

            const { refreshTransaction, refreshAccounts } = this.$modal.args.value[0]
            if (refreshTransaction) refreshTransaction()
            if (refreshAccounts) refreshAccounts()

            this.$modal.close()
          } catch (err) {
            throw new UIError(
              this.$gettext("Failed to create payment request. Please try again or contact your administrator."),
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

  .search-area {
    background: #f0faf9;
  }

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

  .custom-search-bar {
    margin: auto;
  }

  .search-bar-container {
    width: 90%;
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
