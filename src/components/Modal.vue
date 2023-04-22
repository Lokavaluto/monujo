<template>
  <component :is="modalName" />
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import MoneyTransferModal from "./MoneyTransferModal.vue"
  import MoneyCreditModal from "./MoneyCreditModal.vue"
  import AboutModal from "./AboutModal.vue"

  @Options({
    name: "Modal",
    components: {
      MoneyTransferModal,
      MoneyCreditModal,
      AboutModal,
    },
    data() {
      return {
        callbacks: {},
        modalName: "",
      }
    },
    created() {
      this.$modal.register({
        show: (label: string) =>
          new Promise((resolve, reject) => {
            this.modalName = label
            document.body.classList.add("is-clipped")
            this.callbacks = { resolve, reject }
          }),
        hide: () => {
          this.modalName = ""
          document.body.classList.remove("is-clipped")
          this.callbacks.resolve()
        },
      })
    },
    methods: {},
  })
  export default class Modal extends Vue {}
</script>
<style lang="scss" scoped>
  .modal-card {
    position: relative;
    top: -5vh;
  }
</style>
