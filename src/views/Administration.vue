<template>
  <main class="main">
    <router-view />
  </main>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  components: {
  },
})
export default class Administration extends Vue {}
</script>
