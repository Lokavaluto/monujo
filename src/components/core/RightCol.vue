<template>
  <div class="column">
    <div
      class="card custom-card custom-card-padding"
    >
      <div class="is-flex-direction-column is-align-items-center is-justify-content-space-between">
        <OperationsSelector />
        <ThisWeek />
      </div>
      <div v-show="showModal" class="modal-mask">
        <div class="overlay" @click="showModal = false"></div>
        <div class="modal-wrapper">
          <div class="modal-container">
            <div class="modal-body">
              <div
                class="card custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between custom-card-padding mb-4"
              >
                <AllTrs />
              </div>
            </div>
          </div>
        </div>
      </div>

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
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import OperationsSelector from "../rightCol/OperationsSelector.vue";
  import ThisWeek from "../rightCol/ThisWeek.vue";
  import AllTrs from "../rightCol/AllTrs.vue";

  @Options({
    name: "RightCol",
    components: {
      OperationsSelector,
      ThisWeek,
      AllTrs,
    },

    data() {
      return {
        showModal: false
      };
    },
  })
  export default class RightCol extends Vue {}
</script>
