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
import { Options, Vue } from 'vue-class-component';

@Options({
    name:"GlobalBal",
    methods : {
      modal() {
        this.$store.state.showCredit = true
      }
    },
    computed: {
      getBal(): string {
         return this.$store.getters.getBal()
      },
      getCurr(): string {
         return this.$store.getters.getCurr()
      }
    },
})
export default class GlobalBal extends Vue {}
</script>