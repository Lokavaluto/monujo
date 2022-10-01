<template>
  <loading
    v-model:active="transactionsLoading"
    :can-cancel="false"
    :is-full-page="false"
  />
  <div v-if="!transactionsLoading">
    <div
      class="notification is-danger is-light"
      v-if="transactionsLoadingError"
    >
      <p class="mb-4">
        Une erreur inattendue est survenue pendant le chargement des dernières
        opérations de votre compte. Veuillez nous excuser pour le désagrément.
      </p>
      <p>
        Vous pouvez essayer de recharger la page, ou contacter votre
        administrateur si l'erreur persiste.
      </p>
    </div>
    <p
      v-else-if="thisWeektransactions?.length === 0"
      class="notification is-default"
    >
      Aucune opération dans votre historique
    </p>
    <div v-else>
      <h2 class="custom-card-title">Opérations</h2>
      <TransactionItem
        v-for="transaction in thisWeektransactions"
        :key="transaction"
        :amount="transaction.amount"
        :symbol="transaction.currency"
        :desc="transaction.description"
        :date="dateFormated(transaction.date)"
        :unformatedDate="transaction.date"
        :name="transaction.related"
        picto="QR"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import TransactionItem from "./TransactionItem.vue"
  import Loading from "vue-loading-overlay"
  import "vue-loading-overlay/dist/vue-loading.css"
  import { mapModuleState } from "@/utils/vuex"
  @Options({
    name: "TransactionListRecent",
    components: {
      TransactionItem,
      Loading,
    },
    data() {
      return {}
    },
    computed: {
      ...mapModuleState("lokapi", [
        "thisWeektransactions",
        "transactionsLoading",
        "transactionsLoadingError",
      ]),
    },

    methods: {
      dateFormated(badDate: string): string {
        var date = new Date(badDate)
        var options = { weekday: "long", day: "numeric", month: "numeric" }
        const DateFr = new Intl.DateTimeFormat("fr-FR", options).format(date)
        return DateFr
      },
    },
  })
  export default class TransactionListRecent extends Vue {}
</script>
