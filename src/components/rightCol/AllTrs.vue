<template>
    <div
      class="accounts card custom-card custom-card-padding"
    >
        <h2 class="custom-card-title">Operations</h2>
        <div class="notification p-6" v-if="isLoadingTransactions">
            <loading v-model:active="isLoadingTransactions"
                :can-cancel="false"
                :is-full-page="false"
            />
        </div>

        <TransactionSubCard v-for="transaction in thisweekTransactions"
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
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

@Options({

    name:"AllTrs",
    components: {
        TransactionSubCard,
        Loading
    },
    computed: {
        thisweekTransactions(): number {
            return this.$store.state.lokapi.thisWeektransactions
        },
        upcomingTransactions(): number {
            return this.$store.state.lokapi.transactions
        },
        isLoadingTransactions():boolean {
            return this.$store.state.lokapi.transactionsStatus === 'loading'
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