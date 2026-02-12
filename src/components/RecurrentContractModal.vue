<template>
  <div class="modal is-active" ref="recurrentContract">
    <div class="modal-background"></div>
    <template v-if="$modal.step.value == 1">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-title-shrink">
            {{
              isCreateMode
                ? $gettext("Create recurring payment")
                : $gettext("Recurring payment details")
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
            <p class="custom-card-title has-text-weight-bold">
              {{ statusTitle }}
            </p>
            <div class="confirm-icon-container">
              <fa-icon
                icon="sync"
                class="confirm-icon fa-thin"
                :class="isCreateMode ? 'new' : 'open'"
              />
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
            <p v-if="!isCreateMode" class="contract-summary is-size-5 mb-3">
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
            v-if="isCreateMode"
            class="button custom-button-modal has-text-weight-medium"
            :disabled="isCreating"
            @click="createContract()"
          >
            <span v-if="isCreating" class="icon">
              <fa-icon icon="circle-notch" class="refreshing" />
            </span>
            <span>{{ $gettext("Create recurring payment") }}</span>
          </button>
          <button
            v-else-if="contractData.isCreator && contractData.state === 'open'"
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

      contractData() {
        if (this.isCreateMode) {
          const args = this.$modal.args.value[0]
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
        return this.isCreateMode
          ? this.$gettext("New recurring payment")
          : this.$gettext("Active recurring payment")
      },

      createdOnSentence() {
        const date = this.dateFormat(moment(this.contractData.date).toDate())
        return this.$gettext("Created on %{date}", { date })
      },

      contractGuidance() {
        if (this.isCreateMode) {
          return this.$gettext(
            "This operation will be automatically repeated at the selected frequency."
          )
        }
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
        return this.isCreateMode
          ? this.contractData.dateStart
          : this.contractData.nextExecutionDate
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
              "Failed to create recurring payment. Please try again or contact your administrator."
            ),
            err
          )
        }

        let senderWalletUri, receiverWalletUri
        if (args.requestMode) {
          senderWalletUri = args.selectedSender.userAccountInternalId
          receiverWalletUri = accountObj.internalId
        } else {
          senderWalletUri = accountObj.internalId
          receiverWalletUri = args.selectedRecipient.userAccountInternalId
        }

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
              "Failed to create recurring payment. Please try again or contact your administrator."
            ),
            err
          )
        }

        if (!contractIds || contractIds.length === 0) {
          this.isCreating = false
          throw new UIError(
            this.$gettext(
              "Failed to create recurring payment. Please try again or contact your administrator."
            ),
            new Error("No recurring payment ID returned")
          )
        }

        this.$msg.success(
          this.$gettext("Recurring payment created successfully")
        )

        if (args.refreshTransaction) args.refreshTransaction()
        if (args.refreshAccounts) args.refreshAccounts(true)

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
