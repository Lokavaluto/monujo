<template>
  <div class="modal is-active" ref="recurrentContract">
    <div class="modal-background"></div>

    <!-- Step 1: Contract details -->
    <template v-if="$modal.step.value == 1">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            {{
              isCreateMode
                ? $gettext("Create recurrent contract")
                : $gettext("Recurrent contract details")
            }}
          </p>
          <button
            class="delete"
            aria-label="close"
            @click="$modal.close()"
          ></button>
        </header>
        <section class="modal-card-body">
          <div class="body-content is-size-4">
            <!-- Status title -->
            <p class="custom-card-title has-text-weight-bold">
              {{ statusTitle }}
            </p>

            <!-- Status icon -->
            <div class="confirm-icon-container">
              <fa-icon
                :icon="statusIcon"
                class="confirm-icon fa-thin"
                :class="isCreateMode ? 'new' : contractData.state"
              />
            </div>

            <!-- From / To -->
            <div>
              <h2 class="frame3-sub-title">{{ $gettext("from") }}</h2>
              <p
                class="frame3-sub-title has-text-weight-bold is-size-3 hide-overflow"
              >
                {{ contractData.senderName }}
              </p>
            </div>
            <div>
              <h2 class="frame3-sub-title">{{ $gettext("to") }}</h2>
              <p
                class="frame3-sub-title has-text-weight-bold is-size-3 hide-overflow"
              >
                {{ contractData.receiverName }}
              </p>
            </div>

            <!-- Amount -->
            <div class="amount-details mb-3">
              <p class="frame3-sub-title">{{ $gettext("Amount") }}</p>
              <p class="amount is-size-6">
                {{ numericFormat(parseFloat(contractData.amount)) }}
                {{ currency }}
              </p>
            </div>

            <!-- Description if present -->
            <div v-if="contractData.message" class="contract-description">
              <h2 class="frame3-sub-title">{{ $gettext("Description") }}</h2>
              <p class="message-text">“{{ contractData.message }}”</p>
            </div>

            <!-- Next execution date (only in view mode) -->
            <p
              v-if="!isCreateMode && contractData.nextExecutionDate"
              class="next-execution mb-3"
            >
              {{ $gettext("Next:") }}
              {{ formatDate(contractData.nextExecutionDate) }} -
              {{ relativeDate(contractData.nextExecutionDate) }}
            </p>

            <!-- Recurrence info -->
            <p class="recurrence-info mb-3">
              <fa-icon icon="calendar-alt" class="mr-2" />
              {{ recurrenceLabel }}
            </p>

            <!-- Date range -->
            <div class="date-range mb-3">
              <p class="frame3-sub-title">{{ $gettext("Period") }}</p>
              <p class="is-size-6">
                <span v-if="contractData.dateStart">
                  {{ $gettext("From") }} {{ formatDate(contractData.dateStart) }}
                </span>
                <span v-if="contractData.dateEnd">
                  {{ " " }}{{ $gettext("to") }} {{ formatDate(contractData.dateEnd) }}
                </span>
                <span v-else>
                  {{ $gettext("(no end date)") }}
                </span>
              </p>
            </div>

            <!-- Date and creator -->
            <p class="frame3-sub-title mb-3">
              <template v-if="contractData.creatorName">
                {{ createdBySentence }}<br v-if="!isCreateMode" />
              </template>
              <template v-if="!isCreateMode">
                {{ createdOnSentence }}
              </template>
            </p>

            <!-- Purpose and available action -->
            <p class="contract-guidance is-size-5 mb-3">
              {{ contractGuidance }}
            </p>
          </div>
        </section>
        <footer
          class="modal-card-foot custom-modal-card-foot is-justify-content-flex-end"
        >
          <button
            v-if="isCreateMode"
            class="button custom-button-modal has-text-weight-medium"
            :disabled="isCreating"
            @click="createContract()"
          >
            <span v-if="isCreating" class="icon">
              <fa-icon icon="circle-notch" class="refreshing" />
            </span>
            <span>{{ $gettext("Create recurrent contract") }}</span>
          </button>
          <!-- View mode: Delete button -->
          <button
            v-else-if="contractData.isCreator && contractData.state === 'open'"
            class="button custom-button-modal has-text-weight-medium"
            @click="startDelete()"
          >
            <span>{{ $gettext("Delete") }}</span>
          </button>
          <button
            v-else-if="contractData.state === 'cancelled'"
            class="button custom-button-modal has-text-weight-medium"
            @click="$modal.close()"
          >
            <span>{{ $gettext("Ok") }}</span>
          </button>
        </footer>
      </div>
    </template>

    <!-- Step 2: Delete confirmation -->
    <template v-if="$modal.step.value == 2">
      <div class="modal-card">
        <header class="modal-card-head">
          <span class="is-flex is-flex-shrink-0">
            <a class="mr-3 is-flex" @click="$modal.back()">
              <span class="icon has-text-white">
                <fa-icon icon="arrow-left" class="fa-lg" />
              </span>
            </a>
          </span>
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Delete contract") }}
          </p>
          <button
            class="delete"
            aria-label="close"
            @click="$modal.close()"
          ></button>
        </header>
        <section class="modal-card-body">
          <div class="body-content has-text-centered">
            <fa-icon icon="exclamation-triangle" class="warning-icon mb-4" />
            <p class="is-size-5 mb-4">
              {{ $gettext("Are you sure you want to delete this recurrent contract?") }}
            </p>
            <p class="is-size-6 has-text-grey">
              {{ $gettext("This action cannot be undone.") }}
            </p>
          </div>
        </section>
        <footer
          class="modal-card-foot custom-modal-card-foot is-justify-content-flex-end"
        >
          <button
            class="button custom-button-modal has-text-weight-medium"
            :disabled="isDeleting"
            @click="confirmDelete()"
          >
            <span v-if="isDeleting" class="icon">
              <fa-icon icon="circle-notch" class="refreshing" />
            </span>
            <span>{{ $gettext("Delete") }}</span>
          </button>
        </footer>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapGetters } from "vuex"
  import { mapModuleState } from "@/utils/vuex"
  import { getUserAccount } from "@/utils/account"
  import { UIError } from "../exception"
  import moment from "moment"

  @Options({
    name: "RecurrentContractModal",
    data() {
      return {
        isDeleting: false,
        isCreating: false,
      }
    },
    mounted() {
      this.$refs.recurrentContract.focus()
    },
    computed: {
      ...mapGetters(["numericFormat"]),
      ...mapModuleState("lokapi", ["userProfile"]),

      mode() {
        return this.$modal.args.value[0].mode || "view"
      },

      isCreateMode() {
        return this.mode === "create"
      },

      isRequestMode() {
        return this.$modal.args.value[0].requestMode === true
      },

      contract() {
        return this.$modal.args.value[0].contract
      },

      // Returns contract data for both view and create modes
      contractData() {
        if (this.isCreateMode) {
          const args = this.$modal.args.value[0]
          // In request mode: selectedSender pays, current user receives
          // In transfer mode: current user pays, selectedRecipient receives
          const senderName = this.isRequestMode
            ? args.selectedSender?.name || ""
            : this.userProfile?.name || ""
          const receiverName = this.isRequestMode
            ? this.userProfile?.name || ""
            : args.selectedRecipient?.name || ""
          return {
            amount: args.amount,
            message: args.senderMemo,
            state: "new",
            senderName,
            receiverName,
            creatorName: this.userProfile?.name || "",
            dateStart: args.dateStart,
            dateEnd: args.dateEnd,
            recurringRuleType: args.recurringRuleType,
            recurringInterval: args.recurringInterval,
            nextExecutionDate: null,
            isCreator: true,
          }
        }
        return this.contract
      },

      currency() {
        return this.$modal.args.value[0].account?.curr || ""
      },

      statusTitle() {
        if (this.isCreateMode) {
          return this.$gettext("New recurrent contract")
        }
        const titles: Record<string, string> = {
          open: this.$gettext("Active recurrent contract"),
          cancelled: this.$gettext("Recurrent contract cancelled"),
        }
        return (
          titles[this.contractData.state] ||
          this.$gettext("Recurrent contract")
        )
      },

      statusIcon() {
        if (this.isCreateMode) return "sync"
        const icons: Record<string, string> = {
          open: "sync",
          cancelled: "ban",
        }
        return icons[this.contractData.state] || "file-alt"
      },

      createdOnSentence() {
        const date = moment(this.contractData.date).format(
          "YYYY-MM-DD HH:mm:ssZ"
        )
        return this.contractData.creatorName
          ? date
          : this.$gettext("Created on %{date}", { date })
      },

      createdBySentence() {
        return this.$gettext("Created by %{creator}", {
          creator: this.contractData.creatorName,
        })
      },

      contractGuidance() {
        if (this.isCreateMode) {
          return this.$gettext(
            "This operation will be automatically repeated at the selected frequency."
          )
        }
        if (this.contractData.state === "cancelled") {
          return this.$gettext(
            "This recurrent contract has been cancelled. This operation will no longer be repeated."
          )
        }
        if (this.contractData.isCreator) {
          return this.$gettext(
            "This operation is automatically repeated at the selected frequency. You can delete this contract to stop future operations."
          )
        }
        return this.$gettext(
          "This operation is automatically repeated at the selected frequency."
        )
      },

      recurrenceLabel() {
        const ruleTypeTranslations: { [key: string]: string } = {
          daily: this.$gettext("Daily"),
          weekly: this.$gettext("Weekly"),
          monthly: this.$gettext("Monthly"),
          yearly: this.$gettext("Yearly"),
        }
        const ruleType = this.contractData.recurringRuleType
        const interval = this.contractData.recurringInterval
        if (interval === 1) {
          return ruleTypeTranslations[ruleType] || ruleType
        }
        // For intervals > 1, show "Every X days/weeks/months/years"
        const unitTranslations: { [key: string]: string } = {
          daily: this.$ngettext("day", "days", interval),
          weekly: this.$ngettext("week", "weeks", interval),
          monthly: this.$ngettext("month", "months", interval),
          yearly: this.$ngettext("year", "years", interval),
        }
        return this.$gettext("Every %{ interval } %{ unit }", {
          interval,
          unit: unitTranslations[ruleType] || ruleType,
        })
      },
    },
    methods: {
      formatDate(dateStr: string | null) {
        if (!dateStr) return ""
        return moment(dateStr).format("DD/MM/YYYY")
      },

      relativeDate(dateStr: string | null) {
        if (!dateStr) return ""
        return moment(dateStr).fromNow()
      },

      startDelete() {
        this.$modal.next()
      },

      async confirmDelete() {
        if (this.isDeleting) return
        this.isDeleting = true

        try {
          const success = await this.contract.delete()
          if (success) {
            this.$msg.success(this.$gettext("Contract deleted successfully"))
            // Refresh contracts list
            const { refreshContracts } = this.$modal.args.value[0]
            if (refreshContracts) refreshContracts()
            // Close modal
            this.$modal.close()
          } else {
            throw new Error("Delete returned false")
          }
        } catch (err) {
          throw new UIError(
            this.$gettext("Failed to delete contract. Please try again or contact your administrator."),
            err
          )
        } finally {
          this.isDeleting = false
        }
      },

      async createContract() {
        if (this.isCreating) return
        this.isCreating = true

        const args = this.$modal.args.value[0]

        let accountObj
        try {
          accountObj = getUserAccount(args.account)
        } catch (err) {
          this.isCreating = false
          throw new UIError(
            this.$gettext(
              "Failed to create recurrent contract. Please try again or contact your administrator."
            ),
            err
          )
        }

        // Get wallet URIs
        // In request mode: selectedSender pays, current user (account) receives
        // In transfer mode: current user (account) pays, selectedRecipient receives
        let senderWalletUri, receiverWalletUri
        if (args.requestMode) {
          senderWalletUri = args.selectedSender.userAccountInternalId
          receiverWalletUri = accountObj.internalId
        } else {
          senderWalletUri = accountObj.internalId
          receiverWalletUri = args.selectedRecipient.userAccountInternalId
        }

        // Create the contract - this is the only part that can fail
        let contractIds
        try {
          contractIds = await accountObj.createRecurrentContract([
            {
              sender_wallet_uri: senderWalletUri,
              receiver_wallet_uri: receiverWalletUri,
              amount: parseFloat(args.amount),
              message: args.senderMemo || null,
              date_start: args.dateStart,
              date_end: args.dateEnd || null,
              recurring_rule_type: args.recurringRuleType,
              recurring_interval: args.recurringInterval,
            },
          ])
        } catch (err) {
          this.isCreating = false
          throw new UIError(
            this.$gettext(
              "Failed to create recurrent contract. Please try again or contact your administrator."
            ),
            err
          )
        }

        if (!contractIds || contractIds.length === 0) {
          this.isCreating = false
          throw new UIError(
            this.$gettext(
              "Failed to create recurrent contract. Please try again or contact your administrator."
            ),
            new Error("No contract ID returned")
          )
        }

        // Success
        this.$msg.success(
          this.$gettext("Recurrent contract created successfully")
        )

        // Refresh data if callbacks provided
        if (args.refreshTransaction) args.refreshTransaction()
        if (args.refreshAccounts) args.refreshAccounts(true)

        // Close modal and return to dashboard
        this.$modal.close()
        this.$router.push({ name: "dashboard" })
      },
    },
  })
  export default class RecurrentContractModal extends Vue {}
</script>

<style scoped lang="scss">
  @import "../assets/custom-variables";

  .body-content {
    text-align: center;
  }

  .confirm-icon-container {
    width: fit-content;
    margin: auto;
  }

  .confirm-icon {
    font-size: 4em;

    &.open,
    &.new {
      color: $color-2;
    }

    &.cancelled {
      color: #6c757d;
    }

    &.default {
      color: #856404;
    }
  }

  .hide-overflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .next-execution {
    font-size: 1rem;
    color: #666;
  }

  .recurrence-info {
    font-size: 1.1rem;
    color: #666;
    background-color: #f5f5f5;
    padding: 0.5em 1em;
    border-radius: 0.5em;
    display: inline-block;
  }

  .message-text {
    font-style: italic;
    color: #666;
    font-size: 1rem;
    overflow-wrap: anywhere;
  }

  .contract-description {
    margin-bottom: 0.75rem;
  }

  .contract-guidance {
    color: #666;
    font-style: italic;
  }

  .amount-details,
  .date-range {
    .frame3-sub-title {
      color: #888;
      font-size: 0.9rem;
    }
  }

  .warning-icon {
    font-size: 4em;
    color: #ff9800;
  }

  .refreshing {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
