<template>
  <!-- début card envoyer et demander de l'argent  -->
  <div
    class="action-footer card custom-card is-flex is-justify-content-space-evenly is-align-items-center pb-5 pt-5 "
  >
    <div class="is-flex is-justify-content-center custom-width-send-money">
      <button
        @click="showModalFrame1 = true"
        class="button custom-button custom-button-send-receive-money is-rounded action"
      >
        Envoyer de l'argent
      </button>
    </div>
    <div class="is-flex is-justify-content-center custom-width-send-money">
      <button
        class="button custom-button custom-button-send-receive-money is-rounded action"
      >
        Demander de l'argent
      </button>
    </div>
    <div class="is-flex is-justify-content-center custom-width-send-money">
      <button class="button custom-button is-uppercase is-rounded action">
        crediter mon compte
      </button>
    </div>
    <!-- modal frame 1 -->
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
      <template v-slot:body>
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
            @click="showModalFrame2 = true, warning = true"
            class="button container is-fluid custom-button is-rounded action is-uppercase"
          >
            a un particulier
          </button>
        </div>
      </template>
      <template v-slot:footer>
        <div></div>
      </template>
    </MyModal>
    <!-- fin modal frame 1 -->
    <MyModal v-if="showModalFrame2" @close="showModalFrame2 = false" >
      <template v-slot:header>
        <div
          class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
        >
          <div
            class="is-flex is-align-items-center is-justify-content-space-between"
          >
            <a class="p-2 mr-3 ml-3" @click="showModalFrame2 = false">
              <img
                class="cross-shape"
                src="../../assets/media/Arrow-Shape.png"
                alt="arrow_shape"
              />
            </a>
            <h3 class="custom-header-send-money-title ml-4">
              Envoyer à un particulier
            </h3>
          </div>
          <a
            class="mr-5 p-2"
            @click="(showModalFrame2 = false), (showModalFrame1 = false)"
          >
            <img
              class="cross-shape"
              src="../../assets/media/Cross-Shape.png"
              alt="cross_shape"
            />
          </a>
        </div>
        <div v-if="warning" class="container is-flex is-justify-content-space-evenly is-align-items-center custom-warning mt-3 pl-6 pr-6 pt-4 pb-4" id="warning-message">
          <h2 class="card-paiement-defaut-carte a has-text-danger">
            Pour respecter votre confidentialité, nous n’affichons des résultats
            que si vous possédez l’adresse mail ou le numéro de téléphone
            complet de la personne recherchée.
          </h2>
          <button @click="warning = false"  class="custom-button-warning p-2">OK</button>
        </div>
      </template>
      <template v-slot:body>
        <div
          class="is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center"
        >
          <button
            class="button container is-fluid custom-button is-rounded action is-uppercase mb-5"
          >
            A un commercant / pro
          </button>
          <button
            @click="showModalFrame2 = true"
            class="button container is-fluid custom-button is-rounded action is-uppercase"
          >
            a un particulier
          </button>
        </div>
      </template>
      <template v-slot:footer>
        <div></div>
      </template>
    </MyModal>
  </div>
  <!-- fin card envoyer et demander de l'argent  -->
</template>

<script>
import MyModal from "../modal/MyModal.vue";

export default {
  name: "SendAskMoney",
  components: {
    MyModal: MyModal,
  },
  data() {
    return {
      showModalFrame1: false,
      showModalFrame2: false,
      warning: true,
    };
  },
};
</script>
