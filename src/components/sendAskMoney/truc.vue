<!-- début modal frame 2 envoyer à un pro  -->
<template>
  <MyModal v-if="showModalFrame2Pro" @close="showModalFrame2Pro = false">
    <template v-slot:header>
      <div
        class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
      >
        <div
          class="is-flex is-align-items-center is-justify-content-space-between"
        >
          <a class="p-2 mr-3 ml-3" @click="showModalFrame2Pro = false">
            <img
              class="cross-shape"
              src="../../assets/media/Arrow-Shape.png"
              alt="arrow_shape"
            />
          </a>
          <h3 class="custom-header-send-money-title ml-4">
            Envoyer à un professionnel
          </h3>
        </div>
        <a
          class="mr-5 p-2"
          @click="(showModalFrame2Pro = false), (showModalFrame1 = false)"
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
            <div class="p-2 is-clickable" @click="showModalFrame3Pro = true">
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
  <MyModal v-if="showModalFrame3Pro" @close="showModalFrame3Pro = false">
    <template v-slot:header>
      <div
        class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
      >
        <div
          class="is-flex is-align-items-center is-justify-content-space-between"
        >
          <a class="p-2 mr-3 ml-3" @click="showModalFrame3Pro = false">
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
            (showModalFrame2Pro = false),
              (showModalFrame1 = false),
              (showModalFrame3Pro = false)
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
            class="custom-textarea textarea mt-5"
            placeholder="Ajoutez un texte (optionnel)"
          ></textarea>
          <div class="is-flex is-justify-content-flex-end mt-6">
            <button
              class="button custom-button custom-button-send-receive-money is-rounded action"
              @click="showModalFrame4Pro = true"
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
  <MyModal v-if="showModalFrame4Pro" @close="showModalFrame4Pro = false">
    <template v-slot:header>
      <div
        class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
      >
        <div
          class="is-flex is-align-items-center is-justify-content-space-between"
        >
          <a class="p-2 mr-3 ml-3" @click="showModalFrame4Pro = false">
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
            (showModalFrame2Pro = false),
              (showModalFrame1 = false),
              (showModalFrame3Pro = false),
              (showModalFrame4Pro = false)
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
          <div
            class="mt-6 ml-6 mr-6 pinbox is-flex is-justify-content-center is-align-items-center has-text-centered"
            id="pincode"
          >
            <input
              type="password"
              id="password"
              name="password"
              maxlength="4"
              class="pinEntry"
            />
          </div>
          <button
            class="button container custom-button is-rounded action is-uppercase mt-6"
            id="pincode"
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
</template>
