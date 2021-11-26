<template>
     <!-- card solde globale -->
          <div
            class="card custom-card custom-card-padding"
          >
            <h2 class="custom-card-title">Solde global</h2>
            <div class="is-flex is-justify-content-space-between">
              <div class="has-text-left pl-5">
                <div class="custom-card-content is-size-3">{{getBal}} {{getCurr}}</div>
              </div>
              <div class="has-text-right">
                <button @click="modal()" class="button custom-button has-text-weight-medium custom-inverted action">
                  Créditer
                </button>
              </div>
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