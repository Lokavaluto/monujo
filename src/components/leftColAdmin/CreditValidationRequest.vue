<template>
    <div class=" is-flex is-justify-content-space-between pb-3 pt-3">
        <div class="is-flex">
            <div class="is-flex-direction-column">
                <h3 :class="[amount.charAt(0) == '-' ? 'custom-card-destinataire has-text-danger' : 'custom-card-destinataire has-text-success']">
                    {{amount}} {{symbol}}
                </h3>
                <h4 class="custom-card-destinataire">Stéphan Sainléger</h4>
            </div>
        </div>
        <div>
            <h5 class="custom-card-destinataire">22-11-2021</h5>
            <h5 class="card-paiement-defaut-carte has-text-right mt-1">
                {{calcDays(unformatedDate)}}
            </h5>
        </div>
    </div>
    <span class="custom-line-separator mb-4 mt-4"></span>
</template>

<script lang="ts">
    import {defineComponent} from "vue"
    import moment from 'moment'
    export default defineComponent({
        name:"creditValidationRequest",
        props: {
            username: String,
            amount: String,
            symbol: String,
            date: String,
            unformatedDate:String
        },
        methods : {
            calcDays(date:string):string {
                moment.locale('fr');
                var test = moment(date).fromNow()
                return test
            }
        },
    })
</script>