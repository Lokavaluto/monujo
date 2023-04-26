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
    <div class="modal is-active" v-if="$modal.modal.value == $options.name">
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
        <div class="filter-area">
          <div class="ml-5 mt-4" ref="transactionsContainer">
            <div
              class="
                custom-card
                is-flex-direction-column
                is-align-items-center
                is-justify-content-space-between
                mb-2
              "
            >
              <div class="mb-1">
                <strong>{{ $gettext("Select timespan:") }}</strong>
              </div>
              <div class="datepicker-export">
                <date-picker
                  v-model:value="exportDate"
                  :open="datePickerShow ? true : null"
                  range
                  prefix-class="xmx"
                  :editable="false"
                  @close="
                    normalizeEndDate(),
                      !datePickerShow ? getNextFilteredTransactions() : null
                  "
                  :placeholder="$gettext('All transactions')"
                  @clear="
                    () => {
                      selectedTimeSpanType = ''
                      datePickerShow = false
                      getNextFilteredTransactions()
                    }
                  "
                  @change="datePickerShow = selectedTimeSpanType ? true : false"
                  @pick="selectedTimeSpanType = ''"
                  :disabled-date="disabledDates"
                >
                  <template #header="{ emit }">
                    <div>
                      <div
                        v-for="selector in selectorsOrder"
                        :class="{
                          selected: selector == selectedTimeSpanType,
                        }"
                        class="timespan"
                      >
                        <button
                          class="xmx-btn xmx-btn-text"
                          @click="
                            () => {
                              selectedTimeSpanOffset =
                                selectedTimeSpanType != selector
                                  ? -1
                                  : selectedTimeSpanOffset - 1
                              selectedTimeSpanType = selector
                              emit(selectedTimeSpan)
                            }
                          "
                        >
                          <i class="xmx-icon-left"></i>
                        </button>
                        <button
                          class="xmx-btn xmx-btn-text"
                          @click="
                            () => {
                              selectedTimeSpanType = selector
                              selectedTimeSpanOffset = 0
                              emit(selectedTimeSpan)
                            }
                          "
                        >
                          {{ selectorLabels[selector] }}
                        </button>
                        <button
                          class="xmx-btn xmx-btn-text"
                          @click="
                            ;[selectedTimeSpanOffset++, emit(selectedTimeSpan)]
                          "
                          :class="{
                            hide:
                              selectedTimeSpanType != selector ||
                              isSelectionCurrent,
                          }"
                        >
                          <i class="xmx-icon-right"></i>
                        </button>
                        <button
                          class="xmx-btn xmx-btn-text confirm"
                          @click="
                            getNextFilteredTransactions(),
                              (datePickerShow = false)
                          "
                          :class="{ hide: selectedTimeSpanType != selector }"
                        >
                          {{ $gettext("confirm") }}
                        </button>
                      </div>
                    </div>
                  </template>
                </date-picker>
              </div>
              <div class="mb-1 mt-3">
                <strong>{{ $gettext("Select recipient:") }}</strong>
              </div>
              <div class="recipien-filter is-flex is-flex-direction-row">
                <div class="recipien-filter-input">
                  <model-list-select
                    :list="recipientList"
                    option-value="index"
                    option-text="name"
                    v-model="selectedRecipient"
                    :placeholder="$gettext('All recipient')"
                    @searchchange="onSearch"
                  >
                  </model-list-select>
                </div>
                <div>
                  <button
                    class="recipien-filter-reset"
                    @click="resetRecipientSearch"
                    @mouseover="recipientIcon = 'fa-xmark'"
                    @mouseleave="recipientIcon = 'fa-user'"
                  >
                    <fa-icon v-if="selectedRecipient?.name" icon="fa-xmark">
                    </fa-icon>
                    <fa-icon v-else icon="fa-user"></fa-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            class="
              mt-3is-flex
              is-justify-content-space-evenly is-align-items-center
            "
          ></div>
          <div class="container is-fluid custom-heavy-line-separator"></div>
        </div>
        <section class="modal-card-body custom-card-transactions">
          <div
            class="modal-container custom-modal-container"
            ref="transactionsContainer"
            @scroll="fetchNextTransactions"
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
              <div>
                <TransactionItem
                  v-if="filteredTransactions.length > 0"
                  v-for="transaction in filteredTransactions"
                  :key="transaction"
                  :transaction="transaction"
                />
                <div
                  v-if="
                    filteredTransactions.length == 0 &&
                    !isTransactionsBatchLoading
                  "
                  class="
                    is-flex is-align-items-center is-justify-content-center
                  "
                >
                  {{ $gettext("No transaction found") }}
                </div>
              </div>
              <div>
                <div class="transactions-loader-container">
                  <loading
                    v-model:active="isTransactionsBatchLoading"
                    :can-cancel="false"
                    :is-full-page="false"
                    :width="30"
                    :height="30"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer
          class="modal-card-foot custom-modal-card-foot is-justify-content-end"
        >
          <div>
            <span v-if="getPlatform === 'web'" class="mr-2"
              ><button
                class="button custom-button-modal has-text-weight-medium"
                :title="$gettext('Download filtered transactions')"
                @click="downloadCsvFile()"
                :disabled="isTransactionsDownloading"
              >
                <span class="fa-download">
                  <span v-if="isTransactionsDownloading" class="icon">
                    <fa-icon
                      icon="fa-circle-notch"
                      :class="{ refreshing: isTransactionsDownloading }"
                      class="fa-lg"
                    />
                  </span>
                  <span v-else class="icon">
                    <fa-icon icon="fa-download" class="fa-lg" />
                  </span>
                  <span>{{ $gettext("Download") }}</span>
                </span>
              </button></span
            ><span v-else class="ml-2"
              ><button
                class="button custom-button-modal has-text-weight-medium"
                :title="$gettext('Share filtered transactions')"
                @click="shareCsvFile()"
                :disabled="isTransactionsDownloading"
              >
                <span class="fa-share">
                  <span v-if="isTransactionsDownloading" class="icon">
                    <fa-icon
                      icon="fa-circle-notch"
                      :class="{ refreshing: isTransactionsDownloading }"
                      class="fa-lg"
                    />
                  </span>
                  <span v-else class="icon">
                    <fa-icon icon="fa-share" class="fa-lg" />
                  </span>
                  <span>{{ $gettext("Share") }}</span>
                </span>
              </button>
            </span>
          </div>
        </footer>
      </div>
    </div>
    <div
      v-if="!transactionsLoading && lastTransactions?.length"
      class="has-text-centered mt-5"
    >
      <button
        @click="$modal.open(this.$options.name), fetchNextTransactions()"
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

  import { ModelListSelect } from "vue-search-select"
  import { Capacitor } from "@capacitor/core"
  import moment from "moment"

  import TransactionListRecent from "./TransactionListRecent.vue"
  import TransactionItem from "./TransactionItem.vue"

  // Assets

  import "vue-datepicker-next/index.css"
  import "vue-search-select/dist/VueSearchSelect.css"
  import "@/assets/datepicker.scss"

  import { mapModuleState } from "@/utils/vuex"
  @Options({
    name: "TheTransactionList",
    components: {
      TransactionListRecent,
      Loading,
      DatePicker,
      TransactionItem,
      ModelListSelect,
    },

    data() {
      return {
        isAllTransactionsLoading: false,
        selectExportLoader: null,
        exportDate: [null, null],
        shortcutExport: null,
        datePickerShow: false,
        selectorLabels: {
          day: this.$gettext("day"),
          week: this.$gettext("week"),
          month: this.$gettext("month"),
          year: this.$gettext("year"),
        },
        selectorsOrder: ["day", "week", "month", "year"],
        selectedTimeSpanType: "",
        selectedTimeSpanOffset: 0,
        filteredTransactionsGen: null,
        _exportDate: [null, null],
        filteredTransactions: [],
        isTransactionsBatchLoading: false,
        isTransactionsDownloading: false,
        recipientList: [],
        recipientsSearchString: "",
        selectedRecipient: {},
        _selectedRecipient: {},
      }
    },
    async mounted() {
      this.recipientList = await this.searchRecipients("")
    },
    computed: {
      getPlatform(): string {
        return Capacitor.getPlatform()
      },
      isSelectionCurrent(): boolean {
        return moment().isBetween(this.exportDate[0], this.exportDate[1])
      },
      selectedTimeSpan() {
        const now = moment().toDate()
        const timeSpanType = this.selectedTimeSpanType
        const offset = this.selectedTimeSpanOffset
        const dateSelected = moment(now)
          .subtract(-offset, timeSpanType)
          .toDate()
        const [begin, end] = [
          moment(dateSelected).startOf(timeSpanType),
          moment(dateSelected).endOf(timeSpanType),
        ].map((m) => m.toDate())

        return [begin, now < end ? now : end]
      },
      ...mapModuleState("lokapi", [
        "transactionsLoading",
        "lastTransactions",
        "userProfile",
      ]),
      ...mapGetters(["numericFormat", "dateFormat"]),
    },
    watch: {
      selectedRecipient(newval: any, oldval: any) {
        if (newval) {
          this.getNextFilteredTransactions()
        }
      },
    },
    methods: {
      fetchNextTransactions: function () {
        this.$nextTick(async () => {
          let div = this.$refs.transactionsContainer
          if (div.scrollTop === div.scrollHeight - div.offsetHeight) {
            await this.getNextFilteredTransactions()
          }
        })
      },

      async createCsvFile() {
        const transactions = []
        let [dateBegin, dateEnd] = this.exportDate
        let next = null
        const gen = this.$lokapi.getTransactions()
        dateBegin = moment(dateBegin)
        dateEnd = moment(dateEnd)
        this.isTransactionsDownloading = true
        try {
          do {
            next = await gen.next()
            if (next.done) break
            if (
              ((!dateBegin.isValid() && !dateBegin.isValid()) ||
                moment(next.value.date).isBetween(dateBegin, dateEnd)) &&
              (!this.selectedRecipient.name ||
                this.selectedRecipient?.name === next.value.related)
            ) {
              transactions.push(<any>next.value)
            }
          } while (!next.done)
        } catch (e) {
          this.$msg.error(
            this.$gettext(
              "An unexpected issue occured while downloading transaction list"
            )
          )
          throw e
        } finally {
          this.isTransactionsDownloading = false
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
            date: moment(e.date).format("YYYY-MM-DD HH:mm:ss"),
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
        this.$modal.close()
        this.$msg.success(this.$gettext("Transaction list downloaded"))
      },
      async shareCsvFile() {
        this.selectExportLoader = 2
        const { csvContent, exportFileName } = await this.createCsvFile()
        let dateBeginStr, dateEndStr
        if (this.exportDate[0] && this.exportDate[1]) {
          dateBeginStr = moment(this.exportDate[0]).format("YYYY-MM-DD")
          dateEndStr = moment(this.exportDate[1]).format("YYYY-MM-DD")
        } else {
          dateBeginStr = ""
          dateEndStr = ""
        }
        try {
          await this.$export.share(csvContent, exportFileName, [
            dateBeginStr,
            dateEndStr,
          ])
        } catch (e) {
          this.$msg.error(
            this.$gettext("Transaction list could not be downloaded")
          )
          throw e
        }
        this.$modal.close()
        this.$msg.success(this.$gettext("Transaction list shared"))
      },
      normalizeEndDate() {
        let [begin, end] = this.exportDate
        this.exportDate = [
          begin ? moment(begin).startOf("day").toDate() : null,
          end ? moment(end).endOf("day").toDate() : null,
        ]
      },
      disabledDates(date: Date) {
        return date > moment().endOf("day").toDate()
      },
      async getNextFilteredTransactions() {
        this.resetTransactionsGen()
        let [dateBegin, dateEnd] = this.exportDate
        let next = null
        dateBegin = moment(dateBegin)
        dateEnd = moment(dateEnd)
        let transactions = [...this.filteredTransactions]
        let transactionsIndex = 0
        this.isTransactionsBatchLoading = true
        try {
          do {
            next = await this.filteredTransactionsGen.next()
            if (next.done) break
            if (
              ((!dateBegin.isValid() && !dateEnd.isValid()) ||
                moment(next.value.date).isBetween(dateBegin, dateEnd)) &&
              (!this.selectedRecipient.name ||
                this.selectedRecipient?.name === next.value.related)
            ) {
              transactionsIndex++
              transactions.push(<any>next.value)
            }
          } while (!next.done && transactionsIndex < 10)
        } catch (e) {
          this.$msg.error(
            this.$gettext(
              "An unexpected issue occured while downloading transaction list"
            )
          )
          throw e
        } finally {
          this.isTransactionsBatchLoading = false
          this.filteredTransactions = transactions
        }
      },
      dateFormat(date: string) {
        return moment(date).format()
      },
      resetTransactionsGen() {
        const [_dateBegin, _dateEnd] = this._exportDate
        const [dateBegin, dateEnd] = this.exportDate
        if (
          !this.filteredTransactionsGen ||
          this.dateFormat(_dateBegin) !== this.dateFormat(dateBegin) ||
          this.dateFormat(_dateEnd) !== this.dateFormat(dateEnd) ||
          this._selectedRecipient !== this.selectedRecipient
        ) {
          this.filteredTransactionsGen = this.$lokapi.getTransactions()
          this.filteredTransactions = []
          this._exportDate = [...this.exportDate]
          this._selectedRecipient = this.selectedRecipient
        }
      },
      async searchRecipients(recipientsSearchString: string): Promise<any[]> {
        let recipients = null
        let recipientList: any[] = []
        try {
          recipients = await this.$lokapi.searchRecipients(
            recipientsSearchString
          )
        } catch (err: any) {
          console.log("searchRecipients() Failed", err)
        }
        recipients.map((recipient: any, index: number) => {
          recipientList.push({ index: index, name: recipient.name })
        })
        return recipientList
      },
      async onSearch(recipientsSearchString: any) {
        if (recipientsSearchString.length > 2)
          this.recipientList = await this.searchRecipients(
            recipientsSearchString
          )
      },
      async resetRecipientSearch(event: any) {
        this.selectedRecipient = {}
        this.recipientList = await this.searchRecipients("")
      },
    },
  })
  export default class TheTransactionList extends Vue {}
</script>
<style lang="scss">
  @import "@/assets/custom-variables";

  div.selected {
    background-color: $color-1;
  }

  div.timespan {
    padding: 0;
    margin: 0;
    border-radius: 2em;
    width: 15em;
    display: grid;
    grid-template-columns: 2em 5em 2em 6em;

    button.xmx-btn {
      text-align: center;
      border-radius: 2em;

      &.confirm {
        margin-left: 1em;
        &,
        &:hover {
          background-color: $color-2;
          color: $color-1;
        }
      }
    }
  }
  .datepicker-export {
    .xmx-datepicker-range {
      width: auto !important;
    }
  }
  div.xmx-datepicker-content {
    user-select: none;
  }
  .filter-area {
    background: #f0faf9;
  }
  .recipien-filter {
    width: 59%;
  }
  .recipien-filter-reset {
    position: relative;
    right: 1.5em;
    top: 0.7em;
    opacity: 0.5;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    z-index: 99;
  }
  .recipien-filter-input {
    width: 100%;
  }
  .ui.fluid.dropdown > .dropdown.icon {
    display: none;
  }
</style>
