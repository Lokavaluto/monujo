<template>
    <h2 class="custom-card-sub-title">Créations de portefeuilles à valider</h2>
    <WalletValidationRequest v-for="walletValidationRequest in getWalletValidationRequests"
             :key="walletValidationRequest"
             :date="dateFormated(walletValidationRequest.date)"
             :unformatedDate="walletValidationRequest.date"
             :name="Test"/>
</template>

<script lang="ts">
    import WalletValidationRequest from "./WalletValidationRequest.vue"
    import {defineComponent} from "vue"
    import {useStore} from "vuex"
    export default defineComponent({
        name:"WalletValidation",
        components: {
            WalletValidationRequest,
        },
        data() :{store:any, walletValidationRequests:Array<any>} {
            const store: any = useStore()
            return {
                store:store,
                walletValidationRequests:[] // store.state.lokapi.walletValidationRequests
            }
        },
        computed: {
            getWalletValidationRequests(): any {
                if (this.store.state.OperationsSelector == 0) {
                    return [] // this.store.getters.getWalletValidationRequests()  
                } else {
                    return []
                }
            }
        },
        methods : { 
            dateFormated(badDate:string) :string {
                var date = new Date(badDate);
                var options = {weekday: "long", day: "numeric", month: "numeric"};
                // eslint-disable-next-line
                //@ts-ignore-next-line
                const DateFr = new Intl.DateTimeFormat('fr-FR', options).format(date)
                return DateFr
            }
        },
    })
</script>