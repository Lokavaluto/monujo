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
          <span class="ml-2">{{
            modalTitle || $gettext("All transactions")
          }}</span>
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
  import { Options, Vue } from "vue-class-component"

  import { Capacitor } from "@capacitor/core"

  import TransactionList from "./TransactionList.vue"

  @Options({
    name: "TransactionListModal",
    components: {
      TransactionList,
    },

    data(this: any) {
      return {
        isTransactionsLoading: false,
        account: null,
        modalTitle: null,
        selectedRecipient: null,
      }
    },

    created() {
      this.account = this.$modal.args.value[0].params.account
      this.modalTitle = this.$modal.args.value[0].params.title
      this.selectedRecipient = this.$modal.args.value[0].params.recipient
    },
    computed: {
      getPlatform(): string {
        return Capacitor.getPlatform()
      },
    },
    methods: {
      async downloadCsvFile() {
        this.isTransactionsLoading = true
        try {
          await (this.$refs.txList as any)?.downloadCsvFile?.()
        } finally {
          this.isTransactionsLoading = false
        }
      },
      async shareCsvFile() {
        this.isTransactionsLoading = true
        try {
          await (this.$refs.txList as any)?.shareCsvFile?.()
        } finally {
          this.isTransactionsLoading = false
        }
      },
    },
  })
  export default class TheTransactionList extends Vue {}
</script>
<style lang="scss">
  @import "@/assets/custom-variables";
</style>
