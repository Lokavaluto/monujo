<template>
  <h2 class="custom-card-sub-title has-text-centered">Toutes les opérations</h2>
  <div>
    <TransactionSubCard v-for="transaction in getTrs"
                        :key="transaction" :amount="transaction.amount" 
                        :symbol="transaction.currency"
                        :desc="transaction.description"
                        :date="dateFormated(transaction.date)"
                        :unformatedDate="transaction.date"
                        :name="transaction.relatedUser ? transaction.relatedUser.display : transaction.related.type.name "
                        picto="QR"/>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import TransactionSubCard from "./TransactionSubCard.vue";

  @Options({

    name:"AllTrs",
    components: {
      TransactionSubCard
    },
    computed: {
      getTrs(): number {
        return this.$store.state.lokapi.transactions
      }
    },
    methods : { 
      dateFormated(badDate:string) :string {
        var date = new Date(badDate);
        var options = {weekday: "long", day: "numeric", month: "numeric"};
        // eslint-disable-next-line
            //@ts-ignore-next-line
        const DateFr = new Intl.DateTimeFormat('fr-FR', options).format(date)
        return DateFr
      }
    },
  })
  export default class AllTrs extends Vue {}
</script>