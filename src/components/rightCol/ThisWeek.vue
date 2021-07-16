<template>
     <!-- card cette semaine  -->
            <h2 class="custom-card-sub-title">Cette semaine</h2>
            <TransactionSubCard v-for="transaction in transactions"
             :key="transaction.jsonData" :amount="transaction.jsonData.amount" 
             :symbol="transaction.jsonData.currency"
             :desc="transaction.jsonData.description"
             :date="dateFormated(transaction.jsonData.date)"
             :name="transaction.jsonData.relatedUser.display"
             picto="QR"/>
            <!-- fin card cette semaine -->
</template>

<script lang="ts">
import TransactionSubCard from "./TransactionSubCard.vue"
import {defineComponent} from "vue"
import {useStore} from "vuex"
export default defineComponent({
    name:"ThisWeek",
    components: {
        TransactionSubCard
    },
    data() :{store:any, transactions:Array<any>} {
        const store: any = useStore()
        return {
            store:store,
            transactions:store.state.lokapi.thisWeektransactions
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
    // mounted: async function () {
    //     let transactions = this.store.getters.getTransactions()
    //     var maxTransactions = 5
    //     for (let el of transactions) {
    //         if (el.jsonData.relatedUser) {
    //             this.transactions.push(el)
    //             if (maxTransactions === 1) {
    //                 break;
    //             }
    //             maxTransactions -= 1
    //         }
    //     }
    //     console.log(this.transactions
    // }
})
</script>