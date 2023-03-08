<template>
  <div>
    <TransactionItem
      v-for="transaction in transactions"
      :key="transaction"
      :transaction="transaction"
    />
  </div>
  <div>
    <div class="transactions-loader-container">
      <loading
        v-model:active="transactionsBatchLoading"
        :can-cancel="false"
        :is-full-page="false"
        :width="30"
        :height="30"
      />
    </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import TransactionItem from "./TransactionItem.vue"
  import { mapModuleState } from "@/utils/vuex"
  import Loading from "vue-loading-overlay"
  @Options({
    name: "TransactionListFull",
    components: {
      TransactionItem,
      Loading,
    },
    computed: {
      ...mapModuleState("lokapi", ["transactions", "transactionsBatchLoading"]),
    },
    methods: {},
  })
  export default class TransactionListFull extends Vue {}
</script>
