<template>
  <section class="modal-card-body">
    <div class="info">
      <div class="title-card">
        {{ $gettext("User account technical infos") }}
      </div>
      <div class="">{{ $gettext("Backend:") }} Comchain</div>
      <div class="">
        {{ $gettext("Administrative backend id:") }}
        {{ administrativeBackendId }}
      </div>
      <div class="wallet-uri">
        {{ $gettext("Wallet URI:") }} {{ walletUri }}
      </div>
    </div>
  </section>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  @Options({
    name: "RecipientTechnicalDetails",
    components: {},
    props: {
      administrativeBackendId: String,
      walletUri: String,
    },
  })
  export default class RecipientTechnicalDetails extends Vue {}
</script>
<style lang="scss" scoped>
  @import "@/assets/custom-variables";

  .info {
    min-width: 0;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .title-card {
    font-weight: bold;
  }
</style>
