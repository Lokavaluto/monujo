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
              <button @click="modal()" class="button custom-button is-rounded action">
                Créditer
              </button>
            </div>
          </div>
          <!-- fin card solde globale -->
</template>

<script lang="ts">
import {defineComponent} from "vue"
import { useStore } from 'vuex'
export default defineComponent({
    setup () {
      const store = useStore()
      return {store}
    },
    name:"GlobalBal",
    methods : {
      modal() {
        this.store.state.showCredit = true
      }
    },
    computed: {
      getBal(): string {
         return this.store.getters.getBal()
      },
      getCurr(): string {
         return this.store.getters.getCurr()
      }
    },
})
</script>