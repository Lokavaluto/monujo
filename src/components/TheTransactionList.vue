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
          <div class="ml-2 mt-2" ref="transactionsContainer">
            <div
              class="
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
                  :placeholder="$gettext('All transactions')"
                  @clear="
                    () => {
                      selectedTimeSpanType = ''
                      datePickerShow = false
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
                          @click="datePickerShow = false"
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
              <div class="recipient-filter is-flex is-flex-direction-row">
                <div class="recipient-filter-input">
                  <model-list-select
                    :list="
                      recipientList.map((name, index) => ({ name, index }))
                    "
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
                    class="recipient-filter-reset"
                    :class="{ disable: !selectedRecipient?.name }"
                    @click="resetRecipientSearch"
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
        <section
          class="modal-card-body custom-card-transactions"
          ref="transactionsContainer"
          @scroll="getNextFilteredTransactions"
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
            <TransactionItem
              v-if="transactions.length > 0"
              v-for="transaction in transactions"
              :key="transaction"
              :transaction="transaction"
            />
            <div
              v-if="transactions.length == 0 && !isTransactionsBatchLoading"
              class="is-flex is-align-items-center is-justify-content-center"
            >
              {{ $gettext("No transaction found") }}
            </div>
            <div
              class="transactions-loader-container"
              v-if="isTransactionsBatchLoading"
            >
              <loading
                v-model:active="isTransactionsBatchLoading"
                :can-cancel="false"
                :is-full-page="false"
                :width="30"
                :height="30"
              />
            </div>
          </div>
        </section>
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

    <div
      v-if="!transactionsLoading && lastTransactions?.length"
      class="has-text-centered mt-5"
    >
      <button
        @click="$modal.open(this.$options.name), resetTransactionsGen()"
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
        selectExportLoader: null,
        exportDate: ["", ""],
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
        transactions: [],
        isTransactionsBatchLoading: false,
        isTransactionsLoading: false,
        recipientList: [],
        recipientsSearchString: "",
        selectedRecipient: {},
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
    methods: {
      async createCsvFile() {
        const transactions = []
        const [dateBegin, dateEnd] = this.exportDate

        this.isTransactionsLoading = true

        try {
          for await (const t of this.getTransactions()) {
            transactions.push(t)
          }
        } catch (e) {
          this.$msg.error(
            this.$gettext(
              "An unexpected issue occured while downloading transaction list"
            )
          )
          throw e
        } finally {
          this.isTransactionsLoading = false
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
      disabledDates(date: Date) {
        return date > moment().endOf("day").toDate()
      },
      async getNextFilteredTransactions() {
        if (!this.transactionGen) return

        let div = this.$refs.transactionsContainer
        while (div.scrollHeight - (div.scrollTop + div.offsetHeight) <= 500) {
          let next
          this.isTransactionsBatchLoading = true
          let currentGen = this.transactionGen
          try {
            next = await this.transactionGen.next()
          } catch (e) {
            if (currentGen !== this.transactionGen) {
              console.warn("Ignored exception from obsolete transaction", e)
              break
            }
            this.isTransactionsBatchLoading = false
            this.$msg.error(
              this.$gettext(
                "An unexpected issue occured while downloading transaction list"
              )
            )
            throw e
          }
          if (currentGen !== this.transactionGen) {
            console.log("Canceled obsolete transaction request.")
            break
          }
          this.isTransactionsBatchLoading = false
          if (next.done) {
            this.transactionGen = null
            break
          }

          this.transactions.push(<any>next.value)
        }
      },
      resetTransactionsGen() {
        this.transactionGen = this.getTransactions()
        this.transactions = []
        this.$nextTick(() => this.getNextFilteredTransactions())
      },
      async *getTransactions() {
        const gen = this.$lokapi.getTransactions()

        const [dateBegin, dateEnd] = this.exportDate
        const selectedRecipientName = this.selectedRecipient?.name

        for await (const t of gen) {
          if (selectedRecipientName && selectedRecipientName !== t.related)
            continue
          if (dateBegin && t.date < dateBegin) break
          if (dateEnd && t.date > dateEnd) continue
          yield t
        }
      },
      async searchRecipients(recipientsSearchString: string): Promise<any[]> {
        let recipients = null
        try {
          recipients = await this.$lokapi.searchRecipients(
            recipientsSearchString
          )
        } catch (err: any) {
          console.log("searchRecipients() Failed", err)
          return []
        }
        return [...new Set(recipients.map((r: any) => r.name))]
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
    watch: {
      selectedRecipient: async function (newRecipient): Promise<void> {
        this.resetTransactionsGen()
      },
      exportDate: async function (newExportDate): Promise<void> {
        let [newBegin, newEnd] = newExportDate
        const [normBegin, normEnd] = [
          newBegin ? moment(newBegin).startOf("day").toDate() : null,
          newEnd ? moment(newEnd).endOf("day").toDate() : null,
        ]
        if (
          normBegin &&
          normEnd &&
          (+newBegin != +normBegin || +newEnd != +normEnd)
        ) {
          this.exportDate = [normBegin, normEnd]
          return
        }
        this.resetTransactionsGen()
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
  .recipient-filter {
    width: 59%;
  }
  .recipient-filter-reset {
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
  .recipient-filter-input {
    width: 100%;
  }
  .ui.fluid.dropdown > .dropdown.icon {
    display: none;
  }
  button.disable {
    pointer-events: none;
  }
</style>
