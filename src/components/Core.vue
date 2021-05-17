<template>
  <main class="main pb-4">
    <div class="container-fluid top-bar"></div>
    <div class="container mt-5">
      <section class="top-column column">
        <h1 class="welcome-user">Bienvenue Ivan MANCEL</h1>
      </section>
      <!-- conteneur des colonnes de gauche et droite où se situent les cards -->
      <div class="column is-flex is-justify-content-space-between pl-0 pr-0">
        <!-- colonne de gauche -->
        <div class="left-column column is-half">
          <!-- card solde globale -->
          <div
            class="card custom-card is-flex is-align-items-center is-justify-content-space-between custom-card-padding mb-4"
          >
            <div class="left-card">
              <h2 class="custom-card-title">Solde global</h2>
              <h3 class="custom-card-content">1200 U</h3>
            </div>
            <div class="right-card">
              <button class="button custom-button is-rounded action">
                Créditer
              </button>
            </div>
          </div>
          <!-- fin card solde globale -->
          <!-- card vos comptes -->
          <div
            class="card custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between custom-card-padding mb-4"
          >
            <h2 class="custom-card-title">vos comptes</h2>
            <div
              class="card custom-inner-card custom-card-padding is-flex is-justify-content-space-around is-align-items-center mb-4"
            >
              <h3 class="custom-card-content-2">
                Compte <br />
                principal
              </h3>
              <h3 class="custom-card-content">1000 U</h3>
              <button class="button custom-button is-rounded action">
                Voir
              </button>
            </div>
            <div
              class="card custom-inner-card custom-card-padding is-flex is-justify-content-space-around is-align-items-center"
            >
              <h3 class="custom-card-content-2">
                Crédit de <br />
                confiance
              </h3>
              <h3 class="custom-card-content">200 U</h3>
              <button class="button custom-button is-rounded action">
                Voir
              </button>
            </div>
          </div>
          <!-- fin card vos comptes -->
          <!-- card vos cartes de paiement -->
          <div
            class="card custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between custom-card-padding mb-4"
          >
            <h2 class="custom-card-title">vos cartes de paiement</h2>
            <div
              class="is-flex is-justify-content-space-between is-align-items-center pl-3 pr-3 pb-0"
            >
              <div class="is-flex-direction-column">
                <h3 class="custom-card-content-2">
                  M. Ivan MANCEL
                </h3>
                <h4>5441 xxxx xxx xx92</h4>
              </div>
              <h4 class="card-paiement-defaut-carte">carte par defaut</h4>
            </div>
            <hr />
            <div
              class="is-flex is-justify-content-space-between is-align-items-center pl-3 pr-3 pb-0"
            >
              <div class="is-flex-direction-column">
                <h3 class="custom-card-content-2">
                  M. Ivan MANCEL
                </h3>
                <h4>5618 xxxx xxx xx12</h4>
                <h4></h4>
              </div>
            </div>
            <div class="is-flex is-justify-content-center mt-4">
              <button
                class="button custom-button custom-button-end-card is-rounded action"
              >
                Modifier
              </button>
            </div>
          </div>
          <!-- fin card vos cartes de paiement -->
        </div>
        <!-- fin colonne de gauche -->
        <!-- colonne de droite -->
        <div class="right-column column is-half">
          <div
            class="card custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between custom-card-padding mb-4"
          >
            <h2 class="custom-card-title">Operations</h2>
            <div
              class="x-scroll-disabled tabs is-toggle is-toggle-rounded custom-tabs-switch-div"
            >
              <ul class="is-justify-content-space-between">
                <li class="custom-is-active custom-tabs-switch">
                  <a>Passées </a>
                </li>
                <li class="custom-tabs-switch"><a>En cours</a></li>
                <li class="custom-tabs-switch"><a>A venir</a></li>
              </ul>
            </div>
            <!-- card cette semaine  -->
            <h2 class="custom-card-sub-title">Cette semaine</h2>
            <div class="is-flex is-justify-content-space-between pb-0">
              <div class="is-flex">
                <div
                  class="custom-pictogram is-flex is-justify-content-center is-align-items-center mr-4"
                >
                  <!-- pictograme transfer -->
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="exchange-alt"
                    class="svg-inline--fa fa-exchange-alt fa-w-16"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <path
                      fill="currentColor"
                      d="M0 168v-16c0-13.255 10.745-24 24-24h360V80c0-21.367 25.899-32.042 40.971-16.971l80 80c9.372 9.373 9.372 24.569 0 33.941l-80 80C409.956 271.982 384 261.456 384 240v-48H24c-13.255 0-24-10.745-24-24zm488 152H128v-48c0-21.314-25.862-32.08-40.971-16.971l-80 80c-9.372 9.373-9.372 24.569 0 33.941l80 80C102.057 463.997 128 453.437 128 432v-48h360c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24z"
                    ></path>
                  </svg>
                </div>
                <div class="is-flex-direction-column">
                  <h3 class="custom-card-destinataire has-text-danger">
                    -15,00 U
                  </h3>
                  <h4 class="custom-card-destinataire">Patriciata</h4>
                  <h5 class="custom-card-intitule">
                    Courses pour anniversaire de tantine Alber...
                  </h5>
                </div>
              </div>
              <div>
                <h5 class="custom-card-destinataire">mardi 11/11</h5>
                <h5 class="card-paiement-defaut-carte has-text-right mt-1">
                  hier
                </h5>
              </div>
            </div>
            <!-- fin card cette semaine -->
            <!-- début card semaine dernière -->
            <h2 class="custom-card-sub-title mt-6">La semaine dernière</h2>
            <div class="is-flex is-justify-content-space-between pb-0">
              <div class="is-flex">
                <div
                  class="custom-pictogram is-flex is-justify-content-center is-align-items-center mr-4"
                >
                  <!-- pictograme qr-code scanner -->
                  <svg
                    width="14"
                    height="15"
                    viewBox="0 0 14 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.7541 0.635742H9.16064V2.43H11.7541V5.12139H13.4831V2.43C13.4831 1.43906 12.709 0.635742 11.7541 0.635742Z"
                      fill="white"
                    />
                    <path
                      d="M0.516113 2.43V5.12139H2.24508V2.43H4.83854V0.635742H2.24508C1.2902 0.635742 0.516113 1.43906 0.516113 2.43Z"
                      fill="white"
                    />
                    <path
                      d="M2.24508 9.60703H0.516113V12.2984C0.516113 13.2894 1.2902 14.0927 2.24508 14.0927H4.83854V12.2984H2.24508V9.60703Z"
                      fill="white"
                    />
                    <path
                      d="M11.7541 12.2984H9.16064V14.0927H11.7541C12.709 14.0927 13.4831 13.2894 13.4831 12.2984V9.60703H11.7541V12.2984Z"
                      fill="white"
                    />
                    <path
                      d="M6.13501 6.46619H7.86398V8.26045H6.13501V6.46619Z"
                      fill="white"
                    />
                    <path
                      d="M7.86426 4.67239H9.59323V6.46665H7.86426V4.67239Z"
                      fill="white"
                    />
                    <path
                      d="M4.40625 4.67239H6.13522V6.46665H4.40625V4.67239Z"
                      fill="white"
                    />
                    <rect
                      x="7.86426"
                      y="8.26224"
                      width="1.72897"
                      height="1.79426"
                      fill="white"
                    />
                    <path
                      d="M4.40625 8.26224H6.13522V10.0565H4.40625V8.26224Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <div class="is-flex-direction-column">
                  <h3 class="custom-card-destinataire has-text-danger">
                    -15,00 U
                  </h3>
                  <h4 class="custom-card-destinataire">Patriciata</h4>
                  <h5 class="custom-card-intitule">
                    Courses pour anniversaire de tantine Alber...
                  </h5>
                </div>
              </div>
              <div>
                <h5 class="custom-card-destinataire">mardi 11/11</h5>
                <h5 class="card-paiement-defaut-carte has-text-right mt-1">
                  hier
                </h5>
              </div>
            </div>
            <hr />
            <div class="is-flex is-justify-content-space-between pb-0">
              <div class="is-flex">
                <div
                  class="custom-pictogram is-flex is-justify-content-center is-align-items-center mr-4"
                >
                  <!-- pictograme qr-code scanner -->
                  <svg
                    width="14"
                    height="15"
                    viewBox="0 0 14 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.7541 0.635742H9.16064V2.43H11.7541V5.12139H13.4831V2.43C13.4831 1.43906 12.709 0.635742 11.7541 0.635742Z"
                      fill="white"
                    />
                    <path
                      d="M0.516113 2.43V5.12139H2.24508V2.43H4.83854V0.635742H2.24508C1.2902 0.635742 0.516113 1.43906 0.516113 2.43Z"
                      fill="white"
                    />
                    <path
                      d="M2.24508 9.60703H0.516113V12.2984C0.516113 13.2894 1.2902 14.0927 2.24508 14.0927H4.83854V12.2984H2.24508V9.60703Z"
                      fill="white"
                    />
                    <path
                      d="M11.7541 12.2984H9.16064V14.0927H11.7541C12.709 14.0927 13.4831 13.2894 13.4831 12.2984V9.60703H11.7541V12.2984Z"
                      fill="white"
                    />
                    <path
                      d="M6.13501 6.46619H7.86398V8.26045H6.13501V6.46619Z"
                      fill="white"
                    />
                    <path
                      d="M7.86426 4.67239H9.59323V6.46665H7.86426V4.67239Z"
                      fill="white"
                    />
                    <path
                      d="M4.40625 4.67239H6.13522V6.46665H4.40625V4.67239Z"
                      fill="white"
                    />
                    <rect
                      x="7.86426"
                      y="8.26224"
                      width="1.72897"
                      height="1.79426"
                      fill="white"
                    />
                    <path
                      d="M4.40625 8.26224H6.13522V10.0565H4.40625V8.26224Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <div class="is-flex-direction-column">
                  <h3 class="custom-card-destinataire has-text-danger">
                    -15,00 U
                  </h3>
                  <h4 class="custom-card-destinataire">Patriciata</h4>
                  <h5 class="custom-card-intitule">
                    Courses pour anniversaire de tantine Alber...
                  </h5>
                </div>
              </div>
              <div>
                <h5 class="custom-card-destinataire">mardi 11/11</h5>
                <h5 class="card-paiement-defaut-carte has-text-right mt-1">
                  hier
                </h5>
              </div>
            </div>
            <div class="is-flex is-justify-content-center mt-4">
              <button
                class="button custom-button custom-button-end-card is-rounded action mt-6"
              >
                Voir tout
              </button>
            </div>
            <!-- fin card semaine dernière -->
          </div>
        </div>
        <!-- fin colonne de droite -->
      </div>
      <!-- fin des conteneurs des colonnes de gauche et droite -->
      <!-- début card envoyer et demander de l'argent  -->
      <div
        class="action-footer card custom-card is-flex is-justify-content-space-evenly is-align-items-center pb-5 pt-5 "
      >
        <div class="is-flex is-justify-content-center">
          <button
            class="button custom-button custom-button-send-receive-money is-rounded action"
          >
            Envoyer de l'argent
          </button>
        </div>
        <div class="is-flex is-justify-content-center">
          <button
            class="button custom-button custom-button-send-receive-money is-rounded action"
          >
            Demander de l'argent
          </button>
        </div>
      </div>
      <!-- fin card envoyer et demander de l'argent  -->
    </div>
  </main>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    msg: String,
  },
})
export default class Core extends Vue {
  msg!: string;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
