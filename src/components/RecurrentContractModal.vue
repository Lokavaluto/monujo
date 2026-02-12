<template>
  <div class="modal is-active">
    <div class="modal-background"></div>

    <!-- Step 1: Contract details -->
    <template v-if="$modal.step.value == 1">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            {{
              isCreateMode
                ? $gettext("Create recurrent contract")
                : $gettext("Recurrent contract")
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
            <!-- Status icon -->
            <div class="status-icon-container mb-3">
              <fa-icon
                v-if="isCreateMode || contractData.state === 'open'"
                icon="sync"
                class="status-icon active"
              />
              <fa-icon
                v-else-if="contractData.state === 'cancelled'"
                icon="ban"
                class="status-icon cancelled"
              />
              <fa-icon
                v-else
                icon="file-alt"
                class="status-icon default"
              />
            </div>

            <!-- Status label -->
            <p class="status-label mb-2" :class="isCreateMode ? 'new' : contractData.state">
              {{ stateLabel }}
            </p>

            <!-- Amount -->
            <p class="amount has-text-weight-bold is-size-3 mb-1">
              {{ numericFormat(parseFloat(contractData.amount)) }}
              <span class="currency">{{ currency }}</span>
            </p>

            <!-- Next execution date (only in view mode) -->
            <p v-if="!isCreateMode && contractData.nextExecutionDate" class="next-execution mb-3">
              {{ $gettext("Next:") }} {{ formatDate(contractData.nextExecutionDate) }} - {{ relativeDate(contractData.nextExecutionDate) }}
            </p>

            <!-- Recurrence info -->
            <p class="recurrence-info mb-3">
              <fa-icon icon="calendar-alt" class="mr-2" />
              {{ recurrenceLabel }}
            </p>

            <!-- Message if present -->
            <p v-if="contractData.message" class="message-text mb-3">
              {{ contractData.message }}
            </p>

            <!-- From / To -->
            <div class="parties mb-3">
              <p class="frame3-sub-title">{{ $gettext("from") }}</p>
              <p class="party-name has-text-weight-bold is-size-5">
                {{ contractData.senderName }}
              </p>
              <p class="frame3-sub-title mt-2">{{ $gettext("to") }}</p>
              <p class="party-name has-text-weight-bold is-size-5">
                {{ contractData.receiverName }}
              </p>
            </div>

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

            <!-- Date and creator (only in view mode) -->
            <p v-if="!isCreateMode" class="frame3-sub-title date-info">
              {{ $gettext("Created on") }} {{ dateFormat(contractData.date) }}
              {{ $gettext("by") }} {{ contractData.creatorName }}
            </p>
            <!-- Creator info (only in create mode) -->
            <p v-else class="frame3-sub-title date-info">
              {{ $gettext("Created by") }} {{ contractData.creatorName }}
            </p>
          </div>
        </section>
        <footer class="modal-card-foot custom-modal-card-foot is-justify-content-center">
          <!-- Create mode: Create button -->
          <button
            v-if="isCreateMode"
            class="button custom-button-modal button-modal has-text-weight-medium"
            :disabled="isCreating"
            @click="createContract()"
          >
            <span v-if="isCreating" class="icon">
              <fa-icon icon="circle-notch" class="refreshing" />
            </span>
            <span v-else class="icon">
              <fa-icon icon="sync" />
            </span>
            <span>{{ $gettext("Create recurrent contract") }}</span>
          </button>
          <!-- View mode: Delete button -->
          <button
            v-else-if="contractData.isCreator && contractData.state === 'open'"
            class="button custom-button-modal button-modal has-text-weight-medium action btn-danger"
            @click="startDelete()"
          >
            <span class="icon">
              <fa-icon icon="trash" />
            </span>
            <span>{{ $gettext("Delete") }}</span>
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
        <footer class="modal-card-foot custom-modal-card-foot is-justify-content-flex-end">
          <button
            class="button custom-button-modal button-modal has-text-weight-medium"
            @click="$modal.back()"
          >
            {{ $gettext("Cancel") }}
          </button>
          <button
            class="button custom-button-modal button-modal has-text-weight-medium btn-danger"
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
    computed: {
      ...mapGetters(["dateFormat", "numericFormat"]),
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

      stateLabel() {
        if (this.isCreateMode) {
          return this.$gettext("new")
        }
        const stateTranslations: { [key: string]: string } = {
          open: this.$gettext("active"),
          cancelled: this.$gettext("cancelled"),
        }
        return stateTranslations[this.contractData.state] || this.contractData.state
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

        // Get the account object with createRecurrentContract method
        let accountObj = args.account._obj
        if (!accountObj?.createRecurrentContract) {
          // Try parent if needed
          accountObj = accountObj?.parent
        }

        if (!accountObj?.createRecurrentContract) {
          this.isCreating = false
          throw new UIError(
            this.$gettext(
              "Failed to create recurrent contract. Please try again or contact your administrator."
            ),
            new Error("createRecurrentContract method not available")
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

  .status-icon-container {
    width: fit-content;
    margin: auto;
  }

  .status-icon {
    font-size: 4em;

    &.active {
      color: $color-2;
    }

    &.cancelled {
      color: #6c757d;
    }

    &.default {
      color: #856404;
    }
  }

  .status-label {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.05em;

    &.open {
      color: $color-2;
    }

    &.new {
      color: $color-2;
    }

    &.cancelled {
      color: #383d41;
    }
  }

  .amount {
    .currency {
      font-size: 0.7em;
      opacity: 0.8;
    }
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
  }

  .parties {
    .frame3-sub-title {
      color: #888;
      font-size: 0.9rem;
    }

    .party-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .date-range {
    .frame3-sub-title {
      color: #888;
      font-size: 0.9rem;
    }
  }

  .date-info {
    color: #888;
    font-size: 0.85rem;
  }

  .modal-card-foot {
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .button.action {
    white-space: normal;
    height: auto;

    .icon {
      margin-right: 0.3em;
    }
  }

  .btn-danger {
    background-color: #cc0f35 !important;
    color: white !important;
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
