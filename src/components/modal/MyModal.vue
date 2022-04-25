<template>
  <transition name="modal">
    <div class="modal-mask">
      <div v-if="first" class="overlay" @click="$emit('close')"></div>
      <div v-else class="invisible-overlay" @click="$emit('close')"></div>
      <div class="modal-wrapper">
        <div v-if="first" class="modal-container">
          <div class="modal-header">
            <slot name="header"> default header </slot>
          </div>

          <div class="modal-body">
            <slot name="body"> default body </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              default footer
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>
        </div>
        <div v-else class="modal-container-no-shadow">
          <div class="modal-header">
            <slot name="header"> default header </slot>
          </div>

          <div class="modal-body">
            <slot name="body"> default body </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              default footer
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: "MyModal",
    props: ["first"],
    data() {
      return {
        showModal: false,
      }
    },
  }
</script>
