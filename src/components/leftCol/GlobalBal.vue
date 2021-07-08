<template>
     <!-- card solde globale -->
          <div
            class="card custom-card is-flex is-align-items-center is-justify-content-space-between custom-card-padding mb-4"
          >
            <div class="left-card">
              <h2 class="custom-card-title">Solde global</h2>
              <h3 class="custom-card-content">{{getBal}} {{getCurr}}</h3>
            </div>
            <div class="right-card">
              <button class="button custom-button is-rounded action">
                Créditer
              </button>
            </div>
          </div>
          <!-- fin card solde globale -->
</template>

<script lang="ts">
import store from "../../store"
export default {
    name:"GlobalBal",
    computed: {
      getBal(): number {
         return store.state.bal
      },
      getCurr(): string {
         return store.state.curr
      }
    },
}
</script>