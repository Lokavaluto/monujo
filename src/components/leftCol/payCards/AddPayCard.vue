<template>
  <div class="is-flex-direction-column mb-3">
    <div class="is-flex">
      <!-- <img :src="'/src/assets/media/' + { cardtype }" alt="credit_card" /> -->
      <img :src="require(`@/assets/media/${cardtype}`)">
      <h3 class="custom-card-content-2">
        {{ fullName }}
      </h3>
    </div>
    <h4 class="mt-1">{{ cardNumber }}</h4>
  </div>
</template>
<script lang="ts">
export default {
  name: "AddPayCard",
  props: {
    fullName: String,
    cardNumber: String,
    cardtype: String,
  },
  data () {
    return {
      mastercard: '/src/assets/media/mastercard.svg',
      visa: '/src/assets/media/visa.svg',
      cb: '/src/assets/media/CB.svg'
    }
  }
};
</script>
