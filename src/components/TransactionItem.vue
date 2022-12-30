<template>
  <div class="pb-3 pt-3">
    <div class="is-pulled-right">
      <h5 class="custom-card-destinataire has-text-right">{{ date }}</h5>
      <h5 class="card-paiement-defaut-carte has-text-right mt-1">
        {{ relativeDateFormat(unformatedDate) }}
      </h5>
    </div>
    <div class="is-flex-direction-column">
      <h3
        :class="[
          amount.charAt(0) == '-'
            ? 'custom-card-destinataire has-text-danger'
            : 'custom-card-destinataire has-text-success',
        ]"
      >
        {{ numericFormat(parseFloat(amount)) }}
        {{ symbol }}
      </h3>
      <h4 class="custom-card-destinataire">{{ name }}</h4>
      <h5 class="has-text-grey-light transaction-desc">
        {{ desc }}
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
      picto: String,
      amount: String,
      symbol: String,
      desc: String,
      date: String,
      name: String,
      unformatedDate: Date,
    },
    computed: {
      ...mapGetters(["numericFormat", "relativeDateFormat"]),
    },
  })
  export default class TransactionItem extends Vue {}
</script>
<style lang="scss" scoped>
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
</style>
