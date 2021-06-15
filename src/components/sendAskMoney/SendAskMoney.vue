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
    <MyModal :first="true" v-if="showModalFrame1" @close="showModalFrame1 = false">
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
    <!-- fin modal frame 1 -->
    <!-- début modal frame 2 envoyer à un particulier  -->
    <MyModal v-if="showModalFrame2" @close="showModalFrame2 = false">
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
        <div
          class="is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center mt-3"
        >
          <div
            v-if="warning"
            class="is-flex is-justify-content-space-between is-align-items-center custom-warning pl-6 pr-6 pt-4 pb-4"
            id="warning-message"
          >
            <h2 class="card-paiement-defaut-carte a has-text-danger">
              Pour respecter votre confidentialité, nous n’affichons des
              résultats que si vous possédez l’adresse mail ou le numéro de
              téléphone complet de la personne recherchée.
            </h2>
            <button @click="warning = false" class="custom-button-warning p-2">
              OK
            </button>
          </div>
          <div
            class="mt-4 is-flex is-justify-content-space-evenly is-align-items-center custom-search-bar"
          >
            <p class="control has-icons-left custom-search-bar">
              <input
                class="input"
                type="text"
                placeholder="adresse mail, téléphone"
              />
              <span class="icon is-small is-left">
                <i class="fas fa-search"></i>
              </span>
            </p>
            <button
              class="icon is-medium is-right custom-pictogram-search p-1 custom-button-pictogram"
            >
              <QRPicto></QRPicto>
            </button>
          </div>
        </div>
      </template>
      <template v-slot:body>
        <div
          class="is-flex is-justify-content-space-evenly is-align-items-center mt-5"
        >
          <div class="tabs is-centered">
            <ul class="is-justify-content-space-evenly">
              <li
                :class="[activeClass ? 'is-active' : '']"
                @click="activeClass = true"
              >
                <a>tous</a>
              </li>
              <li
                class="is-flex is-align-items-center"
                :class="[!activeClass ? 'is-active' : '']"
                @click="activeClass = false"
              >
                <a class="custom-pictogram-star"
                  ><span class="icon is-small is-left mr-5">
                    <i class="fas fa-star"></i>
                  </span>
                  <p>favoris</p></a
                >
              </li>
            </ul>
          </div>
        </div>
        <div class="container is-fluid custom-heavy-line-separator"></div>
        <div class="container custom-width-send-money mt-4">
          <div
            class="is-flex is-justify-content-space-between is-align-items-center"
          >
            <div class="is-flex is-align-items-center">
              <div
                class="mr-5 p-2 is-clickable"
                :class="[favoris ? 'is-active' : '']"
                @click="favoris = !favoris"
              >
                <span>
                  <i
                    class="far fa-star"
                    :class="[favoris ? 'fas fa-star' : '']"
                  ></i>
                </span>
              </div>
              <i class="fas fa-history mr-5"></i>
              <div class="p-2 is-clickable" @click="showModalFrame3 = true">
                <p class="custom-card-destinataire mr-5">
                  Arthur Gepleindeflouze
                </p>
              </div>
            </div>
            <div class="is-flex">
              <i class="fas fa-ellipsis-v"></i>
            </div>
          </div>
          <div class="is-flex is-justify-content-flex-end">
            <span class="custom-line-separator mt-4"></span>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div></div>
      </template>
    </MyModal>
    <!-- fin modal frame 2  -->
    <!-- début modal frame 3 envoyer montant après sélection user  -->
    <MyModal v-if="showModalFrame3" @close="showModalFrame3 = false">
      <template v-slot:header>
        <div
          class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
        >
          <div
            class="is-flex is-align-items-center is-justify-content-space-between"
          >
            <a class="p-2 mr-3 ml-3" @click="showModalFrame3 = false">
              <img
                class="cross-shape"
                src="../../assets/media/Arrow-Shape.png"
                alt="arrow_shape"
              />
            </a>
            <h3 class="custom-header-send-money-title ml-4">
              Envoyer à Arthur Gepleindeflouze
            </h3>
          </div>
          <a
            class="mr-5 p-2"
            @click="
              (showModalFrame2 = false),
                (showModalFrame1 = false),
                (showModalFrame3 = false)
            "
          >
            <img
              class="cross-shape"
              src="../../assets/media/Cross-Shape.png"
              alt="cross_shape"
            />
          </a>
        </div>
        <div
          class="is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center mt-3"
        >
          <div class="is-flex is-flex-direction-column custom-search-bar">
            <h1 class="frame3-title mt-3 mb-3">Destinataire</h1>
            <div
              class="is-flex is-justify-content-space-between is-align-items-center custom-user-select p-1"
            >
              <div class="is-flex is-align-items-center">
                <figure class="image is-32x32">
                  <img
                    class="is-rounded"
                    src="https://bulma.io/images/placeholders/128x128.png"
                  />
                </figure>
                <h4 class="ml-1">Arthur Gepleindeflouze</h4>
              </div>
              <div class="mr-3">
                <i class="fas fa-check" style="color: #46B020"></i>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:body>
        <div
          class="is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center mt-3"
        >
          <div class="is-flex is-flex-direction-column custom-montant-input">
            <h2 class="frame3-sub-title mt-3 mb-3">Montant</h2>
            <input type="number" min="0" class="p-2" />
            <textarea
              v-model="message"
              class="mt-6 mb-6"
              placeholder="&nbsp Ajoutez un texte (optionnel)"
            ></textarea>
            <div class="is-flex is-justify-content-flex-end mt-6">
              <button
                class="button custom-button custom-button-send-receive-money is-rounded action"
                @click="showModalFrame4 = true"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div></div>
      </template>
    </MyModal>
    <!-- fin modal frame 3 -->
    <!-- début modal frame 4 code confidentiel -->
    <MyModal v-if="showModalFrame4" @close="showModalFrame4 = false">
      <template v-slot:header>
        <div
          class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
        >
          <div
            class="is-flex is-align-items-center is-justify-content-space-between"
          >
            <a class="p-2 mr-3 ml-3" @click="showModalFrame4 = false">
              <img
                class="cross-shape"
                src="../../assets/media/Arrow-Shape.png"
                alt="arrow_shape"
              />
            </a>
            <h3 class="custom-header-send-money-title ml-4">
              Sécurité
            </h3>
          </div>
          <a
            class="mr-5 p-2"
            @click="
              (showModalFrame2 = false),
                (showModalFrame1 = false),
                (showModalFrame3 = false),
                (showModalFrame4 = false)
            "
          >
            <img
              class="cross-shape"
              src="../../assets/media/Cross-Shape.png"
              alt="cross_shape"
            />
          </a>
        </div>
      </template>
      <template v-slot:body>
        <div class="modal-body-frame-send-money">
          <div
            class="is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center custom-pin-width"
          >
            <h2>Veuillez saisir votre code confidentiel</h2>
            <p>pour valider l'opération</p>
              <div class="mt-6 pinbox is-flex is-justify-centent-center " id="pincode">
                <input
                  type="password"
                  id="password"
                  name="password"
                  maxlength="4"
                  class="pinEntry"
                />
              </div>
            <button
              class="button container is-fluid custom-button is-rounded action is-uppercase mt-6"
            >
              Valider
            </button>
          </div>
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
import QRPicto from "../rightCol/pictos/QRPicto.vue";

export default {
  name: "SendAskMoney",
  components: {
    MyModal: MyModal,
    QRPicto,
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
  },
};
</script>
