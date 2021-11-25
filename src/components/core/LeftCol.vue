<template>
  <!-- colonne de gauche -->
        <div class="column">
          <GlobalBal class="mb-4"/>
          <YourAccs/>
          <!-- <PayCards/> -->
        </div>
        <!-- fin colonne de gauche -->
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import GlobalBal from "../leftCol/GlobalBal.vue";
import YourAccs from "../leftCol/YourAccs.vue";
//import PayCards from "../leftCol/PayCards.vue"

@Options({
  name: "LeftCol",
  components: {
    GlobalBal,
    YourAccs,
    // PayCards
  }
})
export default class LeftCol extends Vue {}
</script>