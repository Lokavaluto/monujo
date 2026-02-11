<template>
  <div
    class="modal is-active"
    v-show="$modal.modal.value == $options.name"
    ref="contracts"
  >
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-title-shrink">
          <span class="ml-2">{{ $gettext("All recurring payments") }}</span>
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
              <strong>{{ $gettext("Next payment period:") }}</strong>
            </div>
            <div class="datepicker-export">
              <date-picker
                v-model:value="filterDate"
                :open="datePickerShow ? true : null"
                range
                prefix-class="xmx"
                :editable="false"
                :placeholder="$gettext('All recurring payments')"
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
                        :disabled="isPreviousTimeSpanDisabled(selector)"
                        @click="
                          () => {
                            if (isPreviousTimeSpanDisabled(selector)) return
                            selectedTimeSpanOffset =
                              selectedTimeSpanType != selector
                                ? 0
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
                          hide: selectedTimeSpanType != selector,
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
                  :placeholder="$gettext('All recipients')"
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
          </div>
        </div>
        <div class="container is-fluid custom-heavy-line-separator"></div>
      </div>
      <section class="modal-card-body" ref="contractsContainer">
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
            v-for="contract in filteredContracts"
            :key="contract.id"
            :transaction="contract"
            @click="openContractModal(contract)"
          />
          <div
            v-if="filteredContracts.length == 0 && !isLoading"
            class="is-flex is-align-items-center is-justify-content-center"
          >
            {{ $gettext("No recurring payment found") }}
          </div>
          <Loading
            v-if="isLoading"
            v-model:active="isLoading"
            class="loader-container"
            :can-cancel="false"
            :is-full-page="false"
            :width="30"
            :height="30"
          />
        </div>
      </section>
      <footer
        class="modal-card-foot custom-modal-card-foot is-justify-content-end"
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
  import Loading from "vue-loading-overlay"
  import DatePicker from "vue-datepicker-next"

  import { ModelListSelect } from "vue-search-select"
  import moment from "moment"

  import TransactionItem from "./TransactionItem.vue"

  // Assets

  import "vue-datepicker-next/index.css"
  import "vue-search-select/dist/VueSearchSelect.css"
  import "@/assets/datepicker.scss"

  import { getUserAccount } from "@/utils/account"
  import UseBatchLoading from "@/services/UseBatchLoading"

  @Options({
    name: "ContractListModal",
    components: {
      Loading,
      DatePicker,
      TransactionItem,
      ModelListSelect,
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
        isLoading: false,
        selectedRecipientIdx: null,
        recipientBatchLoader: null,
        allContracts: [],
      }
    },

    created() {
      const [opts] = this.$modal.args.value
      const account = getUserAccount(opts.account)

      this.accountObj = account
      const backend = account.parent

      this.recipientBatchLoader = UseBatchLoading({
        genFactory: backend.searchRecipients.bind(backend),
        needMorePredicate: () =>
          this.$recipients.scrollHeight -
            (this.$recipients.scrollTop + this.$recipients.offsetHeight) <=
          50,
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
      this.setFocus()
      const $recipients = this.$el.querySelector(".menu")

      $recipients.addEventListener(
        "scroll",
        this.recipientBatchLoader.getNextElements.bind(
          this.recipientBatchLoader
        )
      )
      this.$recipients = $recipients
      this.recipientBatchLoader.newGen("")
      this.fetchContracts()
    },
    computed: {
      minFilterDate() {
        return moment().startOf("day").toDate()
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

        return [begin < this.minFilterDate ? this.minFilterDate : begin, end]
      },
      filteredContracts(): any[] {
        const [dateBegin, dateEnd] = this.filterDate
        const selectedRecipientInternalId =
          this.recipientBatchLoader.elements[this.selectedRecipientIdx]
            ?.userAccountInternalId

        return this.allContracts.filter((contract: any) => {
          if (dateBegin || dateEnd) {
            const nextPaymentDate = this.getContractNextPaymentDate(contract)
            if (!nextPaymentDate) return false
            if (dateBegin && nextPaymentDate < dateBegin) return false
            if (dateEnd && nextPaymentDate > dateEnd) return false
          }
          if (
            selectedRecipientInternalId &&
            selectedRecipientInternalId !== contract.senderWalletUri &&
            selectedRecipientInternalId !== contract.receiverWalletUri
          ) {
            return false
          }
          return true
        })
      },
    },
    methods: {
      setFocus() {
        this.$refs.contracts.focus()
      },
      async fetchContracts() {
        this.isLoading = true
        try {
          const contracts = await this.accountObj.getRecurrentContracts([
            "open",
          ])
          this.allContracts = contracts
            .map((contract: any) => {
              contract.currency = this.$modal.args.value[0].account.curr
              return contract
            })
            .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
        } catch (e) {
          this.$msg.error(
            this.$gettext(
              "An unexpected issue occurred while downloading recurring payment list"
            )
          )
          throw e
        } finally {
          this.isLoading = false
        }
      },
      openContractModal(contract: any) {
        const { account, refreshContracts: refreshRecentContracts } =
          this.$modal.args.value[0]

        this.$modal.open("RecurrentContractModal", {
          contract,
          account,
          refreshContracts: () => {
            this.fetchContracts()
            refreshRecentContracts?.()
          },
        })
      },
      disabledDates(date: Date) {
        return moment(date).isBefore(this.minFilterDate, "day")
      },
      isPreviousTimeSpanDisabled(selector: string) {
        if (this.selectedTimeSpanType !== selector) {
          return true
        }
        return this.selectedTimeSpanOffset <= 0
      },
      getContractNextPaymentDate(contract: any): Date | null {
        if (!contract.nextExecutionDate) return null
        const nextPaymentDate = moment(contract.nextExecutionDate)
        return nextPaymentDate.isValid() ? nextPaymentDate.toDate() : null
      },

      onRecipientSearch(recipientsSearchString: any) {
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
    },
    watch: {
      selectedRecipientIdx(): void {
        this.onRecipientSearch("")
      },
      filterDate(newFilterDate): void {
        const [newBegin, newEnd] = newFilterDate
        const [normBegin, normEnd] = [
          newBegin ? moment(newBegin).startOf("day").toDate() : null,
          newEnd ? moment(newEnd).endOf("day").toDate() : null,
        ]
        if (normEnd && normEnd < this.minFilterDate) {
          this.filterDate = ["", ""]
          return
        }
        if (normBegin && normBegin < this.minFilterDate) {
          this.filterDate = [this.minFilterDate, normEnd]
          return
        }
        if (
          normBegin &&
          normEnd &&
          (+newBegin != +normBegin || +newEnd != +normEnd)
        ) {
          this.filterDate = [normBegin, normEnd]
          return
        }
      },
    },
  })
  export default class ContractListModal extends Vue {}
</script>
<style lang="scss">
  @import "@/assets/custom-variables";

  section.modal-card-body {
    padding: 0.5em;
  }
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
    width: 16.2em;
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
  .loader-container {
    position: relative;
    height: 80px;
  }
  .ui.fluid.dropdown > .dropdown.icon {
    display: none;
  }
  button.disable {
    pointer-events: none;
  }
  @media only screen and (min-height: 1024px) {
    .ui.selection.dropdown .menu {
      max-height: 20em !important;
    }
  }
  @media only screen and (max-height: 1023px) and (min-height: 768px) {
    .ui.selection.dropdown .menu {
      max-height: 12em !important;
    }
  }
  @media only screen and (max-height: 767px) {
    .ui.selection.dropdown .menu {
      max-height: 7em !important;
    }
  }
</style>
