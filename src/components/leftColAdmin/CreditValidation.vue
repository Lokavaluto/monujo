<template>
    <h2 class="custom-card-sub-title">Demandes de crédits à valider</h2>
    <CreditValidationRequest v-for="request in getCreditValidationRequests"
             :key="request"
             :date="dateFormated(request.date)"
             :unformatedDate="request.date"
             :name="Test"/>
</template>

<script lang="ts">
    import CreditValidationRequest from "./CreditValidationRequest.vue"
    import {defineComponent} from "vue"
    import {useStore} from "vuex"
    export default defineComponent({
        name:"CreditValidation",
        components: {
            CreditValidationRequest,
        },
        data() :{store:any, creditValidationRequests:Array<any>} {
            const store: any = useStore()
            return {
                store:store,
                creditValidationRequests: store.state.lokapi.creditValidationRequests
            }
        },
        computed: {
            getCreditValidationRequests(): any {
                if (this.store.state.OperationsSelector == 0) {
                    return this.store.getters.getCreditValidationRequests()
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