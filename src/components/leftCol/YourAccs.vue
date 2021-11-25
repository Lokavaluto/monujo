<template>
    <!-- card vos comptes -->
          <div
            class="card custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between custom-card-padding"
          >
            <h2 class="custom-card-title">vos comptes</h2>
            <Acc :bal="getBal" :curr="getCurr">
              <template v-slot:name>
                Compte<br/> principal
              </template>
            </Acc>
            <!-- <Acc :bal="infoBal">
              <template v-slot:name>
                Crédit de<br/> confiance
              </template>
            </Acc> -->
          </div>
          <!-- fin card vos comptes -->
</template>

<script lang="ts">
import Acc from "./yourAccs/Acc.vue"
import store from "../../store"
export default {
    name:"YourAccs",
    components: {
        Acc
    },
    computed: {
      getBal(): number {
         return store.getters.getBal()
      },
      getCurr(): string {
         return store.getters.getCurr()
      }
    }
}
</script>