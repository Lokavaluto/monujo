<template>
  <iframe
    width="100%"
    height="100%"
    src="https://carto.dev.lokavaluto.fr/annuaire?iframe=1#/carte/@47.16,6.04,8z?cat=all"
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
import { Vue } from "vue-class-component";

export default class Carto extends Vue {}
</script>
