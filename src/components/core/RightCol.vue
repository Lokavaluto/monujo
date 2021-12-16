<template>
    <div class="column">
        <AllTrs/>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import OperationsSelector from "../rightCol/OperationsSelector.vue";
import ThisWeek from "../rightCol/ThisWeek.vue";
//import LastWeek from "../rightCol/LastWeek.vue";
import AllTrs from "../rightCol/AllTrs.vue";
import MyModal from "../modal/MyModal.vue";

@Options({
  name: "RightCol",
  components: {
    AllTrs
  },

  data() {
    return {
      showModal: false
    };
  },
  computed: {
    opSel(): number {
      return this.$store.state.OperationsSelector
    },
  },
})
export default class RightCol extends Vue {}
</script>
