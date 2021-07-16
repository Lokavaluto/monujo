<template>
    <div class=" is-flex is-justify-content-space-between pb-5 mb-5">
      <div class="is-flex">
        <div
          class="custom-pictogram is-flex is-justify-content-center is-align-items-center mr-4"
        >
        <TransactionPicto v-if="picto =='Transaction'"/>
        <QRPicto v-else-if="picto == 'QR'"/>
        </div>
        <div class="is-flex-direction-column">
          <h3 class="custom-card-destinataire has-text-danger">
            {{amount}} {{symbol}}
          </h3>
          <h4 class="custom-card-destinataire">{{name}}</h4>
          <h5 class="custom-card-intitule">
            {{desc}}
          </h5>
        </div>
      </div>
      <div>
        <h5 class="custom-card-destinataire">{{date}}</h5>
        <h5 class="card-paiement-defaut-carte has-text-right mt-1">
          hier
        </h5>
      </div>
    </div>
   
</template>

<script lang="ts">
import TransactionPicto from "./pictos/TransactionPicto.vue"
import QRPicto from "./pictos/QRPicto.vue"
import {defineComponent} from "vue"
export default defineComponent({
    name:"TransactionSubCard",
    components: {
        TransactionPicto,
        QRPicto
    },
    props: {
        picto: String,
        amount: String,
        symbol: String,
        desc: String,
        date: String,
        name:String
    },
})
</script>