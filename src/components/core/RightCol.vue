<template>
  <!-- colonne de droite -->
  <div class="right-column column is-half">
    <div
      class="card custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between custom-card-padding mb-4"
    >
      <OperationsSelector />
      <ThisWeek />
      <!-- <LastWeek /> -->
      <MyModal v-if="showModal" @close="showModal = false">
        <template v-slot:header>
          <h3>custom HEAD</h3>
        </template>
      </MyModal>
      <div class="is-flex is-justify-content-center mt-4">
        <button
          @click="showModal = true"
          class="button custom-button custom-button-end-card is-rounded action mt-6"
        >
          Voir tout
        </button>
      </div>
    </div>
  </div>
  <!-- fin colonne de droite -->
</template>

<script lang="ts">
import OperationsSelector from "../rightCol/OperationsSelector.vue";
import ThisWeek from "../rightCol/ThisWeek.vue";
// import LastWeek from "../rightCol/LastWeek.vue";
import MyModal from "../modal/MyModal.vue";
import {defineComponent, inject} from "vue"

export default defineComponent({
  name: "RightCol",
  components: {
    OperationsSelector,
    ThisWeek,
    // LastWeek,
    MyModal,
  },
  data(): { showModal: boolean , lokapi:any} {
    const lokapi: any = inject("$lokapi");
    return {
      showModal: false,
      lokapi:lokapi
    };
  },
});
</script>
