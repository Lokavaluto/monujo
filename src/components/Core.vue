<template>
  <main class="main">
    <div class="container mt-5">
      <div class="columns is-tablet">
        <LeftCol />
        <RightCol />
      </div>
    </div>
    <div class="action-footer-container">
      <div class="container">
        <SendAskMoney />
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import LeftCol from "./core/LeftCol.vue";
import RightCol from "./core/RightCol.vue";
import SendAskMoney from "./sendAskMoney/SendAskMoney.vue";


@Options({
  name:"core",
  computed: {
    // We do not have to rely on an extra db call to get the
    // information, just use a computed property on the store state (or getter if needed)
    // and the vuejs magic happens !
    userProfile(): string {
      return this.$store.state.lokapi.userProfile
    }
  },
  props: {
    msg: String,
  },
  components: {
    LeftCol,
    RightCol,
    SendAskMoney,
  },
})
export default class Core extends Vue {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
