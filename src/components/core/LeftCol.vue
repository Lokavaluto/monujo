<template>
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
</template>

<script lang="ts">
export default {
  name: "LeftCol",
};
</script>