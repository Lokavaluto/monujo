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
          <p class="modal-card-title is-title-shrink">
            <span class="ml-2">Toutes les opérations</span>
            <span v-if="getPlatform !== 'ios'">
              <span
                v-if="!isAllTransactionsLoading || selectExportLoader !== 1"
              >
                <button
                  class="button is-ghost is-medium download-transactions is-responsive"
                  title="Exporter les transactions"
                >
                  <i
                    @click="downloadCsvFile()"
                    class="ml-2 fas icon fa-download"
                  >
                    <fa-icon icon="download"
                  /></i>
                </button>
              </span>
              <span v-else class="export-container">
                <div class="transactions-loader-container">
                  <loading
                    v-model:active="isAllTransactionsLoading"
                    :can-cancel="false"
                    :opacity="0"
                    :is-full-page="false"
                    :width="20"
                    :height="20"
                  />
                </div>
              </span>
            </span>
            <span v-if="getPlatform !== 'web'">
              <span
                v-if="!isAllTransactionsLoading || selectExportLoader !== 2"
              >
                <button
                  class="button is-ghost is-medium download-transactions is-responsive"
                  title="Exporter les transactions"
                >
                  <i @click="shareCsvFile()" class="ml-2 fas icon fa-share">
                    <fa-icon icon="share"
                  /></i>
                </button>
              </span>
              <span v-else class="export-container">
                <div class="transactions-loader-container">
                  <loading
                    v-model:active="isAllTransactionsLoading"
                    :can-cancel="false"
                    :opacity="0"
                    :is-full-page="false"
                    :width="20"
                    :height="20"
                  />
                </div>
              </span>
            </span>
          </p>
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
              v-model:active="transactionsBatchLoading"
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
      v-if="!transactionsLoading && thisWeektransactions?.length"
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
  import moment from "moment"
  import { Capacitor } from "@capacitor/core"

  const numberFormat = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  moment.locale("fr")
  import { mapModuleState } from "@/utils/vuex"
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
        isAllTransactionsLoading: false,
        selectExportLoader: null,
      }
    },
    computed: {
      getPlatform(): string {
        return Capacitor.getPlatform()
      },
      ...mapModuleState("lokapi", [
        "transactionsLoading",
        "transactionsBatchLoading",
        "thisWeektransactions",
        "transactions",
        "userProfile",
      ]),
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

      async createCsvFile() {
        this.isAllTransactionsLoading = true
        try {
          await this.$store.dispatch("fetchAllTransactions")
        } catch (e) {
          this.$msg.error(
            "Il y a eu un problème lors de la tentative de telechargement de la liste des transactions"
          )
          throw e
        } finally {
          this.isAllTransactionsLoading = false
        }

        const columnOrder = [
          "sender",
          "receiver",
          "amount",
          "date",
          "description",
        ]
        let csvDataLine: { [key: string]: string }[] = [
          {
            sender: "Source",
            receiver: "Destinataire",
            amount: "Montant",
            date: "Date",
            description: "Description",
          },
        ]

        for (let e of this.transactions) {
          let name = e.relatedUser ? e.relatedUser.display : e.related.type.name
          let [sender, receiver] = e.amount.startsWith("-")
            ? [this.userProfile.name, name]
            : [name, this.userProfile.name]
          let data: { [key: string]: string } = {
            sender,
            receiver,
            amount: numberFormat.format(e.amount),
            date: moment(e.date).format(),
            description: e.description || "",
          }

          for (const s of columnOrder) {
            data[s] = '"' + data[s].replaceAll('"', '""') + '"'
          }

          csvDataLine.push(data)
        }
        return (
          csvDataLine
            .map((dataLine) =>
              columnOrder.map((header) => dataLine[header]).join(",")
            )
            .join("\r\n") + "\r\n"
        )
      },
      async downloadCsvFile() {
        this.selectExportLoader = 1
        const csvContent = await this.createCsvFile()
        try {
          await this.$export.download(
            csvContent,
            "Transactions.csv",
            "text/csv"
          )
        } catch (e) {
          this.$msg.error(
            "La liste des transactions n'a pas pu être téléchargée"
          )
          throw e
        }
        this.$msg.success("Liste des transactions téléchargée")
      },
      async shareCsvFile() {
        this.selectExportLoader = 2
        let csvContent = await this.createCsvFile()
        try {
          await this.$export.share(csvContent, "Transactions.csv")
        } catch (e) {
          this.$msg.error("La liste des transactions n'a pas pu être partagée")
          return
        }
        this.$msg.success("Liste des transactions partagée")
      },
    },
  })
  export default class TheTransactionList extends Vue {}
</script>
