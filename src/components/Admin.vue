<template>
  <main class="main pb-4">
    <div class="container-fluid top-bar"></div>
    <div class="container mt-5">
      <section class="top-column column">
        <h1 class="welcome-user">Administration</h1>
      </section>
      <!-- container for both left and right columns where the cards are -->
      <div class="column is-flex is-justify-content-space-between pl-0 pr-0">
        <LeftColAdmin />
        <RightColAdmin />
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import LeftColAdmin from "./admin/LeftColAdmin.vue";
import RightColAdmin from "./admin/RightColAdmin.vue";

@Options({
  name:"Admin",
  mounted() {
  },
  computed: {
  },
  props: {
  },
  components: {
    LeftColAdmin,
    RightColAdmin,
  },
})
export default class Admin extends Vue {}
</script>