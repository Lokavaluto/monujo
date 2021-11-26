<template>
    <div class=" is-flex is-justify-content-space-between pb-3 pt-3">
      <div class="is-flex">
        <div
          class="custom-pictogram is-flex is-justify-content-center is-align-items-center mr-4"
        >
        <TransactionPicto v-if="picto =='Transaction'"/>
        <QRPicto v-else-if="picto == 'QR'"/>
        </div>
        <div class="is-flex-direction-column">
          
          <h3 :class="[amount.charAt(0) == '-' ? 'custom-card-destinataire has-text-danger' : 'custom-card-destinataire has-text-success']">
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
          {{calcDays(unformatedDate)}}
        </h5>
      </div>
    </div>
   <span class="custom-line-separator has-background-white-ter mb-2 mt-1"></span>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import TransactionPicto from "./pictos/TransactionPicto.vue"
import QRPicto from "./pictos/QRPicto.vue"
import moment from 'moment'

@Options({
    name:"TransactionSubCard",
    components: {
        TransactionPicto,
        QRPicto
    },
    methods: {
      calcDays(date:string):string {
        moment.locale('fr');
        var test = moment(date).fromNow()
        return test
      }
    },
    props: {
        picto: String,
        amount: String,
        symbol: String,
        desc: String,
        date: String,
        name:String,
        unformatedDate:String
    },
})
export default class TransactionSubCard extends Vue {}
</script>