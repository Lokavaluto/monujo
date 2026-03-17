<template>
  <div
    class="modal is-active"
    tabindex="0"
    @keyup.enter="isValid ? openQrCode() : null"
  >
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-title-shrink">
          {{ $gettext("Request money") }}
        </p>
        <button class="delete" aria-label="close" @click="close()"></button>
      </header>
      <section class="modal-card-body">
        <MoneyTransaction
          directionTransfer="receive"
          :account="account"
          :selectedRecipient="selectedRecipient"
          :config="config"
          transactionType="createRequestPay"
          @update:amount="(x) => (amount = x)"
          @update:senderMemo="(x) => (senderMemo = x)"
          @update:recipientMemo="(x) => (recipientMemo = x)"
          @update:isValid="(x) => (isValid = x)"
        />
      </section>
      <footer
        class="
          modal-card-foot
          custom-modal-card-foot
          is-justify-content-flex-end
        "
      >
        <button
          :disabled="!isValid"
          class="button custom-button-modal has-text-weight-medium"
          id="send-money-button"
          @click="openQrCode()"
        >
          {{ $gettext("Generate QR code") }}
        </button>
      </footer>
    </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapModuleState } from "@/utils/vuex"

  import MoneyTransaction from "@/components/MoneyTransaction.vue"

  @Options({
    name: "MoneyRequestModal",
    components: {
      MoneyTransaction,
    },
    data() {
      return {
        account: null,
        amount: null,
        senderMemo: null,
        recipientMemo: null,
        isValid: false,
        config: {},
      }
    },
    created() {
      this.account = this.$modal.args.value[0].account
    },
    mounted() {
      ;(this.$el as HTMLElement).focus()
    },
    computed: {
      ...mapModuleState("lokapi", ["userProfile"]),
    },
    watch: {
      senderMemo: {
        handler(newVal, oldVal) {
          this.config.senderMemo = newVal
        },
      },
      recipientMemo: {
        handler(newVal, oldVal) {
          this.config.recipientMemo = newVal
        },
      },
      amount: {
        handler(newVal, oldVal) {
          this.config.amount = newVal
        },
      },
    },
    methods: {
      openQrCode() {
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
