<template>
     <!-- card cette semaine  -->
            <h2 class="custom-card-sub-title">Cette semaine</h2>
            <TransactionSubCard picto="QR"/>
            <!-- fin card cette semaine -->
</template>

<script>
import TransactionSubCard from "./TransactionSubCard.vue"
export default {
    name:"ThisWeek",
    components: {
        TransactionSubCard
    }
}
</script>