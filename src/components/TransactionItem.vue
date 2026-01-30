<template>
  <div
    class="p-3 shadow-bottom tx-item"
    :class="{
      topup: transaction.isTopUp,
      reconversion: transaction.isReconversion,
      paymentrequest: transaction.isPaymentRequest,
      refused: transaction.isPaymentRequest && transaction.state === 'refused',
      cm: transaction.tags && transaction.tags.includes('barter'),
      'unknown-currency':
        transaction.tags && transaction.tags.includes('unknown-currency'),
      'mode-small': mode === 'small',
      'cursor-pointer': mode !== 'small',
    }"
    @click="openConfirmationModal()"
  >
    <div class="amount-col is-flex-direction-column left">
      <h3 :class="amountClass">
        <div class="amount">
          <span class="amount">
            <template v-if="shouldPrefixDebitSign">-</template>
            {{ numericFormat(parseFloat(transaction.amount)) }}
          </span>
        </div>
        <span class="currency">{{ transaction.currency }}</span>
      </h3>

      <template v-if="mode !== 'small'">
        <h5
          v-if="
            (transaction.isTopUp || transaction.isReconversion) &&
            type !== 'topUpsPendingForApproval'
          "
          class="custom-card-type"
        >
          {{
            transaction.isTopUp ? $gettext("Top-up") : $gettext("Reconversion")
          }}
        </h5>
        <h4 v-else class="custom-card-related">
          {{ relatedLabel }}
        </h4>

        <h5
          v-if="
            !transaction.isTopUp &&
            !transaction.isReconversion &&
            transaction.description
          "
          class="has-text-grey-light transaction-desc"
        >
          {{ transaction.description }}
        </h5>
      </template>
    </div>
    <div
      v-if="
        mode !== 'small' &&
        $config.disableReconversionStatusDisplay !== true &&
        transaction.isReconversion &&
        Object.keys(reconversionStatusTranslations).indexOf(
          transaction.isReconversion.toString()
        ) !== -1
      "
      class="center"
    >
      <div class="status-indicator">
        <WorkflowIndicator
          format="small"
          :stages="reconversionStatuses"
          :current="reconversionStatus"
        />
      </div>
    </div>
    <div v-if="mode === 'small'" class="custom-card-related related small">
      {{ relatedLabel }}
    </div>
    <div
      v-if="transaction?.pending !== null || transaction?.date !== null"
      class="is-pulled-right right"
    >
      <h5 v-if="mode !== 'small'" class="custom-card-related has-text-right">
        {{ dateFormat(transaction.date) }}
      </h5>
      <h5 class="status card-paiement-defaut-carte has-text-right mt-1">
        <span v-if="transaction.date">
          {{ relativeDateFormat(transaction.date) }}
        </span>
        <span
          v-if="transaction.isPaymentRequest"
          class="payment-request-state"
          :class="transaction.state"
        >
          {{ paymentRequestStateLabel }}
        </span>
        <fa-icon
          v-else
          :class="{
            hide:
              transaction?.pending === true || transaction?.pending === null,
          }"
          icon="check"
          class="fa-thin ml-1"
        />
      </h5>
    </div>
  </div>
</template>

<script lang="ts">
  import { mapGetters } from "vuex"
  import { mapModuleState } from "@/utils/vuex"
  import { Options, Vue } from "vue-class-component"

  import WorkflowIndicator from "./WorkflowIndicator.vue"
  @Options({
    name: "TransactionItem",
    components: {
      WorkflowIndicator,
    },
    methods: {
      async openConfirmationModal() {
        if (this.mode === "small" || this.transaction?.isPaymentRequest) {
          return
        }
        if (!this.transaction) return

        const type =
          this.type ||
          (this.transaction.isReconversion
            ? "reconversion"
            : this.transaction.isTopUp
            ? "topup"
            : "transactionDetail")

        await this.$modal.open("ConfirmPaymentModal", {
          transaction: this.transaction,
          type: type,
          account: this.account,
          refreshTransaction: this.refreshTransaction,
          refreshAccounts: this.refreshAccounts,
        })
      },
      refreshTransaction() {
        this.$emit("refreshTransaction")
      },
      refreshAccounts() {
        this.$emit("refreshAccounts")
      },
    },
    props: {
      transaction: Object,
      mode: Object,
      account: Object,
      type: String,
    },
    created() {
      this.reconversionStatusTranslations = {
        true: this.$gettext("sent"),
        received: this.$gettext("received"),
        invoiced: this.$gettext("invoiced"),
        paid: this.$gettext("processed"),
      }
      this.reconversionStatuses = [true, "received", "invoiced", "paid"]
        .map((v) => this.reconversionStatusTranslations[v.toString()])
        .join("|")

      if (this.transaction.isReconversion) {
        const reconversionIdent = this.transaction.isReconversion.toString()
        const reconversionIdents = Object.keys(
          this.reconversionStatusTranslations
        )
        if (
          reconversionIdent &&
          !reconversionIdents.includes(reconversionIdent)
        ) {
          console.error(
            `Unexpected current step '${reconversionIdent}' is not in list of stages of workflow '${reconversionIdents}'.`
          )
        }
      }
    },
    computed: {
      ...mapGetters(["numericFormat", "relativeDateFormat", "dateFormat"]),
      ...mapModuleState("lokapi", ["userProfile"]),

      reconversionStatus() {
        return this.reconversionStatusTranslations[
          this.transaction?.isReconversion.toString()
        ]
      },

      amountClass() {
        const isRefusedPaymentRequest =
          this.transaction.isPaymentRequest &&
          this.transaction.state === "refused"
        if (isRefusedPaymentRequest) {
          return ["custom-card-related", "has-text-grey"]
        }

        const isOutgoingPaymentRequest =
          this.transaction.isPaymentRequest && this.transaction.isSender
        const hasNegativeAmount = this.transaction.amount
          .toString()
          .startsWith("-")

        return [
          "custom-card-related",
          isOutgoingPaymentRequest || hasNegativeAmount
            ? "has-text-danger"
            : "has-text-success",
        ]
      },

      shouldPrefixDebitSign() {
        return (
          this.transaction.isPaymentRequest &&
          this.transaction.isSender &&
          !this.transaction.amount.toString().startsWith("-")
        )
      },

      relatedLabel() {
        if (!this.transaction?.isPaymentRequest) {
          return this.transaction?.related
        }

        const direction = this.transaction.isSender
          ? this.$gettext("to")
          : this.$gettext("from")

        return direction + " " + this.transaction.related
      },

      paymentRequestStateLabel() {
        const stateTranslations: { [key: string]: string } = {
          open: this.$gettext("pending"),
          paid: this.$gettext("paid"),
          refused: this.$gettext("refused"),
          cancelled: this.$gettext("cancelled"),
        }
        return (
          stateTranslations[this.transaction?.state] || this.transaction?.state
        )
      },
    },
  })
  export default class TransactionItem extends Vue {}
