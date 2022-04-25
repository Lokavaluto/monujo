<template>
  <div
    class="is-flex is-justify-content-space-between is-align-items-center pl-3 pr-3 pb-0"
  >
    <div class="is-flex-direction-column">
      <h3 class="custom-card-content-2">
        {{ fullName }}
      </h3>
      <h4>{{ cardNumber }}</h4>
    </div>
    <h4 class="card-paiement-defaut-carte" v-if="isDefault">
      carte par defaut
    </h4>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  @Options({
    name: "PayCard",
    props: {
      fullName: String,
      cardNumber: String,
      isDefault: Boolean,
    },
  })
  export default class PayCard extends Vue {}
</script>
