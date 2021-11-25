<template>
    <!-- card vos comptes -->
          <div
            class="card custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between custom-card-padding mb-4"
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
import { Options, Vue } from 'vue-class-component';
import Acc from "./yourAccs/Acc.vue"

@Options({
    name:"YourAccs",
    components: {
        Acc
    },
    computed: {
      getBal(): number {
         return this.$store.getters.getBal()
      },
      getCurr(): string {
         return this.$store.getters.getCurr()
      }
    }
})
export default class YourAccs extends Vue {}
</script>