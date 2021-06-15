<template>
 <MyModal v-if="showModalFrame1" @close="showModalFrame1 = false">
    <template v-slot:header>
        <div
          class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
        >
          <h3 class="custom-header-send-money-title ml-6 pl-5">
            Envoyer de l'argent
          </h3>
          <a class="mr-5 p-2" @click="showModalFrame1 = false">
            <img
              class="cross-shape"
              src="../../assets/media/Cross-Shape.png"
              alt="cross_shape"
            />
          </a>
        </div>
      </template>
      <template v-slot:body class="modal-body-frame-send-money">
        <div class="modal-body-frame-send-money">
          <div
            class="is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center"
          >
            <h3 class="custom-tabs-switch a mb-6">
              A qui souhaitez vous envoyer de l'argent ?
            </h3>
            <button
              class="button container is-fluid custom-button is-rounded action is-uppercase mb-5"
            >
              A un commercant / pro
            </button>
            <button
              @click="(showModalFrame2 = true), (warning = true)"
              class="button container is-fluid custom-button is-rounded action is-uppercase"
            >
              a un particulier
            </button>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div></div>
      </template>
       </MyModal>
</template>

<script>
import MyModal from "../modal/MyModal.vue";
export default {
    name:"Modal1",
    components: {
    MyModal: MyModal
  },
  data() {
    return {
      showModalFrame1: false,
      showModalFrame2: false,
      showModalFrame3: false,
      showModalFrame4: false,
      warning: true,
      activeClass: true,
      favoris: false,
    };
  }
}
</script>