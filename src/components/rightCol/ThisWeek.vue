<template>
  <div class="transactions-loader">
    <loading  v-model:active="isLoadingTransactionsBatch"
              :can-cancel="false"
              :is-full-page="false"/>
  </div>
  <div v-if="!isLoadingTransactionsBatch">
    <div v-if="getTrs?.length === 0" class="custom-card-title mb-3" > Aucune transaction dans votre historique</div>
    <div v-else >
      <h2  class="custom-card-sub-title">Transactions</h2>
      <TransactionSubCard v-for="transaction in getTrs"
                          :key="transaction" :amount="transaction.amount"
                          :symbol="transaction.currency"
                          :desc="transaction.description"
                          :date="dateFormated(transaction.date)"
                          :unformatedDate="transaction.date"
                          :name="transaction.relatedUser ? transaction.relatedUser.display : transaction.related.type.name "
                          picto="QR"/>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import TransactionSubCard from "./TransactionSubCard.vue"
  import Loading from 'vue-loading-overlay';
  import 'vue-loading-overlay/dist/vue-loading.css';

  @Options({
    name:"ThisWeek",
    components: {
      TransactionSubCard,
      Loading: Loading
    },
    data() {
      return {}
    },
    computed: {
      getTrs(): any {
        return this.$store.state.lokapi.thisWeektransactions
      },
      isLoadingTransactionsBatch(): boolean {
        return this.$store.state.lokapi.transactionsBatchLoading
      }
    },
   
    methods : { 
      dateFormated(badDate:string) :string {
        var date = new Date(badDate);
        var options = {weekday: "long", day: "numeric", month: "numeric"};
        const DateFr = new Intl.DateTimeFormat('fr-FR', options).format(date)
        return DateFr
      }
    },
  })
  export default class ThisWeek extends Vue {}
</script>