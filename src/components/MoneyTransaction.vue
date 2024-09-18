<template>
  <div class="is-flex is-flex-direction-column is-justify-content-space-evenly">
    <div class="is-flex is-flex-direction-column custom-amount-input">
      <div>
        <h2 v-if="directionTransfer === 'send'" class="frame3-sub-title mb-3">
          {{ $gettext("From") }}
        </h2>
        <h2 v-else class="frame3-sub-title mb-3">
          {{ $gettext("To") }}
        </h2>
        <BankAccountItem
          class="mb-4"
          :account="account"
          :showSubAccounts="false"
        >
          <template v-slot:name>{{ account.name() }}</template>
        </BankAccountItem>
      </div>
      <div v-if="selectedRecipient && !isReconversion">
        <h2 class="frame3-sub-title mb-3">
          {{ $gettext("To") }}
        </h2>
        <RecipientItem :recipient="selectedRecipient" />
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
            'is-danger': errors.amount || parentErrors,
          }"
          @input="handleAmountInput()"
          :disabled="config?.amount && directionTransfer !== 'receive'"
        />
        <div class="amount-currency-symbol pl-2">
          {{ selectedRecipient?.curr }}
        </div>
      </div>
      <div class="notification is-danger is-light" v-if="errors.amount">
        {{ errors.amount }}
      </div>
      <div class="notification is-danger is-light" v-if="parentErrors">
        {{ parentErrors }}
      </div>
      <textarea
        v-if="!isReconversion"
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
        v-if="!isReconversion && errors.message"
      >
        {{ errors.message }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapModuleState } from "@/utils/vuex"
  import RecipientItem from "@/components/RecipientItem.vue"
  import BankAccountItem from "@/components/BankAccountItem.vue"

  @Options({
    name: "MoneyTransaction",
    components: {
      RecipientItem,
      BankAccountItem,
    },
    emits: ["update:amount", "update:message", "update:isValid"],
    props: {
      account: Object,
      selectedRecipient: Object,
      directionTransfer: String,
      config: Object,
      parentErrors: String,
      isReconversion: Boolean,
    },
    data() {
      return {
        amount: null,
        message: null,
        errors: {
          amountLength: true,
          amount: false,
          message: false,
        },
      }
    },
    mounted() {
      this.setFocus("amountRequested")
      if (this.config?.amount) {
        this.amount = this.config?.amount
        this.message = this.config?.message
        this.errors.amountLength = this.amount?.length === 0
      }
    },
    computed: {
      isValid() {
        return Object.values(this.errors).every((value) => value === false)
      },
      ...mapModuleState("lokapi", ["userProfile"]),
    },
    watch: {
      isValid: {
        handler(newVal, oldVal) {
          this.$emit("update:isValid", newVal)
        },
      },
    },
    methods: {
      handleAmountInput() {
        this.$emit("change")
        if (this.amount <= 0 || this.amount.length === 0) {
          if (this.directionTransfer === "send")
            this.errors.amount = this.$gettext(
              "Amount to send must be a number greater than 0"
            )
          else
            this.errors.amount = this.$gettext(
              "Amount to request must be a number greater than 0"
            )
          return
        }

        const amountStrRaw = this.$refs.amountRequested.value
        const amountStr = this.amount.toString()
        // XXXvlab: this is the maximum size of a XXXX.YY that
        // is safely converted to a number in javascript. (We
        // can garantee that what the user typed in is
        // eauivalent to what we get in the code.
        const maxValue = Number.MAX_SAFE_INTEGER / 2 ** 7
        if (this.amount > maxValue) {
          this.errors.amount = this.$gettext(
            "Amount to send is too large (<= %{ maxValue })",
            { maxValue }
          )
          return
        }

        const amountParts = amountStrRaw.split(".")

        if (amountParts.length > 1) {
          if (amountParts[1].length > 2) {
            this.errors.amount = this.$gettext(
              "Amount to send must be a number with not more than 2 decimals"
            )
            return
          }
        }
        if (
          !(
            amountStr == this.$refs.amountRequested.value ||
            (amountParts.length > 1 && /0+$/.test(amountParts[1]))
          )
        ) {
          this.errors.amount = this.$gettext(
            "Unexpected amount received. Try to reenter your amount, and if the problem persists please contact your administator."
          )
          return
        }
        this.errors.amountLength = this.amount.length === 0
        this.$emit("update:amount", parseFloat(this.amount).toFixed(2))
        this.errors.amount = false
      },
      handleMessageInput() {
        if (this.message.length > 50) {
          this.errors.message = this.$gettext(
            "the message description is too long"
          )
          return
        }
        this.$emit("update:message", this.message)
        this.errors.message = false
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
  export default class MoneyTransaction extends Vue {}
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
