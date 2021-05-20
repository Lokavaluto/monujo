<template>
    <!-- card vos comptes -->
          <div
            class="card custom-card is-flex-direction-column is-align-items-center is-justify-content-space-between custom-card-padding mb-4"
          >
            <h2 class="custom-card-title">vos comptes</h2>
            <div
              class="card custom-inner-card custom-card-padding is-flex is-justify-content-space-around is-align-items-center mb-4"
            >
            <!-- TODO Faire custom card -->
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
</template>

<script>
export default {
    name:"YourAccs"
}
</script>