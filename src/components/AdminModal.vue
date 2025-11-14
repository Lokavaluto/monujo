<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <template v-if="$modal.step.value == 1">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Recipient Selector") }} - 1/2
          </p>
          <button
            class="delete"
            aria-label="close"
            @click="$modal.close()"
          ></button>
        </header>
        <RecipientSelector
          :showAll="false"
          @clickRecipient="handleClickRecipient"
          :currency="currency"
          :hideAdminButton="true"
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
          <button
            class="delete"
            aria-label="close"
            @click="$modal.close()"
          ></button>
        </header>
        <section class="modal-card-body">
          <AdminBackend
            v-if="administrativeBackendId && financialBackendId"
            :administrativeBackendId="administrativeBackendId"
            :walletUri="financialBackendId"
            :currency="currency"
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

  import RecipientSelector from "@/components/RecipientSelector.vue"

  import AdminBackend from "@/components/AdminBackend.vue"
  import BankAccountItem from "./BankAccountItem.vue"

  @Options({
    name: "MoneyTransferModal",
    components: {
      RecipientSelector,
      BankAccountItem,
      AdminBackend,
    },
    data() {
      return {
        administrativeBackendId: null,
        financialBackendId: null,
        currency: null,
      }
    },
    created() {
      const [opts] = this.$modal.args.value
      this.administrativeBackendId = opts.administrativeBackendId
      this.financialBackendId = opts.financialBackendId
      this.currency = opts.currency
    },
    mounted() {
      if (this.administrativeBackendId && this.financialBackendId) {
        this.$modal.next()
      }
    },
    computed: {
      ...mapModuleState("lokapi", ["userProfile"]),
      // not useed, only comchain supported for now
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
      // ownCurrenciesRecipients(): Array<any> {
      //   let currencyIds = this.$store.getters.activeVirtualAccounts.map(
      //     (a: any) => a.currencyId
      //   )
      //   return this.recipientBatchLoader.elements.value.filter((p: any) => {
      //     return currencyIds.indexOf(p.backendId) > -1
      //   })
      // },
    },
    methods: {
      handleClickRecipient(data: any): void {
        this.administrativeBackendId = data.recipient.id
        this.financialBackendId = data.recipient.internalId
        this.$modal.next()
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
