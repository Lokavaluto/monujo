<template>
    <!-- début card semaine dernière -->
    <h2 class="custom-card-sub-title mt-6">La semaine dernière</h2>
    <TransactionSubCard picto="QR"/>
    <hr />
    <TransactionSubCard picto="Transaction"/>
     <hr />
    <TransactionSubCard picto="Transaction"/>
     <hr />

    <!-- fin card semaine dernière -->
</template>

<script lang="ts">
import TransactionSubCard from "./TransactionSubCard.vue"
import {defineComponent} from "vue"
import {useStore} from "vuex"
export default defineComponent({
    name:"LastWeek.vue",
    data() {
        const store: any = useStore()
        return {
            store
        }
    },
    components: {
        TransactionSubCard
    }
})
</script>