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
        @click="showModalFrameAskMoney1 = true"
      >
        Demander de l'argent
      </button>
    </div>
    <div class="is-flex is-justify-content-center custom-width-send-money">
      <button
        class="button custom-button is-uppercase is-rounded action"
        @click="showModalFrameCreditMoney1 = true"
      >
        crediter mon compte
      </button>
    </div>
    <!-- modal frame 1 -->
    <MyModal
      :first="true"
      v-if="showModalFrame1"
      @close="showModalFrame1 = false"
    >
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
              @click="showModalFrame2Pro = true"
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
                v-model="searchName"
                v-on:input="delayedSearch()"
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
              v-on:click="fireSearch"
            >
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
                @click="activeClass = true , displayFavoritesOnly = false, fastSearch()"
              >
                <a>tous</a>
              </li>
              <li
                class="is-flex is-align-items-center"
                :class="[!activeClass ? 'is-active' : '']"
                @click="activeClass = false , displayFavoritesOnly = true, fastSearch()"
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
        <div class="container custom-width-send-money mt-4"
             v-for="partner in partners"
             :key="partner">
          <div
            class="is-flex is-justify-content-space-between is-align-items-center"
            
          >
            <div
            class="is-flex is-align-items-center">
              <div
                class="mr-5 p-2 is-clickable"
                :class="[partner.is_favorite ? 'is-active' : '']"
                @click="toggleFavorite(partner), partner.is_favorite = partner.is_favorite ? false : true"
              >
                <span>
                  <i
                    class="far fa-star"
                    :class="[partner.is_favorite ? 'fas fa-star' : '']"
                  ></i>
                </span>
              </div>
              <i class="fas fa-history mr-5"></i>
              <div class="p-2 is-clickable" @click=" setRecipient(partner), this.showModalFrame3 = true">
                <p class="custom-card-destinataire mr-5">
                  {{partner.name}}
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
              Envoyer à {{recipientName}}
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
                <h4 class="ml-1">{{recipientName}}</h4>
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
            <input v-model="amount" type="number" min="0" class="p-2" />
            <textarea
              v-model="message"
              class="custom-textarea textarea mt-5"
              placeholder="Ajoutez un texte (optionnel)"
            ></textarea>
            <div class="is-flex is-justify-content-flex-end mt-6">
              <button
                class="button custom-button custom-button-send-receive-money is-rounded action"
                @click="sendTransaction(), (showModalFrame2 = false),
                (showModalFrame1 = false),
                (showModalFrame3 = false)"
              >
                Envoyer
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
    <!-- <MyModal v-if="showModalFrame4" @close="showModalFrame4 = false">
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
            <div
              class="mt-6 ml-6 mr-6 pinbox is-flex is-justify-content-center is-align-items-center has-text-centered"
              id="pincode"
            >
              <input
                ref = "pincode"
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
    </MyModal> -->
    <!-- début modal frame 4 code confidentiel particulier -->
    <!-- MODALS envoyer à un pro -->
    <!-- début frame 2 pro -->
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
                <a>recherche</a>
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
                  La Patate
                </p>
                <h5 class="card-paiement-defaut-carte mt-1">
                  Friterie Belge une fois
                </h5>
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
    <!-- fin modal frame 2 pro -->
    <!-- début modal frame 3 pro -->
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
              Envoyer à La Patate
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
                <h4 class="ml-1">La Patate</h4>
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
    <!-- fin frame 3 pro -->
    <!-- début frame 4 pro -->
    <!-- <MyModal v-if="showModalFrame4Pro" @close="showModalFrame4Pro = false">
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
                ref = "pincode"
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
    </MyModal> -->
    <!-- Fin MODALS pro -->
    <!-- début MODALS demander de l'argent -->
    <!-- Frame 1 -->
    <MyModal
      :first="true"
      v-if="showModalFrameAskMoney1"
      @close="showModalFrameAskMoney1 = false"
    >
      <template v-slot:header>
        <div
          class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
        >
          <div class="is-flex is-align-items-center ml-5">
            <h3 class="custom-header-send-money-title ml-4">
              Demander de l'argent
            </h3>
          </div>
          <a class="mr-5 p-2" @click="showModalFrameAskMoney1 = false">
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
            <div class="is-flex is-justify-content-center mt-6">
              <button
                class="button custom-button custom-button-send-receive-money is-rounded action is-justify-content-space-evenly"
                @click="showModalFrameAskMoney2 = true"
              >
                <img src="../../../src/assets/media/Plane.svg" />
                <p class="ml-4">
                  Générer un lien de paiement
                </p>
              </button>
            </div>
            <div class="container custom-width-send-money mt-5">
              <p class="has-text-centered">
                vous pourrez partager ce lien par mail à vos contacts. Ils
                recevront une invitation à se connecter ou à créer un compte
                pour vous envoyer l’argent.
              </p>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div></div>
      </template>
    </MyModal>
    <!-- fin frame 1 -->
    <!-- début frame 2 -->
    <MyModal
      v-if="showModalFrameAskMoney2"
      @close="showModalFrameAskMoney2 = false"
    >
      <template v-slot:header>
        <div
          class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
        >
          <div class="is-flex is-align-items-center ml-5">
            <h3 class="custom-header-send-money-title ml-4">
              Demander de l'argent
            </h3>
          </div>
          <a
            class="mr-5 p-2"
            @click="
              (showModalFrameAskMoney1 = false),
                (showModalFrameAskMoney2 = false)
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
            <div
              class="is-flex is-justify-content-center is-align-items-center mt-6"
            >
              <p class="mr-4">www.mamlcc-moncompte-paymeAe...</p>
              <button
                class="button custom-button custom-button-send-receive-money is-rounded action is-justify-content-space-evenly"
                @click="showModalFrameAskMoney2 = true"
              >
                <img src="../../../src/assets/media/copy.svg" />
                <p class="ml-4">
                  copier le lien
                </p>
              </button>
            </div>
            <div class="container custom-width-send-money mt-5">
              <p class="has-text-centered">
                vous pourrez partager ce lien par mail à vos contacts. Ils
                recevront une invitation à se connecter ou à créer un compte
                pour vous envoyer l’argent.
              </p>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div></div>
      </template>
    </MyModal>
    <!-- fin MODALS demander de l'argent  -->
    <!-- début MODALS créditer un compte -->
    <!-- début frame 1 crédit -->
    <MyModal
      :first="true"
      v-if="showModalFrameCreditMoney1"
      @close="showModalFrameCreditMoney1 = false"
    >
      <template v-slot:header>
        <div
          class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
        >
          <div class="is-flex is-align-items-center ml-5">
            <h3 class="custom-header-send-money-title ml-6 pl-5">
              Demander de l'argent
            </h3>
          </div>
          <a class="mr-5 p-2" @click="showModalFrameCreditMoney1 = false">
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
          class="is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center mt-3"
        >
          <div class="is-flex is-flex-direction-column custom-montant-input">
            <h2 class="frame3-sub-title mt-3 mb-3">
              Montant à créditer
            </h2>
            <input type="number" min="0" class="p-2" />
            <h2 class="mt-6 mb-6 frame3-sub-title">Mode de paiement</h2>
            <div class="columns">
              <div class="column">
                <h2 class="custom-card-title">Vos cartes enregistrees</h2>
                <AddPayCard
                  fullName="M. Ivan MANCEL"
                  cardNumber="5441 xxxx xxx xx92"
                  cardtype="mastercard.svg"
                />

                <AddPayCard
                  fullName="M. Ivan MANCEL"
                  cardNumber="5618 xxxx xxx xx12"
                  cardtype="visa.svg"
                />
              </div>
              <div class="column">
                <h3 class="custom-card-title">Nouvelle carte</h3>
                <div class="is-flex">
                  <figure class="image is-96x96">
                    <img :src="require(`@/assets/media/CB.svg`)">
                    <!-- <img
                      src="/src/assets/media/CB.svg"
                      alt=""
                      style="width: 90px; height:90px"
                    /> -->
                  </figure>
                  <figure class="image is-96x96">
                    <img :src="require(`@/assets/media/visa.svg`)">
                    <!-- <img
                      src="/src/assets/media/visa.svg"
                      alt=""
                      style="width: 90px; height:90px"
                    /> -->
                  </figure>
                  <figure class="image is-96x96">
                    <img :src="require(`@/assets/media/mastercard.svg`)">
                    <!-- <img
                      src="/src/assets/media/mastercard.svg"
                      alt=""
                      style="width: 90px; height:90px"
                    /> -->
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="columns">
          <div class="column"></div>
          <div class="column is-flex is-justify-content-center">
            <button
              class="button custom-button custom-button-send-receive-money is-rounded action"
              @click="showModalFrameCreditMoney2 = true"
            >
              Suivant
            </button>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div></div>
      </template>
    </MyModal>
  </div>
  <!-- Fin frame 1 crédit -->
  <!-- début frame 2 crédit -->
  <MyModal
    v-if="showModalFrameCreditMoney2"
    @close="showModalFrameCreditMoney2 = false"
  >
    <template v-slot:header>
      <div
        class="custom-header-send-money is-flex is-align-items-center is-justify-content-space-between"
      >
        <div class="is-flex is-align-items-center ml-5">
          <div
            class="is-flex is-align-items-center is-justify-content-space-between"
          >
            <a
              class="p-2 mr-3 ml-3"
              @click="showModalFrameCreditMoney2 = false"
            >
              <img
                class="cross-shape"
                src="../../assets/media/Arrow-Shape.png"
                alt="arrow_shape"
              />
            </a>
            <h3 class="custom-header-send-money-title ml-4">
              Ajouter une carte
            </h3>
          </div>
        </div>
        <a
          class="mr-5 p-2"
          @click="
            (showModalFrameCreditMoney1 = false),
              (showModalFrameCreditMoney2 = false)
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
      <div
        class="is-flex is-flex-direction-column is-justify-content-space-evenly is-align-items-center mt-3"
      >
        <div class="is-flex is-flex-direction-column custom-montant-input">
          <h2 class="frame3-sub-title mt-3 mb-3">
            Numéro de la carte
          </h2>
          <input type="number" min="0" class="p-2 custom-input-left" />
          <h2 class="mt-6 mb-3 frame3-sub-title">Titulaire</h2>
          <input type="text" min="0" class="p-2 custom-input-left" />
          <div class="is-flex mt-5">
            <div class="is-flex is-flex-direction-column">
              <h2 class="frame3-sub-title mt-3 mb-3">
                Date d'expiration
              </h2>
              <input type="number" min="0" class="p-2 custom-input-left custom-montant-input" />
            </div>
            <div class="is-flex is-flex-direction-column">
              <h2 class="mt-3 mb-3 frame3-sub-title">Cryptogramme</h2>
              <input type="number" min="0" class="p-2 custom-input-left custom-montant-input" />
            </div>
          </div>
        </div>
      </div>

      <div class="columns">
        <div class="column"></div>
        <div class="column is-flex is-justify-content-center mt-6">
          <button
            class="button custom-button custom-button-send-receive-money is-rounded action"
            @click="showModalFrameCreditMoney2 = true"
          >
            Suivant
          </button>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <div></div>
    </template>
  </MyModal>
