<template>
  <main class="main">
    <div class="container mt-5">
      <div>Cyclos!!!</div>
      <div>Recipient: {{ recipient }}</div>
      <div>administrativeBackendId: {{ administrativeBackendId }}</div>
      <div>financialBackendId: {{ financialBackendId }}</div>
    </div>
  </main>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { UIError } from "@/exception"
  import { useRoute } from "vue-router"
  @Options({
    name: "AdminBackendCyclos",
    data() {
      return {
        recipient: "",
      }
    },
    props: {
      administrativeBackendId: String,
      financialBackendId: String,
    },
    mounted() {},
    computed: {},
    methods: {},
  })
  export default class AdminBackendCyclos extends Vue {}
</script>
<style lang="scss" scoped></style>
