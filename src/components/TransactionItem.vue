<template>
  <div
    class="p-3 shadow-bottom tx-item"
    :class="{
      topup: transaction.isTopUp,
      reconversion: transaction.isReconversion,
      cm: transaction.tags && transaction.tags.includes('barter'),
      'mode-small': mode === 'small',
      'cursor-pointer': mode !== 'small',
    }"
  >
    <div class="amount-col is-flex-direction-column left">
      <h3
        :class="[
          transaction.amount.toString().charAt(0) == '-'
            ? 'custom-card-related has-text-danger'
            : 'custom-card-related has-text-success',
        ]"
      >
        <div class="amount">
          <span class="amount">
            {{ numericFormat(parseFloat(transaction.amount)) }}
          </span>
        </div>
        <div class="currency">{{ transaction.currency }}</div>
      </h3>

      <template v-if="mode !== 'small'">
        <h5
          v-if="transaction.isTopUp || transaction.isReconversion"
          class="custom-card-type"
        >
          {{
            transaction.isTopUp ? $gettext("Top-up") : $gettext("Reconversion")
          }}
        </h5>
        <h4 v-else class="custom-card-related">
          {{ transaction.related }}
        </h4>

        <h5
          v-if="!transaction.isTopUp && !transaction.isReconversion"
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
      {{ transaction.related }}
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
        <fa-icon
          :class="{
            hide:
              transaction?.pending === true || transaction?.pending === null,
          }"
          icon="check"
          class="fa-thin"
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
    methods: {},
    props: {
      transaction: Object,
      mode: Object,
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

  div.related.small {
    text-align: left;
    padding-left: 1em;
    flex: 2;
  }
  .tx-item div.amount-col {
    flex: 0 1 auto;
  }
</style>
