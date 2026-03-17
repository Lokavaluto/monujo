<template>
  <section class="modal-card-body">
    <div class="info">
      <div class="info-row">
        <span class="label">{{ $gettext("Backend:") }}</span
        ><span class="value">{{ recipient.internalId.split(":")[0] }}</span>
      </div>
      <div class="info-row">
        <span class="label">{{ $gettext("Administrative backend id:") }}</span
        ><span class="value">{{ recipient.id }}</span>
      </div>
      <div class="info-row">
        <span class="label">{{ $gettext("Wallet URI:") }}</span
        ><span class="value">{{ recipient.internalId }}</span>
      </div>
    </div>
    <div class="info-row">
      <span class="label">{{ $gettext("Wallet QR Code:") }}</span>
    </div>
    <div class="qrcode-container">
      <QrCodeVue
        render-as="svg"
        :value="
          JSON.stringify({
            rp: recipient.id,
            rpb: recipient.internalId,
          })
        "
      />
    </div>
  </section>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import QrCodeVue from "qrcode.vue"
  @Options({
    name: "RecipientTechnicalDetails",
    components: {
      QrCodeVue,
    },
    props: {
      recipient: Object,
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

  .info-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 0.5rem;
  }

  .value {
    margin-left: 0.25rem;
    flex: 1;
    min-width: 0;
  }

  .label {
    font-weight: bold;
  }

  .qrcode-container {
    width: 100%;

    :deep(svg) {
      width: 100%;
      height: auto;
    }
  }
</style>
