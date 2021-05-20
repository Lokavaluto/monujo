<template>
  <!-- colonne de gauche -->
        <div class="left-column column is-half">
          <GlobalBal/>
          <YourAccs/>
          <PayCards/>
        </div>
        <!-- fin colonne de gauche -->
</template>

<script lang="ts">
import GlobalBal from "../leftCol/GlobalBal.vue"
import YourAccs from "../leftCol/YourAccs.vue"
import PayCards from "../leftCol/PayCards.vue"
export default {
  name: "LeftCol",
  components: {
    GlobalBal,
    YourAccs,
    PayCards
  }
};
</script>