</template>

<script lang="ts">
import MyModal from "../modal/MyModal.vue";
import AddPayCard from "../leftCol/payCards/AddPayCard.vue";
import { useStore } from 'vuex'
import {inject , defineComponent} from 'vue'

function returnFavoritesOnly(partners:any): any{
  var ret = []
  for (let el of partners) {
    if (el.is_favorite == true) {
      ret.push(el)
    }
  }
  return ret
}

export default defineComponent({
  name: "SendAskMoney",
  components: {
    MyModal: MyModal,
    AddPayCard,
  },
   data :function (): {
    showModalFrame1: boolean,
    showModalFrame2: boolean,
    showModalFrame3: boolean,
    showModalFrame4: boolean,
    showModalFrame2Pro: boolean,
    showModalFrame3Pro: boolean,
    showModalFrame4Pro: boolean,
    showModalFrameAskMoney1: boolean,
    showModalFrameAskMoney2: boolean,
    showModalFrameCreditMoney1: boolean,
    showModalFrameCreditMoney2: boolean,
    showModalFrameCreditMoney3: boolean,
    showModalFrameCreditMoney4: boolean,
    warning: boolean,
    activeClass: boolean,
    favoris: boolean,
    searchName:string, 
    amount:number,
    message:string,
    partners:Array<any>,
    recipientName:string,
    displayFavoritesOnly:boolean
    } 
    {
    return {
      showModalFrame1: false,
      showModalFrame2: false,
      showModalFrame3: false,
      showModalFrame4: false,
      showModalFrame2Pro: false,
      showModalFrame3Pro: false,
      showModalFrame4Pro: false,
      showModalFrameAskMoney1: false,
      showModalFrameAskMoney2: false,
      showModalFrameCreditMoney1: false,
      showModalFrameCreditMoney2: false,
      showModalFrameCreditMoney3: false,
      showModalFrameCreditMoney4: false,
      warning: true,
      activeClass: true,
      favoris: false,
      searchName:"",
      amount:0, 
      message:"",
      partners:[],
      recipientName:"",
      displayFavoritesOnly:false
    };
  },

  setup(): any{
    const lokapi: any = inject("$lokapi");
    const store : any = useStore()
    return {
      lokapi: lokapi,
      store: store
    }
  },

  methods: {
    async toggleFavorite(contact:any):Promise<void> {
      contact.toggleFavorite()
    },

    async fastSearch() :Promise<void> {
      var recipients
      try {
        recipients = await this.lokapi.searchRecipients(this.searchName)
        console.log('searchRecipients() WORKED', recipients)
      } catch (err) {
        console.log('searchRecipients() Failed', err)
      }
        this.partners = this.displayFavoritesOnly ? returnFavoritesOnly(recipients) : recipients
    },

    async delayedSearch() :Promise<void> {
      console.log("test")
      var cached = this.searchName
      setTimeout(async () => {
        if (cached == this.searchName) {
          console.log(this.searchName)
          var recipients
          try {
            recipients = await this.lokapi.searchRecipients(this.searchName)
            console.log('searchRecipients() WORKED', recipients)
          } catch (err) {
            console.log('searchRecipients() FAILED', err)
          }
            this.partners = this.displayFavoritesOnly ? returnFavoritesOnly(recipients) : recipients
        }
       }, 100);
    },
    setRecipient(partner:any):void {
        this.store.state.lokapi.recipient = partner
        this.recipientName = partner.name
        console.log("set",this.store.state.recipient)
    },
    async sendTransaction():Promise<void> {
      let accs = this.store.state.lokapi.accounts
      let part = this.store.state.lokapi.recipient
      try {
          await accs[0].transfer(part, this.amount.toString(), this.message)
        } catch (err) { // {RequestFailed, APIRequestFailed, InvalidCredentials, InvalidJson}
          console.log('Payment failed:', err.message)
          // commit('payment_error')
          throw err
        }
        let accounts = await this.lokapi.getAccounts()
        let bal = await accounts[0].getBalance()
        this.store.state.lokapi.bal = bal
        // let transactions = await this.lokapi.getTransactions()
        // console.log(transactions)
        await this.store.dispatch("resetTRS")
        this.$toast.success(
          `Paiement  effectué à ${this.recipientName}`,
          {
            position:
            "top-right"
          });
        
    }
  },


  // setup():any {
  //     const pincode = ref()
  //     onUpdated(() => {
  //       if (pincode.value) {
  //         pincode.value.focus()
  //       }
  //     })

  //     return {
  //       pincode
  //     }
  //   },

   
 
});
</script>
