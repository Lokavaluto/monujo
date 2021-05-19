<template>
    <div class="is-flex is-justify-content-space-between pb-0">
              <div class="is-flex">
                <div
                  class="custom-pictogram is-flex is-justify-content-center is-align-items-center mr-4"
                >
                <TransactionPicto v-if="picto =='Transaction'"/>
                <QRPicto v-else-if="picto == 'QR'"/>
                <!-- mettre un if pour les pictos -->
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
</template>

<script lang="ts">
import TransactionPicto from "./pictos/TransactionPicto.vue"
import QRPicto from "./pictos/QRPicto.vue"
export default {
    name:"TransactionSubCard",
    components: {
        TransactionPicto,
        QRPicto
    },
    props: {
        picto: String,
    },
}
</script>