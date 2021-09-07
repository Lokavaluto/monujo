<template>
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
import { useStore } from 'vuex'
import {inject , defineComponent} from 'vue'
import TransactionSubCard from "./TransactionSubCard.vue"
export default  defineComponent({

    name:"AllTrs",
    components: {
        TransactionSubCard
    },
    setup(): any{
        const lokapi: any = inject("$lokapi");
        const store : any = useStore()
        return {
            lokapi: lokapi,
            store: store
        }
    },
    computed: {
        getTrs(): number {
            return this.store.getters.getTransactions()
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
});
</script>