<template>
  <iframe
    v-if="helpUrl"
    width="100%"
    height="100%"
    :src="helpUrl"
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
    name: "Help",
    data() {
      return {
        helpUrl: "",
      }
    },
    mounted() {
      this.helpUrl = this.$config.helpUrl
      if (!this.helpUrl) {
        console.error(
          "This view require a valid `helpUrl` configured in `config.json`"
        )
      }
    },
  })
  export default class Help extends Vue {}
</script>
