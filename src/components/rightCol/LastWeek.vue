<template>
    <!-- début card semaine dernière -->
    <h2 class="custom-card-sub-title mt-6">La semaine dernière</h2>
    <TransactionSubCard picto="QR"/>
    <hr />
    <TransactionSubCard picto="Transaction"/>
    <!-- fin card semaine dernière -->
</template>

<script>
import TransactionSubCard from "./TransactionSubCard.vue"
export default {
    name:"LastWeek.vue",
     components: {
        TransactionSubCard
    }
}
</script>