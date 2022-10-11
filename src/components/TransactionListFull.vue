<template>
  <div>
    <TransactionItem
      v-for="transaction in transactions"
      :key="transaction"
      :amount="transaction.amount"
      :symbol="transaction.currency"
      :desc="transaction.description"
      :date="dateFormat(transaction.date)"
      :unformatedDate="transaction.date"
      :name="transaction.related"
      picto="QR"
    />
  </div>
</template>
<script lang="ts">
  import { mapGetters } from "vuex"

  import { Options, Vue } from "vue-class-component"
  import TransactionItem from "./TransactionItem.vue"
  import { mapModuleState } from "@/utils/vuex"
  @Options({
    name: "TransactionListFull",
    components: {
      TransactionItem,
    },
    computed: {
      ...mapModuleState("lokapi", ["transactions"]),
      ...mapGetters(["dateFormat"]),
    },
    methods: {},
  })
  export default class TransactionListFull extends Vue {}
</script>
