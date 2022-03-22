<template>
  <h2 class="custom-card-title">Opérations</h2>
  <loading  v-model:active="isLoadingTransactions"
            :can-cancel="false"
            :is-full-page="false"/>
  <div v-if="!isLoadingTransactions">
    <p v-if="getTrs?.length === 0" class="notification is-default"> Aucune opération dans votre historique</p>
    <div v-else >
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
      isLoadingTransactions(): boolean {
        return this.$store.state.lokapi.transactionsLoading
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