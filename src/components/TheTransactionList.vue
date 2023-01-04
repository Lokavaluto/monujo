<template>
  <div class="card custom-card custom-card-padding">
    <div
      class="
        is-flex-direction-column
        is-align-items-center
        is-justify-content-space-between
      "
    >
      <TransactionListRecent />
    </div>
    <div class="modal is-active" v-if="showModal">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            <span class="ml-2">{{ $gettext("All transactions") }}</span>
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
              class="
                custom-card
                is-flex-direction-column
                is-align-items-center
                is-justify-content-space-between
                mb-4
              "
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
          <div>
            <button
              class="
                button
                custom-button
                is-payer
                has-text-weight-medium
                is-rounded
                action
              "
              :title="$gettext('Export all transactions')"
              @click=";(this.showModal = false), (this.showExportModal = true)"
            >
              <i class="ml-2 fas icon fa-file-export">
                <fa-icon icon="file-export"
              /></i>
              <span>{{ $gettext("Export") }}</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
    <div
      class="modal is-active"
      v-if="showExportModal"
      @click="datePickerState = null"
    >
      <div class="modal-background"></div>
      <div class="modal-card">
        <div class="transactions-loader">
          <loading
            v-model:active="isAllTransactionsLoading"
            :can-cancel="false"
            :is-full-page="false"
          />
        </div>
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
          <div
            class="modal-container custom-modal-container"
            ref="transactionsContainer"
            @scroll="handleScroll"
          >
            <div
              class="
                custom-card
                is-flex-direction-column
                is-align-items-center
                is-justify-content-space-between
                mb-4
              "
            >
              <div class="mb-2">
                <strong>{{ $gettext("Select timespan:") }}</strong>
              </div>
              <div class="datepicker-export">
                <date-picker
                  v-model:value="exportDate"
                  :open="datePickerState"
                  range
                  prefix-class="xmx"
                  :editable="false"
                  @close="normalizeEndDate"
                  :placeholder="$gettext('All transactions')"
                  @change="datePickerState = true"
                  @click="setDefaultTimeSpan('month')"
                >
                  <template #header="{ emit }">
                    <div>
                      <span class="button-timespan">
                        <button
                          class="mt-2 mx-btn mx-btn-text"
                          @click="makeTimeSpan(selectedTimeSpan, -1, emit)"
                        >
                          <span>
                            <span class="icon">
                              <fa-icon
                                icon="circle-chevron-left"
                                class="fa-lg"
                              />
                            </span>
                          </span>
                        </button>
                      </span>
                      <span>
                        <select
                          class="xmx-input custom-xmx-input"
                          v-model="selectedTimeSpan"
                          @change="makeTimeSpan(selectedTimeSpan, 0, emit)"
                        >
                          <option
                            v-for="selector in selectorsOrder"
                            class="is-grid-align"
                            :value="selector"
                            :selected="selector == selectedTimeSpan"
                          >
                            {{ selectorLabels[selector] }}
                          </option>
                        </select>
                      </span>
                      <span v-if="!isUpToDate" class="button-timespan">
                        <button
                          class="mt-2 mx-btn mx-btn-text"
                          @click="
                            makeTimeSpan(selectedTimeSpan, 1, emit)
                          "
                        >
                          <span>
                            <span class="icon">
                              <fa-icon
                                icon="circle-chevron-right"
                                class="fa-lg"
                              />
                            </span>
                          </span>
                        </button>
                      </span>
                    </div>
                  </template>
                </date-picker>
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
          <span v-if="getPlatform === 'web'" class="mr-2"
            ><button
              class="button custom-button-modal has-text-weight-medium"
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
          ><span v-else class="ml-2"
            ><button
              class="button custom-button-modal has-text-weight-medium"
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
        datePickerState: null, //to keep the date picker open
        dateParams: { offset: 0, timeSpan: "" },
        selectorLabels: {
          day: this.$gettext("Day"),
          week: this.$gettext("Week"),
          month: this.$gettext("Month"),
          year: this.$gettext("Year"),
        },
        selectorsOrder: ["day", "week", "month", "year"],
        selectedTimeSpan: "month",
        isUpToDate: true,
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
        let exportFileName
        if (dateBegin && dateEnd) {
          let dateBeginStr = moment(dateBegin).format("YYYY-MM-DD")
          let dateEndStr = moment(dateEnd).format("YYYY-MM-DD")
          exportFileName = `transactions_${dateBeginStr}_${dateEndStr}.csv`
        } else {
          exportFileName = "transactions.csv"
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

        return {
          csvContent:
            csvDataLine
              .map((dataLine) =>
                columnOrder.map((header) => dataLine[header]).join(",")
              )
              .join("\r\n") + "\r\n",
          exportFileName,
        }
      },
      async downloadCsvFile() {
        this.selectExportLoader = 1
        const { csvContent, exportFileName } = await this.createCsvFile()
        try {
          await this.$export.download(csvContent, exportFileName, "text/csv")
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
        const { csvContent, exportFileName } = await this.createCsvFile()
        try {
          await this.$export.share(csvContent, exportFileName)
        } catch (e) {
          this.$msg.error(
            this.$gettext("Transaction list could not be downloaded")
          )
          throw e
        }
        this.$msg.success(this.$gettext("Transaction list shared"))
      },
      makeTimeSpan(timeSpan: any, pos: number, emit: any) {
        const dateParams = this.dateParams
        if (dateParams.timeSpan !== timeSpan) {
          dateParams.offset = 0
          dateParams.timeSpan = timeSpan
        }
        dateParams.offset += pos
        if (dateParams.offset > 0) {
          dateParams.offset = 0
        }
        const { offset } = dateParams
        emit(
          [moment().startOf(timeSpan), moment().endOf(timeSpan)]
            .map((date) => date.subtract(-offset, timeSpan))
            .map((m) => m.toDate())
        )
        this.isUpToDate = moment().isBetween(
          this.exportDate[0],
          this.exportDate[1]
        )
      },
      normalizeEndDate() {
        this.exportDate = [
          moment(this.exportDate[0]).startOf("day").toDate(),
          moment(this.exportDate[1]).endOf("day").toDate(),
        ]
      },
      handleDatePickerState(value: boolean) {
        this.datePickerState = value
      },
      setDefaultTimeSpan(timeSpan: any) {
        this.exportDate = [moment().startOf(timeSpan), moment().endOf(timeSpan)]
        this.normalizeEndDate()
      },
    },
  })
  export default class TheTransactionList extends Vue {}
</script>
