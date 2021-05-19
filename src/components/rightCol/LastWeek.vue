<template>
    <!-- début card semaine dernière -->
    <h2 class="custom-card-sub-title mt-6">La semaine dernière</h2>
    <TransactionSubCard picto="QR"/>
    <hr />
    <TransactionSubCard picto="Transaction"/>
    <div class="is-flex is-justify-content-center mt-4">
      <button
        class="button custom-button custom-button-end-card is-rounded action mt-6"
      >
        Voir tout
      </button>
    </div>
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