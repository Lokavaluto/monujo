<template>
  <!-- colonne de gauche -->
        <div class="column">
          <YourAccs/>
          <!-- <PayCards/> -->
        </div>
        <!-- fin colonne de gauche -->
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import YourAccs from "../leftCol/YourAccs.vue";
//import PayCards from "../leftCol/PayCards.vue"

@Options({
  name: "LeftCol",
  components: {
    YourAccs,
    // PayCards
  }
})
export default class LeftCol extends Vue {}
</script>