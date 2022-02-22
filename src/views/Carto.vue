<template>
  <iframe
    v-if="mapUrl"
    width="100%"
    height="100%"
    :src="mapUrl"
    frameborder="0"
    marginheight="0"
    marginwidth="0"
    allow="fullscreen"
    id="map"
  ></iframe>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component";

  @Options({
    name: "Carto",
    data() {
      return {
        mapUrl: "",
      };
    },
    mounted() {
      this.mapUrl = this.$config.mapUrl
      if (!this.mapUrl) {
        console.error("This view require a valid `mapUrl` configured in `config.json`")
      }
    },
  })
  export default class Carto extends Vue {}
</script>
