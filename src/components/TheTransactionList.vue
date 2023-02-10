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
    <div
      class="modal is-active"
      v-if="getCurrentModal.component == $options.name"
      @click="datePickerShow = false"
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
            @click="$modal.close(this.$options.name, 1), (showModal = false)"
          ></button>
        </header>
        <section
          v-if="getCurrentModal.step == 1"
          class="modal-card-body custom-card-transactions"
        >
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
        <section
          v-if="getCurrentModal.step == 2"
          class="modal-card-body custom-card-transactions"
        >
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
                  :open="datePickerShow ? true : null"
                  range
                  prefix-class="xmx"
                  :editable="false"
                  @close="normalizeEndDate"
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
                        :class="{ selected: selector == selectedTimeSpanType }"
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
            </div>
          </div>
        </section>
        <footer class="modal-card-foot custom-modal-card-foot">
          <div v-if="getCurrentModal.step == 1" class="is-flex is-max-width">
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
                @click="$modal.open(this.$options.name, 2), (showModal = true)"
              >
                <i class="ml-2 fas icon fa-file-export">
                  <fa-icon icon="file-export"
                /></i>
                <span>{{ $gettext("Export") }}</span>
              </button>
            </div>
          </div>
          <div
            v-if="getCurrentModal.step == 2"
            class="is-flex is-justify-content-flex-end is-max-width"
          >
            <div v-if="getPlatform === 'web'" class="mr-2">
              <button
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
              </button>
            </div>
            <div v-else class="ml-2">
              <button
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
            </div>
          </div>
        </footer>
      </div>
    </div>
    <div
      v-if="!transactionsLoading && thisWeektransactions?.length"
      class="has-text-centered mt-5"
    >
      <button
        @click="$modal.open(this.$options.name, 1), (showModal = true)"
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
      }
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
        "transactionsBatchLoading",
        "thisWeektransactions",
        "userProfile",
      ]),
      ...mapGetters([
        "numericFormat",
        "dateFormat",
        "getModalState",
        "getCurrentModal",
      ]),
    },
    watch: {
      showModal(newval: boolean, oldval: boolean) {
        if (newval) {
          this.$nextTick(() => {
            let div = this.$refs.transactionsContainer
            if (div.scrollTop === div.scrollHeight - div.offsetHeight) {
              debugger
              this.$store.dispatch("fetchTransactionsBatch")
            }
          })
        }
      },
    },
    methods: {
      handleScroll: function (evt: any) {
        debugger
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
        this.$modal.close(this.$options.name, 2)
        this.showModal = false
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
        this.$msg.success(this.$gettext("Transaction list shared"))
        this.$modal.close(this.$options.name, 2)
        this.$modal.close(this.$options.name, 1)
        this.showModal = false
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

    .hide {
      visibility: hidden;
    }

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
  .is-max-width {
    width: 100%;
  }
</style>
