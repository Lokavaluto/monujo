<template>
  <Nav />
  <router-view />
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import Nav from "@/components/Nav.vue";

  @Options({
    components: { Nav }
  })
  export default class Login extends Vue {}
</script>

<style lang="scss"></style>
