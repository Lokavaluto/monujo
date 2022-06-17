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
  import { Options, Vue } from "vue-class-component"
  import LeftCol from "./core/LeftCol.vue"
  import RightCol from "./core/RightCol.vue"
  import SendAskMoney from "./sendAskMoney/SendAskMoney.vue"

  @Options({
    name: "core",
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
