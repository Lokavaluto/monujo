<template>
  <Nav />
  <button class="btn" @click="openModal">Open Modal</button>
  <ModalFrame1 v-model="modalOpen"></ModalFrame1>
  <router-view />
</template>

<script>
import Nav from "./components/Nav";
import ModalFrame1 from "./components/Modal";

export default {
  components: { Nav, ModalFrame1 },
  data() {
    return {
      modalOpen: false,
    };
  },
  methods: {
    openModal() {
      this.modalOpen = !this.modalOpen;
    },
  },
};
</script>

<style lang="scss"></style>
