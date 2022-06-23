<template>
  <div class="card custom-card custom-card-padding">
    <div
      class="is-flex-direction-column is-align-items-center is-justify-content-space-between"
    >
      <TransactionListRecent />
    </div>
    <div class="modal is-active" v-if="showModal">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">Toutes les opérations</p>
          <button
            class="delete"
            aria-label="close"
            @click="
              ;(showModal = false),
                (showCreditRefreshNotification = false),
                $store.commit('setModalState', false)
            "
          ></button>
        </header>
        <section class="modal-card-body custom-card-transactions">
          <div
            class="modal-container custom-modal-container"
            ref="transactionsContainer"
            @scroll="handleScroll"
          >
            <div
              class="custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between mb-4"
            >
              <TransactionListFull />
            </div>
          </div>
        </section>
        <footer class="modal-card-foot custom-modal-card-foot">
          <div class="transactions-loader-container">
            <loading
              v-model:active="isLoadingTransactionsBatch"
              :can-cancel="false"
              :is-full-page="false"
              :width="30"
              :height="30"
            />
          </div>
        </footer>
      </div>
    </div>

    <div
      v-if="!isLoadingTransactions && getRecentTransactions?.length"
      class="has-text-centered mt-5"
    >
      <button
        @click=";(showModal = true), $store.commit('setModalState', true)"
        class="button custom-button custom-inverted"
      >
        Voir tout
      </button>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import TransactionListRecent from "./TransactionListRecent.vue"
  import TransactionListFull from "./TransactionListFull.vue"
  import Loading from "vue-loading-overlay"

  @Options({
    name: "TheTransactionList",
    components: {
      TransactionListRecent,
      TransactionListFull,
      Loading,
    },

    data() {
      return {
        showModal: false,
      }
    },
    computed: {
      getRecentTransactions(): any {
        return this.$store.state.lokapi.thisWeektransactions
      },
      isLoadingTransactions(): boolean {
        return this.$store.state.lokapi.transactionsLoading
      },
      isLoadingTransactionsBatch(): boolean {
        return this.$store.state.lokapi.transactionsBatchLoading
      },
    },
    watch: {
      showModal(newval: boolean, oldval: boolean) {
        if (newval) {
          this.$nextTick(() => {
            let div = this.$refs.transactionsContainer
            if (div.scrollTop === div.scrollHeight - div.offsetHeight) {
              this.$store.dispatch("fetchTransactionsBatch")
            }
          })
        }
      },
    },
    methods: {
      handleScroll(evt: any) {
        if (
          evt.target.scrollTop ===
          evt.target.scrollHeight - evt.target.offsetHeight
        ) {
          this.$store.dispatch("fetchTransactionsBatch")
        }
      },
    },
  })
  export default class TheTransactionList extends Vue {}
</script>
