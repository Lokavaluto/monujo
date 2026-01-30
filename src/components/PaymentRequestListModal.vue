<template>
  <div
    class="modal is-active"
    v-if="$modal.modal.value == $options.name"
    ref="paymentRequests"
  >
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-title-shrink">
          <span class="ml-2">{{ $gettext("My unpaid payment requests") }}</span>
        </p>
        <button
          class="delete"
          aria-label="close"
          @click="$modal.back()"
        ></button>
      </header>
      <div class="filter-area">
        <div class="ml-2 mt-2">
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
                v-model:value="filterDate"
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
                      :key="selector"
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
              <strong>{{ $gettext("Select contact:") }}</strong>
            </div>
            <div class="recipient-filter is-flex is-flex-direction-row">
              <div class="recipient-filter-input">
                <model-list-select
                  :list="
                    recipientBatchLoader.elements.map((r, idx) => ({
                      name: r.name,
                      idx,
                    }))
                  "
                  option-value="idx"
                  option-text="name"
                  v-model="selectedRecipientIdx"
                  :placeholder="$gettext('All recipient')"
                  @searchchange="onRecipientSearch"
                  id="recipientSelector"
                >
                </model-list-select>
              </div>
              <div>
                <button
                  class="recipient-filter-reset"
                  :class="{ disable: selectedRecipientIdx === null }"
                  @click="selectedRecipientIdx = null"
                >
                  <fa-icon
                    class="refreshing"
                    v-if="recipientBatchLoader.isNewBatchLoading"
                    icon="sync"
                  ></fa-icon>
                  <fa-icon
                    v-else-if="selectedRecipientIdx !== null"
                    icon="fa-xmark"
                  >
                  </fa-icon>
                  <fa-icon v-else icon="fa-user"></fa-icon>
                </button>
              </div>
            </div>

            <div class="mb-1 mt-3">
              <strong>{{ $gettext("Filter by status:") }}</strong>
            </div>
            <div class="refused-filter is-flex is-align-items-center mb-1">
              <label class="switch" for="refusedPaymentRequestsOnly">
                <input
                  id="refusedPaymentRequestsOnly"
                  v-model="showRefusedOnly"
                  type="checkbox"
                />
                <span class="slider round"></span>
              </label>
              <label class="ml-2" for="refusedPaymentRequestsOnly">
                {{ $gettext("Refused requests only") }}
              </label>
            </div>
          </div>
        </div>
        <div class="container is-fluid custom-heavy-line-separator"></div>
      </div>
      <section class="modal-card-body">
        <TransactionItem
          v-for="paymentRequest in filteredPaymentRequestList"
          :key="paymentRequest"
          :transaction="paymentRequest"
          @click="openModal(paymentRequest)"
        />
        <div
          v-if="filteredPaymentRequestList.length == 0"
          class="is-flex is-align-items-center is-justify-content-center"
        >
          {{
            showRefusedOnly
              ? $gettext("No refused payment request found")
              : $gettext("No transaction found")
          }}
        </div>
      </section>
      <footer
        class="
          modal-card-foot
          custom-modal-card-foot
          is-justify-content-flex-end
        "
      >
        <button
          class="button custom-button-modal has-text-weight-medium"
          @click="$modal.back()"
        >
          {{ $gettext("Close") }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import DatePicker from "vue-datepicker-next"
  import { ModelListSelect } from "vue-search-select"
  import moment from "moment"

  import TransactionItem from "./TransactionItem.vue"
  import UseBatchLoading from "@/services/UseBatchLoading"
  import { getUserAccount } from "@/utils/account"

  import "vue-datepicker-next/index.css"
  import "vue-search-select/dist/VueSearchSelect.css"
  import "@/assets/datepicker.scss"

  @Options({
    name: "PaymentRequestListModal",
    components: {
      DatePicker,
      ModelListSelect,
      TransactionItem,
    },
    data(this: any) {
      return {
        filterDate: ["", ""],
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
        selectedRecipientIdx: null,
        showRefusedOnly: false,
        recipientBatchLoader: null,
        paymentRequestList: [],
        account: null,
        refreshTransaction: null,
        refreshAccounts: null,
      }
    },
    created() {
      const [opts] = this.$modal.args.value
      this.paymentRequestList = opts.paymentRequestList
      this.account = opts.account
      this.refreshTransaction = opts.refreshTransaction
      this.refreshAccounts = opts.refreshAccounts

      const account = getUserAccount(this.account)
      const backend = account.parent
      this.recipientBatchLoader = UseBatchLoading({
        genFactory: backend.searchRecipients.bind(backend),
        needMorePredicate: () => {
          const div = this.$recipients
          if (!div) return false
          return div.scrollHeight - (div.scrollTop + div.offsetHeight) <= 50
        },
        onError: (e) => {
          this.$msg.error(
            this.$gettext(
              "An unexpected issue occured while downloading recipient list"
            )
          )
          throw e
        },
      })
    },
    mounted() {
      const $recipients = this.$el.querySelector(".menu")
      this._recipientsScroll = new AbortController()

      $recipients.addEventListener(
        "scroll",
        this.recipientBatchLoader.getNextElements.bind(
          this.recipientBatchLoader
        ),
        this._recipientsScroll
      )
      this.$recipients = $recipients
      this.recipientBatchLoader.newGen("")
    },
    beforeUnmount() {
      this._recipientsScroll?.abort()
    },
    computed: {
      isSelectionCurrent(): boolean {
        return moment().isBetween(this.filterDate[0], this.filterDate[1])
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
      filteredPaymentRequestList() {
        const [dateBegin, dateEnd] = this.filterDate
        const selectedRecipientName =
          this.recipientBatchLoader.elements[this.selectedRecipientIdx]?.name

        return this.paymentRequestList.filter((paymentRequest: any) => {
          if (this.showRefusedOnly && paymentRequest.state !== "refused") {
            return false
          }
          if (dateBegin && paymentRequest.date < dateBegin) return false
          if (dateEnd && paymentRequest.date > dateEnd) return false
          if (
            selectedRecipientName &&
            !this.getPaymentRequestRecipientNames(paymentRequest).includes(
              selectedRecipientName
            )
          ) {
            return false
          }
          return true
        })
      },
    },
    methods: {
      async fetchPaymentRequestList() {
        try {
          this.paymentRequestList = (
            await getUserAccount(this.account).getPaymentRequests([
              "open",
              "refused",
            ])
          ).map((paymentRequest: any) => {
            paymentRequest.currency = this.account.curr
            return paymentRequest
          })
        } catch (err) {
          this.$msg.error(
            this.$gettext(
              "An unexpected server error occured while fetching payment requests list"
            )
          )
          console.log("Exception when fetching payment requests list:", err)
        }
      },
      refreshPaymentRequestList() {
        this.fetchPaymentRequestList()
        if (this.refreshTransaction) this.refreshTransaction()
      },
      refreshPaymentRequestAccounts(...args: any[]) {
        if (this.refreshAccounts) this.refreshAccounts(...args)
      },
      getPaymentRequestRecipientNames(paymentRequest: any) {
        return [
          paymentRequest.related,
          paymentRequest.jsonData?.sender_name,
          paymentRequest.jsonData?.receiver_name,
          paymentRequest.creatorName,
        ].filter(Boolean)
      },
      disabledDates(date: Date) {
        return date > moment().endOf("day").toDate()
      },
      async onRecipientSearch(recipientsSearchString: any) {
        if (
          this.selectedRecipientIdx !== null &&
          recipientsSearchString === ""
        ) {
          return
        }
        if (
          recipientsSearchString.length > 2 ||
          recipientsSearchString.length === 0
        ) {
          this.recipientBatchLoader.newGen(recipientsSearchString)
        }
      },
      async openModal(paymentRequest: any) {
        await this.$modal.open("PaymentRequestModal", {
          paymentRequest,
          account: this.account,
          refreshTransaction: this.refreshPaymentRequestList,
          refreshAccounts: this.refreshPaymentRequestAccounts,
        })
      },
    },
    watch: {
      selectedRecipientIdx: async function (): Promise<void> {
        this.onRecipientSearch("")
      },
      filterDate: async function (newFilterDate): Promise<void> {
        const [newBegin, newEnd] = newFilterDate
        const [normBegin, normEnd] = [
          newBegin ? moment(newBegin).startOf("day").toDate() : null,
          newEnd ? moment(newEnd).endOf("day").toDate() : null,
        ]
        if (
          normBegin &&
          normEnd &&
          (+newBegin != +normBegin || +newEnd != +normEnd)
        ) {
          this.filterDate = [normBegin, normEnd]
        }
      },
    },
  })
  export default class PaymentRequestListModal extends Vue {}
</script>

<style lang="scss" scoped>
  @import "@/assets/custom-variables";
  @import "@/assets/switch-prefs";

  .refused-filter {
    min-height: 1.5rem;

    .switch {
      flex-shrink: 0;
    }

    label:last-child {
      cursor: pointer;
    }
  }
</style>