</script>
<style lang="scss" scoped>
  @import "../assets/custom-variables.scss";
  h4.custom-card-related {
    min-height: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .transaction-desc {
    word-wrap: break-word;
    overflow-wrap: break-word;
    width: 100%;
  }
  .card-paiement-defaut-carte {
    font-style: normal;
    font-weight: normal;
    line-height: 16px;
    color: rgba(53, 53, 53, 0.64);
  }
  .custom-card-related {
    font-size: 1.2rem;
    line-height: 1.5rem;
    width: auto !important;
    white-space: nowrap;
  }
  .custom-card-type {
    font-size: 1.2rem;
    line-height: 1.5rem;
    font-style: italic;
    opacity: 0.8;
    width: auto !important;
  }
  .custom-line-separator {
    display: flex;
    height: 2px;
  }
  .status .fa-check {
    color: $color-2;
  }

  .mode-small .status {
    font-size: 0.8em;
    padding-bottom: 0.2em;
  }
  .shadow-bottom {
    box-shadow: 0 3px 6px -6px black;
  }
  .cursor-pointer {
    cursor: pointer;
  }

  .tx-item {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &.topup {
      background-color: $tx-topup-bg-color;
      margin-top: 3px;
      border-radius: 1em;
    }
    &.reconversion {
      background-color: $tx-reconversion-bg-color;
      margin-top: 3px;
      border-radius: 1em;
    }
    &.paymentrequest {
      background-color: $tx-topup-bg-color;
      margin-top: 3px;
      border-radius: 1em;

      &.refused {
        background-color: $tx-refused-bg-color;
        opacity: 0.65;
      }
    }

    .left {
      margin-right: auto;
      flex: 1 1 0;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-grow: 1;

      div.amount {
        display: inline;
        border-radius: 1em;
        padding: 0em 0.5em;
      }
      .currency {
        display: inline;
        padding-left: 0.2em;
      }
    }

    .center {
      flex-grow: 1;
      margin: 0 auto; /* centers it if present */
      position: absolute;
      left: 50%;
      transform: translateX(-50%);

      .status-indicator {
        line-height: 1.5em;
        text-align: center;
      }
    }

    .right {
      margin-left: auto;
      flex-grow: 0;
    }
  }

  h3.custom-card-related {
    text-align: left;
  }
  .tx-item.mode-small {
    padding: 0.2em !important;
  }

  .tx-item.cm .left div.amount {
    background-color: $barter-bg-color;
  }

  .tx-item.unknown-currency {
    background-image: linear-gradient(
      45deg,
      #ffe0e000 25%,
      #ff000010 25% 50%,
      #ffe0e000 50% 75%,
      #ff000010 75%
    );
    background-size: 24px 24px;
  }

  .tx-item.unknown-currency .currency {
    color: #e67e22;
    font-weight: bold;
  }

  .payment-request-state {
    margin-left: 0.5em;
    padding: 0.15rem 0.5rem;
    border-radius: 1rem;
    font-weight: 500;
    font-size: 0.85em;

    &.open {
      background-color: #fff3cd;
      color: #856404;
    }

    &.paid {
      background-color: #d4edda;
      color: #155724;
    }

    &.refused {
      background-color: #e2e3e5;
      color: #383d41;
    }

    &.cancelled {
      background-color: #e2e3e5;
      color: #383d41;
    }
  }

  div.related.small {
    text-align: left;
    padding-left: 1em;
    flex: 2;
  }
  .tx-item div.amount-col {
    flex: 0 1 auto;
  }
</style>
