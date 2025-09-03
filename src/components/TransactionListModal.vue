<template>
  <div
    class="modal is-active"
    v-if="$modal.modal.value == $options.name"
    ref="transactions"
  >
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-title-shrink">
          <span class="ml-2">{{ $gettext("All transactions") }}</span>
        </p>
        <button
          class="delete"
          aria-label="close"
          @click="$modal.back()"
        ></button>
      </header>
      <TransactionList
        :recipient="selectedRecipient"
        :account="account"
        ref="txList"
      />
      <footer
        class="modal-card-foot custom-modal-card-foot is-justify-content-end"
      >
        <span v-if="getPlatform === 'web'" class="mr-2"
          ><button
            class="button custom-button-modal has-text-weight-medium"
            :title="$gettext('Download transactions')"
            @click="downloadCsvFile()"
            :disabled="isTransactionsLoading"
          >
            <span v-if="isTransactionsLoading" class="icon">
              <fa-icon
                icon="fa-circle-notch"
                :class="{ refreshing: isTransactionsLoading }"
                class="fa-lg"
              />
            </span>
            <span v-else class="icon">
              <fa-icon icon="fa-download" class="fa-lg" />
            </span>
            <span>{{ $gettext("Download") }}</span>
          </button></span
        ><span v-else class="ml-2"
          ><button
            class="button custom-button-modal has-text-weight-medium"
            :title="$gettext('Share transactions')"
            @click="shareCsvFile()"
            :disabled="isTransactionsLoading"
          >
            <span v-if="isTransactionsLoading" class="icon">
              <fa-icon
                icon="fa-circle-notch"
                :class="{ refreshing: isTransactionsLoading }"
                class="fa-lg"
              />
            </span>
            <span v-else class="icon">
              <fa-icon icon="fa-share" class="fa-lg" />
            </span>
            <span>{{ $gettext("Share") }}</span>
          </button>
        </span>
      </footer>
    </div>
  </div>
</template>
<script lang="ts">
  import { mapGetters } from "vuex"

  import { Options, Vue } from "vue-class-component"

  // Assets
  import { ModelListSelect } from "vue-search-select"
  import { Capacitor } from "@capacitor/core"
  import Loading from "vue-loading-overlay"
  import DatePicker from "vue-datepicker-next"

  // Components
  import TransactionItem from "./TransactionItem.vue"
  import TransactionList from "./TransactionList.vue"

  import "vue-datepicker-next/index.css"
  import "vue-search-select/dist/VueSearchSelect.css"
  import "@/assets/datepicker.scss"

  import { mapModuleState } from "@/utils/vuex"

  @Options({
    name: "TransactionListModal",
    components: {
      Loading,
      DatePicker,
      TransactionItem,
      ModelListSelect,
      TransactionList,
    },

    data(this: any) {
      return {
        isTransactionsLoading: false,
        account: null,
        hasMoreThanOneSubAccount: null,
        selectedRecipient: null,
      }
    },

    created() {
      this.account = this.$modal.args.value[0].params.account
      this.selectedRecipient = this.$modal.args.value[0].params.recipient
    },
    async mounted() {
      this.setFocus()
    },
    computed: {
      getPlatform(): string {
        return Capacitor.getPlatform()
      },

      ...mapModuleState("lokapi", ["userProfile"]),
      ...mapGetters(["numericFormat", "dateFormat"]),
    },
    methods: {
      setFocus(ref: string) {
        this.$refs[ref]?.focus()
      },
      downloadCsvFile() {
        ;(this.$refs.txList as any)?.downloadCsvFile?.()
      },
      shareCsvFile() {
        ;(this.$refs.txList as any)?.shareCsvFile?.()
      },
    },
  })
  export default class TheTransactionList extends Vue {}
</script>
<style lang="scss">
  @import "@/assets/custom-variables";
</style>
