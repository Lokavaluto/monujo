<template>
  <iframe
    v-if="cguUrl"
    width="100%"
    height="100%"
    :src="cguUrl"
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
      margin-top: 3.25em;
    "
  ></iframe>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  @Options({
    name: "TermsOfService",
    data() {
      return {
        cguUrl: "",
      }
    },
    mounted() {
      this.cguUrl = this.$config.cguUrl
      if (!this.cguUrl) {
        console.error(
          "This view require a valid `cguUrl` configured in `config.json`"
        )
      }
    },
  })
  export default class TermsOfService extends Vue {}
</script>
