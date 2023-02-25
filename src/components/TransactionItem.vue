<template>
  <div class="pb-3 pt-3">
    <div class="is-pulled-right">
      <h5 class="custom-card-destinataire has-text-right">
        {{ dateFormat(transaction.date) }}
      </h5>
      <h5 class="status card-paiement-defaut-carte has-text-right mt-1">
        {{ relativeDateFormat(transaction.date) }}
        <fa-icon
          :class="{
            hide: transaction.pending,
          }"
          icon="check"
          class="fa-thin"
        />
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
  .hide {
    visibility: hidden;
  }
  .status .fa-check {
    color: $color-2;
  }
</style>
