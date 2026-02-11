<template>
  <div class="modal is-active">
    <div class="modal-background"></div>

    <!-- Step 1: Contract details -->
    <template v-if="$modal.step.value == 1">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Recurrent contract") }}
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
                v-if="contract.state === 'open'"
                icon="sync"
                class="status-icon active"
              />
              <fa-icon
                v-else-if="contract.state === 'cancelled'"
                icon="ban"
                class="status-icon cancelled"
              />
              <fa-icon
                v-else
                icon="file-contract"
                class="status-icon default"
              />
            </div>

            <!-- Status label -->
            <p class="status-label mb-2" :class="contract.state">
              {{ stateLabel }}
            </p>

            <!-- Amount -->
            <p class="amount has-text-weight-bold is-size-3 mb-1">
              {{ numericFormat(parseFloat(contract.amount)) }}
              <span class="currency">{{ currency }}</span>
            </p>

            <!-- Next execution date -->
            <p v-if="contract.nextExecutionDate" class="next-execution mb-3">
              {{ $gettext("Next:") }} {{ formatDate(contract.nextExecutionDate) }} - {{ relativeDate(contract.nextExecutionDate) }}
            </p>

            <!-- Recurrence info -->
            <p class="recurrence-info mb-3">
              <fa-icon icon="calendar-alt" class="mr-2" />
              {{ recurrenceLabel }}
            </p>

            <!-- Message if present -->
            <p v-if="contract.message" class="message-text mb-3">
              « {{ contract.message }} »
            </p>

            <!-- From / To -->
            <div class="parties mb-3">
              <p class="frame3-sub-title">{{ $gettext("from") }}</p>
              <p class="party-name has-text-weight-bold is-size-5">
                {{ contract.senderName }}
              </p>
              <p class="frame3-sub-title mt-2">{{ $gettext("to") }}</p>
              <p class="party-name has-text-weight-bold is-size-5">
                {{ contract.receiverName }}
              </p>
            </div>

            <!-- Date range -->
            <div class="date-range mb-3">
              <p class="frame3-sub-title">{{ $gettext("Period") }}</p>
              <p class="is-size-6">
                <span v-if="contract.dateStart">
                  {{ $gettext("From") }} {{ formatDate(contract.dateStart) }}
                </span>
                <span v-if="contract.dateEnd">
                  {{ " " }}{{ $gettext("to") }} {{ formatDate(contract.dateEnd) }}
                </span>
                <span v-else>
                  {{ $gettext("(no end date)") }}
                </span>
              </p>
            </div>

            <!-- Date and creator -->
            <p class="frame3-sub-title date-info">
              {{ $gettext("Created on") }} {{ dateFormat(contract.date) }}
              {{ $gettext("by") }} {{ contract.creatorName }}
            </p>
          </div>
        </section>
        <footer class="modal-card-foot custom-modal-card-foot is-justify-content-center">
          <button
            v-if="contract.isCreator && contract.state === 'open'"
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
  import { UIError } from "../exception"
  import moment from "moment"

  @Options({
    name: "RecurrentContractModal",
    data() {
      return {
        isDeleting: false,
      }
    },
    computed: {
      ...mapGetters(["dateFormat", "numericFormat"]),

      contract() {
        return this.$modal.args.value[0].contract
      },

      currency() {
        return this.$modal.args.value[0].account?.curr || ""
      },

      stateLabel() {
        const stateTranslations: { [key: string]: string } = {
          open: this.$gettext("active"),
          cancelled: this.$gettext("cancelled"),
        }
        return stateTranslations[this.contract.state] || this.contract.state
      },

      recurrenceLabel() {
        const ruleTypeTranslations: { [key: string]: string } = {
          daily: this.$gettext("Daily"),
          weekly: this.$gettext("Weekly"),
          monthly: this.$gettext("Monthly"),
          yearly: this.$gettext("Yearly"),
        }
        const ruleType = this.contract.recurringRuleType
        const interval = this.contract.recurringInterval
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
