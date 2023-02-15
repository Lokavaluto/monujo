<template>
  <div
    class="pb-3 pt-3"
    :class="{ 'is-pending-transaction': transaction.pending }"
  >
    <div class="is-pulled-right">
      <h5 class="custom-card-destinataire has-text-right">
        {{ dateFormat(transaction.date) }}
      </h5>
      <h5 class="card-paiement-defaut-carte has-text-right mt-1">
        {{ relativeDateFormat(transaction.date) }}
      </h5>
    </div>
    <div class="is-flex-direction-column">
      <h3
        :class="[
          transaction.amount.charAt(0) == '-'
            ? 'custom-card-destinataire has-text-danger'
            : 'custom-card-destinataire has-text-success',
        ]"
      >
        {{ numericFormat(parseFloat(transaction.amount)) }}
        {{ transaction.currency }}
        <span v-if="transaction.pending" class="transaction-status">
          ({{ $gettext("pending transaction") }})
        </span>
      </h3>
      <h4 class="custom-card-destinataire">{{ transaction.related }}</h4>
      <h5 class="has-text-grey-light transaction-desc">
        {{ transaction.description }}
      </h5>
    </div>
  </div>
  <span class="custom-line-separator has-background-white-ter mb-2 mt-1"></span>
</template>

<script lang="ts">
  import { mapGetters } from "vuex"
  import { Options, Vue } from "vue-class-component"

  @Options({
    name: "TransactionItem",
    components: {},
    methods: {},
    props: {
      transaction: Object,
    },
    computed: {
      ...mapGetters(["numericFormat", "relativeDateFormat", "dateFormat"]),
    },
  })
  export default class TransactionItem extends Vue {}
</script>
<style lang="scss" scoped>
  @import "../assets/custom-variables.scss";
  h4.custom-card-destinataire {
    white-space: nowrap;
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
  .custom-card-destinataire {
    font-size: 1.2rem;
    line-height: 1.5rem;
    width: auto !important;
  }
  .custom-line-separator {
    display: flex;
    height: 2px;
  }
  .is-pending-transaction {
    opacity: 50%;
  }
  .transaction-status {
    width: fit-content;
    color: $inner-card-text-color-backend;
    font-style: italic;
    font-size: small;
  }
</style>
