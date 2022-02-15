<template>
  <div class="column">
    <YourAccs/>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import YourAccs from "../leftCol/YourAccs.vue";

  @Options({
    name: "LeftCol",
    components: {
      YourAccs
    }
  })
  export default class LeftCol extends Vue {}
</script>