<template>
    <!-- card vos comptes -->
    <div
      class="card custom-card custom-card-padding"
    >
      <h2 class="custom-card-title">vos comptes</h2>
      <Acc :bal="getBal" :curr="getCurr">
        <template v-slot:name>
          Compte principal
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