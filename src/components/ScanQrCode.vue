<template>
  <div id="back-button">
    <button
      class="delete is-large"
      aria-label="close"
      @click="close()"
    ></button>
  </div>
  <div id="scan-rectangle">
    <svg>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        style="fill: transparent; stroke-width: 2; stroke: rgb(255, 255, 255)"
      />
    </svg>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  @Options({
    name: "ScanQrCode",
    methods: {
      async close() {
        await this.$qrCode.stopScan()
      },
    },
  })
  export default class ScanQrCode extends Vue {}
</script>
<style lang="scss" scoped>
  #scan-rectangle {
    width: fit-content;
    height: fit-content;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 20em;
    height: 20em;
    @media screen and (min-width: 768px) {
      width: 50%;
      height: 50vw;
      max-height: 90vh;
    }
    margin: auto;
    svg {
      width: 100%;
      height: 100%;
    }
    z-index: 1;
  }
  #back-button {
    position: absolute;
    top: env(safe-area-inset-top, 0);
    right: 0;
    margin: 0.5em;
    border-radius: 5px;
    border: 0.1em solid white;
    z-index: 1;
  }
</style>
