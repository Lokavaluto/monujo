<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <template v-if="$modal.step.value == 1">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Request money") }} - 1/2
          </p>
          <button class="delete" aria-label="close" @click="close()"></button>
        </header>
        <section class="modal-card-body">
          <div
            class="
              is-flex is-flex-direction-column is-justify-content-space-evenly
            "
          >
            <div class="is-flex is-flex-direction-column custom-amount-input">
              <div v-if="selectedAccount">
                <h2 class="frame3-sub-title mb-3">
                  {{ $gettext("To") }}
                </h2>
                <BankAccountItem
                  :bal="selectedAccount.bal"
                  :curr="selectedAccount.curr"
                  :backend="selectedAccount.backend"
                  :type="selectedAccount.type"
                  :active="selectedAccount.active"
                  class="mb-4"
                >
                  <template v-slot:name>{{ selectedAccount.name() }}</template>
                </BankAccountItem>
              </div>
              <h2 class="frame3-sub-title mt-3 mb-3">
                {{ $gettext("Amount") }}
              </h2>
              <div class="is-flex">
                <input
                  v-model.number="amount"
                  ref="amountRequested"
                  type="number"
                  min="0"
                  class="input is-custom"
                  id="send-amount-input"
                  :placeholder="$gettext('e.g. 50')"
                  :class="{
                    'is-danger': errors.amount,
                  }"
                  @input="handleAmountInput()"
                />
                <div class="amount-currency-symbol pl-2">
                  {{ selectedAccount?.curr }}
                </div>
              </div>
              <div class="notification is-danger is-light" v-if="errors.amount">
                {{ errors.amount }}
              </div>
              <textarea
                @input="handleMessageInput()"
                v-model="message"
                class="custom-textarea textarea mt-5"
                :class="{
                  'is-danger': errors.message,
                }"
                :placeholder="$gettext('Add a memo (optional)')"
              ></textarea>
              <div
                class="notification is-danger is-light mt-2"
                v-if="errors.message"
              >
                {{ errors.message }}
              </div>
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
          <button
            :disabled="!amount || errors.amount || errors.message"
            class="button custom-button-modal has-text-weight-medium"
            id="send-money-button"
            @click="$modal.next()"
          >
            {{ $gettext("Generate QrCode") }}
          </button>
        </footer>
      </div>
    </template>
    <template v-if="$modal.step.value == 2">
      <div class="modal-card">
        <header class="modal-card-head">
          <span class="is-flex is-flex-shrink-0">
            <a
              class="mr-3 is-flex"
              @click="$modal.back(), setFocus('amountRequested')"
            >
              <span class="icon has-text-white">
                <fa-icon icon="arrow-left" class="fa-lg" />
              </span>
            </a>
          </span>
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Request money") }} - 2/2
          </p>
          <button class="delete" aria-label="close" @click="close()"></button>
        </header>
        <section class="modal-card-body">
          <div class="qrcode-container" ref="qrCode">
            <QrCodeVue
              render-as="svg"
              :size="200"
              :value="
                JSON.stringify({
                  rp: userProfile.id,
                  rpb: $modal.args.value[0].account.id,
                  amount: amount,
                  message: message,
                })
              "
            />
          </div>
          <p class="has-text-centered is-size-4 mt-2">
            {{ $gettext("Please scan the QR code above to proceed") }}
          </p>
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

  import Loading from "vue-loading-overlay"
  import "vue-loading-overlay/dist/css/index.css"
  import BankAccountItem from "@/components/BankAccountItem.vue"
  import QrCodeVue from "qrcode.vue"

  import UseBatchLoading from "@/services/UseBatchLoading"

  @Options({
    name: "MoneyRequestModal",
    components: {
      Loading,
      BankAccountItem,
      QrCodeVue,
    },
    data() {
      return {
        selectedAccount: null,
        amount: null,
        message: null,
        errors: {
          amount: false,
          message: false,
        },
      }
    },
    mounted() {
      this.setFocus("amountRequested")
      this.selectedAccount = this.$modal.args.value[0].account
    },
    computed: {
      ...mapModuleState("lokapi", ["userProfile"]),
    },
    methods: {
      handleMessageInput() {
        if (this.message.length > 50) {
          this.errors.message = this.$gettext(
            "the message description is too long"
          )
          return
        }
        this.errors.message = false
      },
      handleAmountInput() {
        if (this.amount <= 0 || this.amount.length === 0) {
          this.errors.amount = this.$gettext(
            "Amount requested must be a number greater than 0"
          )
          return
        }
        this.errors.amount = false
      },
      close() {
        this.amount = 0
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
  .card-recipient-wrapper {
    width: 90%;
  }
  .favorit-icon-wrapper {
    width: 10%;
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
  .w-100 {
    width: 100%;
  }
  .custom-search-bar {
    margin: auto;
  }
  .search-bar-container {
    width: 75%;
  }
  .qrcode-icon {
    font-size: 1.5em;
    opacity: 0.8;
    padding: 0.1em;
    border: 0.2em solid #e8e8e8;
    border-radius: 5px;
  }
  .custom-search-bar input {
    background: #ffffff;
    border: 1px solid #e8e8e8;
    border-radius: 24px;
    width: 100% !important;
  }

  .custom-pictogram-search svg {
    width: 24px !important;
    height: 24px !important;
  }

  .custom-pictogram-search path,
  rect {
    fill: $color-2 !important;
    background: $color-2 !important;
  }

  .custom-button-pictogram {
    background-color: inherit !important;
    border: none;
    cursor: pointer;
  }
  .qrcode-container {
    width: fit-content;
    margin: auto;
  }
</style>
