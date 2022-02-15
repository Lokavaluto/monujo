<template>
  <div class="modal" v-bind="value">
    <div class="container">
      <div class="modal__title">Direction</div>
      <p>Get a direction with your favourite apps</p>
      <a href="#" class="btn gmaps">
        <img src="https://img.icons8.com/color/420/google-maps.png" /> Google
        Maps
      </a>
      <a href="#" class="btn waze">
        <img src="https://img.icons8.com/color/420/waze.png" /> Waze
      </a>
      <button
        @click.prevent="close"
        class="mt-3 border-b border-teal font-semibold"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';

  @Options({
    name: "Modal",
    props: {
      value: {
        required: true,
      },
    },
    methods: {
      close() {
        this.$emit("input", !this.value);
      },
    },
  })
  export default class Modal extends Vue {}
</script>
