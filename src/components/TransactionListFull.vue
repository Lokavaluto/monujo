<template>
  <div>
    <TransactionItem
      v-for="transaction in transactions"
      :key="transaction"
      :transaction="transaction"
    />
  </div>
</template>
<script lang="ts">
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
    },
    methods: {},
  })
  export default class TransactionListFull extends Vue {}
</script>
