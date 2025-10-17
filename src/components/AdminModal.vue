<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <template v-if="$modal.step.value == 1">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Recipient Selector") }} - 1/2
          </p>
          <button class="delete" aria-label="close" @click="close()"></button>
        </header>
        <RecipientSelector
          :account="account"
          :showAll="true"
          @clickRecipient="handleClickRecipient"
        />
        <footer class="modal-card-foot is-justify-content-flex-end"></footer>
      </div>
    </template>
    <template v-if="$modal.step.value == 2">
      <div class="modal-card" tabindex="0">
        <header class="modal-card-head">
          <span class="is-flex is-flex-shrink-0">
            <a class="mr-3 is-flex" @click="$modal.back()">
              <span class="icon has-text-white">
                <fa-icon icon="arrow-left" class="fa-lg" />
              </span>
            </a>
          </span>
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Recipient Info") }}
          </p>
          <button class="delete" aria-label="close" @click="close()"></button>
        </header>
        <section class="modal-card-body">
          <AdminBackend
            v-if="administrativeBackendId && financialBackendId"
            :is="current"
            :administrativeBackendId="administrativeBackendId"
            :walletUri="financialBackendId"
            :account="account"
          />
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end"></footer>
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

  import AdminBackendComchain from "@/components/AdminBackendComchain.vue"
  import AdminBackend from "@/components/AdminBackend.vue"
  import BankAccountItem from "./BankAccountItem.vue"

  @Options({
    name: "MoneyTransferModal",
    components: {
      RecipientItem,
      MoneyTransaction,
      TransactionItem,
      Loading,
      RecipientSelector,
      BankAccountItem,
      AdminBackendComchain,
      AdminBackend,
    },
    data() {
      return {
        recipientsSearchString: "",
        recipientsSearchError: false,
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

        administrativeBackendId: null,
        financialBackendId: null,
      }
    },
    created() {
      const [opts] = this.$modal.args.value
      this.administrativeBackendId = opts.administrativeBackendId
      this.financialBackendId = opts.financialBackendId
    },
    mounted() {
      if (this.administrativeBackendId && this.financialBackendId) {
        this.$modal.next()
      }
    },
    computed: {
      ...mapModuleState("lokapi", ["userProfile"]),

      // current() {
      //   let backendName = this.financialBackendId.split(":")[0]
      //   const componentList = Object.keys(this.$options.components || {})
      //   backendName = backendName[0].toUpperCase() + backendName.slice(1)
      //   const componentName = `AdminBackend${backendName}`

      //   const result = componentList.find(
      //     (component) => componentName === component
      //   )
      //   if (!result) {
      //     throw new Error(`no component ${componentName} found`)
      //   }
      //   return result
      // },
      ownCurrenciesRecipients(): Array<any> {
        let currencyIds = this.$store.getters.activeVirtualAccounts.map(
          (a: any) => a.currencyId
        )
        return this.recipientBatchLoader.elements.value.filter((p: any) => {
          return currencyIds.indexOf(p.backendId) > -1
        })
      },
    },
    methods: {
      handleClickRecipient(data: any): void {
        this.administrativeBackendId = data.recipient.id
        this.financialBackendId = data.recipient.internalId
        this.$modal.next()
      },
      async showRecipientDetails(config: any): Promise<void> {
        this.selectedRecipient = config.recipient

        this.$modal.next()
        this.operations = []
        this.errors = false
        this.amount = config?.amount || null
        this.sendermemo = config?.senderMemo
        this.recipientMemo = config?.recipientMemo
        this.config = config
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

  hr.transaction-list-separator {
    margin-top: 0.2em;
    margin-bottom: 0.2em;
  }
  h2 {
    font-weight: 500;
  }
</style>
