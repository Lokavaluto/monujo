<template>
  <iframe
    id="iframe"
    v-if="mapUrl"
    width="100%"
    height="100%"
    :src="mapUrl"
    frameborder="0"
    marginheight="0"
    marginwidth="0"
    allow="fullscreen"
    style="
      overflow: hidden;
      overflow-x: hidden;
      overflow-y: hidden;
      height: 100%;
      width: 100%;
      position: absolute;
      top: 0px;
      left: 0px;
      right: 0px;
      bottom: 0px;
    "
  ></iframe>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  @Options({
    name: "Carto",
    data() {
      return {
        mapUrl: "",
      }
    },
    mounted() {
      this.mapUrl = this.$config.mapUrl
      if (!this.mapUrl) {
        console.error(
          "This view require a valid `mapUrl` configured in `config.json`"
        )
      }
    },
  })
  export default class Carto extends Vue {}
</script>
