<template>
  <div class="modal is-active" ref="recurrentContract">
    <div class="modal-background"></div>
    <template v-if="$modal.step.value == 1">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            {{ $gettext("Recurring payment details") }}
          </p>
          <button
            class="delete"
            aria-label="close"
            @click="$modal.close()"
          ></button>
        </header>
        <section class="modal-card-body">
          <div class="body-content is-size-4">
            <p class="custom-card-title has-text-weight-bold">
              {{ statusTitle }}
            </p>
            <div class="confirm-icon-container">
              <fa-icon icon="sync" class="confirm-icon fa-thin open" />
            </div>
            <div class="amount-details mb-3">
              <p class="amount is-size-3 has-text-weight-bold">
                {{ numericFormat(parseFloat(contractData.amount)) }}
                {{ currency }}
              </p>
            </div>

            <div>
              <h2 class="frame3-sub-title">{{ $gettext("from") }}</h2>
              <p
                class="
                  frame3-sub-title
                  has-text-weight-bold
                  is-size-3
                  hide-overflow
                "
              >
                {{ contractData.senderName }}
              </p>
            </div>
            <div>
              <h2 class="frame3-sub-title">{{ $gettext("to") }}</h2>
              <p
                class="
                  frame3-sub-title
                  has-text-weight-bold
                  is-size-3
                  hide-overflow
                "
              >
                {{ contractData.receiverName }}
              </p>
            </div>
            <hr class="participant-divider" />
            <div v-if="contractData.message" class="contract-description">
              <p class="message-text is-size-5">“{{ contractData.message }}”</p>
            </div>

            <p
              v-if="nextOccurrenceDate"
              class="contract-summary is-size-5 mb-3"
            >
              {{ $gettext("Next:") }}
              {{ formatDate(nextOccurrenceDate) }}
              <span class="recurrence-payment">
                ({{ recurrencePaymentLabel }})
              </span>
            </p>
            <div class="contract-summary date-range mb-3">
              <p class="is-size-5">
                <span v-if="contractData.dateStart">
                  {{ $gettext("From") }}
                  {{ formatDate(contractData.dateStart) }}
                </span>
                <span v-if="contractData.dateEnd">
                  {{ " " }}{{ $gettext("to") }}
                  {{ formatDate(contractData.dateEnd) }}
                </span>
                <span v-else> {{ " " }}{{ $gettext("(no end date)") }} </span>
              </p>
            </div>
            <p class="contract-summary is-size-5 mb-3">
              {{ createdOnSentence }}
            </p>
            <p class="contract-guidance is-size-5 mb-3">
              {{ contractGuidance }}
            </p>
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
            v-if="contractData.isCreator && contractData.state === 'open'"
            class="button custom-button-modal has-text-weight-medium"
            @click="startDelete()"
          >
            <span>{{ $gettext("Delete") }}</span>
          </button>
        </footer>
      </div>
    </template>
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
            {{ $gettext("Delete recurring payment") }}
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
              {{
                $gettext(
                  "Are you sure you want to delete this recurring payment?"
                )
              }}
            </p>
            <p class="is-size-6 has-text-grey">
              {{ $gettext("This action cannot be undone.") }}
            </p>
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
    mounted() {
      this.$refs.recurrentContract.focus()
    },
    computed: {
      ...mapGetters(["dateFormat", "numericFormat"]),
      contract() {
        return this.$modal.args.value[0].contract
      },

      contractData() {
        return this.contract
      },

      currency() {
        return this.$modal.args.value[0].account?.curr || ""
      },

      statusTitle() {
        return this.$gettext("Active recurring payment")
      },

      createdOnSentence() {
        const date = this.dateFormat(moment(this.contractData.date).toDate())
        return this.$gettext("Created on %{date}", { date })
      },

      contractGuidance() {
        if (this.contractData.isCreator) {
          return this.$gettext(
            "This operation is automatically repeated at the selected frequency. You can delete this recurring payment to stop future operations."
          )
        }
        return this.$gettext(
          "This operation is automatically repeated at the selected frequency."
        )
      },

      nextOccurrenceDate() {
        return this.contractData.nextExecutionDate
      },

      recurrencePaymentLabel() {
        return this.$gettext("%{ recurrence } payments", {
          recurrence: this.recurrenceLabel,
        })
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
        return this.dateFormat(moment(dateStr).toDate())
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
            this.$msg.success(
              this.$gettext("Recurring payment deleted successfully")
            )
            const { refreshContracts } = this.$modal.args.value[0]
            if (refreshContracts) refreshContracts()
            this.$modal.close()
          } else {
            throw new Error("Delete returned false")
          }
        } catch (err) {
          throw new UIError(
            this.$gettext(
              "Failed to delete recurring payment. Please try again or contact your administrator."
            ),
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

  .confirm-icon-container {
    width: fit-content;
    margin: auto;
  }

  .confirm-icon {
    font-size: 4em;

    &.open {
      color: $color-2;
    }
  }

  .hide-overflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

  .participant-divider {
    width: 70%;
    height: 1px;
    margin: 0.75rem auto;
    border: 0;
    background-color: rgba(0, 0, 0, 0.14);
  }

  .contract-summary {
    color: hsl(0, 0%, 21%);
  }

  .recurrence-payment {
    margin-left: 0.25rem;
    white-space: nowrap;
  }

  .contract-guidance {
    color: #666;
    font-style: italic;
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
