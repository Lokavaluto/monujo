<template>
            <!-- colonne de droite -->
        <div class="right-column column is-half">
          <div
            class="card custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between custom-card-padding mb-4"
          >
          <OperationsSelector/>
          <ThisWeek/>
          <LastWeek/>
          </div>
        </div>
        <!-- fin colonne de droite -->
</template>

<script lang="ts">
import OperationsSelector from "../rightCol/OperationsSelector.vue"
import ThisWeek from "../rightCol/ThisWeek.vue"
import LastWeek from "../rightCol/LastWeek.vue"
export default {
    name:"RightCol",
    components: {
      OperationsSelector,
      ThisWeek,
      LastWeek
    }
}
</script>