<template>
  <div class="is-flex-direction-column mb-3">
    <div class="is-flex">
      <!-- <img :src="'/src/assets/media/' + { cardtype }" alt="credit_card" /> -->
      <figure class="image is-24x24 is-flex is-align-items-center">
        <img :src="require(`@/assets/media/${cardtype}`)" />
      </figure>
      <h3 class="custom-card-content-2">
        {{ fullName }}
      </h3>
    </div>
    <h4 class="mt-1">{{ cardNumber }}</h4>
  </div>
</template>
<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  name: "AddPayCard",
  props: {
    fullName: String,
    cardNumber: String,
    cardtype: String,
  },
  data() {
    return {
      mastercard: "/src/assets/media/mastercard.svg",
      visa: "/src/assets/media/visa.svg",
      cb: "/src/assets/media/CB.svg",
    };
  },
})
export default class AddPayCard extends Vue {}
</script>
