<template>
  <!-- colonne de droite -->
  <div class="column">
    <div
      class="card custom-card custom-card-padding"
    >
      <div class="is-flex-direction-column is-align-items-center is-justify-content-space-between">
        <OperationsSelector />
        <ThisWeek />
      </div>
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
      <div class="has-text-centered mt-5">
        <button
          @click="showModal = true"
          class="button custom-button custom-inverted"
        >
          Voir tout
        </button>
      </div>
    </div>
  </div>
  <!-- fin colonne de droite -->
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import OperationsSelector from "../rightCol/OperationsSelector.vue";
  import ThisWeek from "../rightCol/ThisWeek.vue";
  //import LastWeek from "../rightCol/LastWeek.vue";
  import AllTrs from "../rightCol/AllTrs.vue";
  import MyModal from "../modal/MyModal.vue";

  @Options({
    name: "RightCol",
    components: {
      OperationsSelector,
      ThisWeek,
      //LastWeek,
      AllTrs,
      MyModal,
    },

    data() {
      return {
        showModal: false
      };
    },
    computed: {
      opSel(): number {
        return this.$store.state.OperationsSelector
      },
    },
  })
  export default class RightCol extends Vue {}
</script>
