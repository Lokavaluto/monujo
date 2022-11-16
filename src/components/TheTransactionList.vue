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
            <span class="ml-2">{{ $gettext("All transactions") }}</span>
            <button
              class="button is-ghost is-medium download-transactions is-responsive"
              :title="$gettext('Export all transactions')"
            >
              <i
                @click="
                  ;(this.showModal = false), (this.showExportModal = true)
                "
                class="ml-2 fas icon fa-file-export"
              >
                <fa-icon icon="file-export"
              /></i>
            </button>
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
    <div class="modal is-active" v-if="showExportModal">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            <span class="ml-2">{{ $gettext("Export in CSV format") }}</span>
          </p>
          <button
            class="delete"
            aria-label="close"
            @click=";(showExportModal = false), (showModal = true)"
          ></button>
        </header>
        <section class="modal-card-body custom-card-transactions">
          <div>
            <loading
              v-model:active="isAllTransactionsLoading"
              :can-cancel="false"
              :opacity="0"
              :is-full-page="false"
            />
          </div>
          <div
            class="modal-container custom-modal-container"
            ref="transactionsContainer"
            @scroll="handleScroll"
          >
            <div
              class="custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between mb-4"
            >
              <div class="mb-2">
                <strong>{{ $gettext("Select timespan:") }}</strong>
              </div>
              <div class="datepicker-export">
                <date-picker
                  v-model:value="exportDate"
                  range
                  prefix-class="xmx"
                  :editable="false"
                  @close="normalizeEndDate"
                  :placeholder="$gettext('All transactions')"
                >
                  <template #header="{ emit }">
                    <div>
                      <div v-for="selector in selectors" class="is-grid-align">
                        <span class="mr-5">{{ selector.label }}:</span>
                        <span v-for="pos in Object.keys(selector.labels)"
                          ><button
                            class="mx-btn mx-btn-text"
                            @click="makeTimeSpan(selector.timeSpan, -pos, emit)"
                          >
                            {{ selector.labels[pos] }}
                          </button></span
                        >
                      </div>
                    </div>
                  </template>
                </date-picker>
              </div>
              <div class="mt-5">
                <span v-if="getPlatform !== 'ios'" class="mr-2"
                  ><button
                    class="button custom-button is-payer has-text-weight-medium is-rounded action"
                    :title="$gettext('Export all transactions')"
                    @click="downloadCsvFile()"
                    :disabled="isAllTransactionsLoading"
                  >
                    <span class="fa-download">
                      <span class="icon">
                        <fa-icon icon="fa-download" class="fa-lg" />
                      </span>
                      <span>{{ $gettext("Download") }}</span>
                    </span>
                  </button></span
                ><span v-if="getPlatform !== 'web'" class="ml-2"
                  ><button
                    class="button custom-button is-payer has-text-weight-medium is-rounded action"
                    :title="$gettext('Send transactions')"
                    @click="shareCsvFile()"
                    :disabled="isAllTransactionsLoading"
                  >
                    <span class="fa-share">
                      <span class="icon">
                        <fa-icon icon="fa-share" class="fa-lg" />
                      </span>
                      <span>{{ $gettext("Share") }}</span>
                    </span>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot"></footer>
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
        {{ $gettext("See more") }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
  import { mapGetters } from "vuex"

  import { Options, Vue } from "vue-class-component"
  import Loading from "vue-loading-overlay"
  import DatePicker from "vue-datepicker-next"

  import { Capacitor } from "@capacitor/core"
  import moment from "moment"

  import TransactionListRecent from "./TransactionListRecent.vue"
  import TransactionListFull from "./TransactionListFull.vue"

  // Assets

  import "vue-datepicker-next/index.css"
  import "@/assets/datepicker.scss"

  import { mapModuleState } from "@/utils/vuex"

  @Options({
    name: "TheTransactionList",
    components: {
      TransactionListRecent,
      TransactionListFull,
      Loading,
      DatePicker,
    },

    data() {
      return {
        showModal: false,
        isAllTransactionsLoading: false,
        selectExportLoader: null,
        showExportModal: false,
        exportDate: [null, null],
        shortcutExport: null,
        selectors: [
          {
            label: this.$gettext("Day"),
            labels: {
              0: this.$pgettext("day", "Current"),
              1: this.$pgettext("day", "Previous"),
            },
            timeSpan: "day",
          },
          {
            label: this.$gettext("Week"),
            labels: {
              0: this.$pgettext("week", "Current"),
              1: this.$pgettext("week", "Previous"),
            },
            timeSpan: "week",
          },
          {
            label: this.$gettext("Month"),
            labels: {
              0: this.$pgettext("month", "Current"),
              1: this.$pgettext("month", "Previous"),
            },
            timeSpan: "month",
          },
          {
            label: this.$gettext("Year"),
            labels: {
              0: this.$pgettext("year", "Current"),
              1: this.$pgettext("year", "Previous"),
            },
            timeSpan: "year",
          },
        ],
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
        "userProfile",
      ]),
      ...mapGetters(["numericFormat", "dateFormat"]),
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
        const transactions = []
        const [dateBegin, dateEnd] = this.exportDate

        this.isAllTransactionsLoading = true
        try {
          for await (const transaction of this.$lokapi.getTransactions({
            ...(dateBegin && { dateBegin }),
            ...(dateEnd && { dateEnd }),
          })) {
            transactions.push(<any>transaction)
          }
        } catch (e) {
          this.$msg.error(
            this.$gettext(
              "An unexpected issue occured while downloading transaction list"
            )
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
            sender: this.$gettext("Source"),
            receiver: this.$gettext("Target"),
            amount: this.$gettext("Amount"),
            date: this.$gettext("Date"),
            description: this.$gettext("Description"),
          },
        ]

        for (let e of transactions) {
          let name = e.related
          let [sender, receiver] = e.amount.startsWith("-")
            ? [this.userProfile.name, name]
            : [name, this.userProfile.name]
          let data: { [key: string]: string } = {
            sender,
            receiver,
            amount: this.numericFormat(e.amount),
            date: this.dateFormat(e.date),
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
            this.$gettext("Transaction list could not be downloaded")
          )
          throw e
        }
        this.$msg.success(this.$gettext("Transaction list downloaded"))
      },
      async shareCsvFile() {
        this.selectExportLoader = 2
        let csvContent = await this.createCsvFile()
        try {
          await this.$export.share(csvContent, "Transactions.csv")
        } catch (e) {
          this.$msg.error(
            this.$gettext("Transaction list could not be downloaded")
          )
          throw e
        }
        this.$msg.success(this.$gettext("Transaction list shared"))
      },
      makeTimeSpan(timeSpan: any, pos: number, emit: any) {
        emit(
          [moment().startOf(timeSpan), moment().endOf(timeSpan)]
            .map((date) => date.subtract(-pos, timeSpan))
            .map((m) => m.toDate())
        )
      },
      normalizeEndDate() {
        this.exportDate = [
          moment(this.exportDate[0]).startOf("day").toDate(),
          moment(this.exportDate[1]).endOf("day").toDate(),
        ]
      },
    },
  })
  export default class TheTransactionList extends Vue {}
</script>
