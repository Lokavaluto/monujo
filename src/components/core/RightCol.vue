<template>
  <!-- colonne de droite -->
  <div class="right-column column is-half">
    <div
      class="card custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between custom-card-padding mb-4"
    >
      <OperationsSelector />
      <ThisWeek />
      <MyModal :first="true" v-if="showModal" @close="showModal = false">
        <template v-slot:header>
         <div></div>
        </template>
        <template v-slot:body>
          <div
            class="card custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between custom-card-padding mb-4"
          >
           <!-- <h2 class="custom-card-sub-title-fixed-top">La semaine dernière</h2> -->
            <!-- <LastWeek /> -->
            <AllTrs/>
          </div>
        </template>
        <template v-slot:footer>
          <div></div>
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
//import LastWeek from "../rightCol/LastWeek.vue";
import AllTrs from "../rightCol/AllTrs.vue";
import MyModal from "../modal/MyModal.vue";
import { defineComponent } from "vue";
import {useStore} from "vuex"

export default defineComponent({
  name: "RightCol",
  components: {
    OperationsSelector,
    ThisWeek,
    //LastWeek,
    AllTrs,
    MyModal,
  },

  setup(): {store:any} {
        const store : any = useStore()
        console.log(store.state.lokapi.transactions)
        return {
            store: store
        }
    },

  data(): { showModal: boolean} {
    return {
      showModal: false
    };
  },
  computed: {
    opSel(): number {
      return this.store.state.OperationsSelector
    },
  },
});
</script>
