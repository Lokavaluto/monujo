<template>
     <!-- card solde globale -->
          <div
            class="card custom-card is-flex is-align-items-center is-justify-content-space-between custom-card-padding mb-4"
          >
            <div class="left-card">
              <h2 class="custom-card-title">Solde global</h2>
              <h3 class="custom-card-content">{{infoBal}} U</h3>
            </div>
            <div class="right-card">
              <button v-on:click="greet" class="button custom-button is-rounded action">
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
       infoBal(): number {
         return store.state.bal
       }
  
    },
    methods: {
    greet: function () :void {
        store.dispatch('increment')
        console.log(store.state.bal)
      }
    }
}
</script>