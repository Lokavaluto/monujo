<template>
  <!-- card vos cartes de paiement -->
  <div
    class="card custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between custom-card-padding mb-4"
  >
    <h2 class="custom-card-title">vos cartes de paiement</h2>
    <PayCard fullName="M. Ivan MANCEL" cardNumber="5441 xxxx xxx xx92" :isDefault="true"/>
    <hr />
    <PayCard fullName="M. Ivan MANCEL" cardNumber="5618 xxxx xxx xx12" :isDefault="false"/>
    <div class="is-flex is-justify-content-center mt-4">
      <button
        class="button custom-button custom-button-end-card is-rounded action"
      >
        Modifier
      </button>
    </div>
  </div>
  <!-- fin card vos cartes de paiement -->
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import PayCard from "./payCards/PayCard.vue"

  @Options({
    name:"PayCards",
    components: {
      PayCard
    }
  })
  export default class PayCards extends Vue {}
</script>