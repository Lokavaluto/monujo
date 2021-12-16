<template>
  <!-- début card semaine dernière -->
  <div class="mt-6">
    <TransactionSubCard
      v-for="transaction in getTrs"
      :key="transaction.jsonData"
      :amount="transaction.jsonData.amount"
      :symbol="transaction.jsonData.currency"
      :desc="transaction.jsonData.description"
      :date="dateFormated(transaction.jsonData.date)"
      :unformatedDate="transaction.jsonData.date"
      :name="transaction.jsonData.relatedUser.display"
      picto="QR"
    />
  </div>

  <!-- fin card semaine dernière -->
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import TransactionSubCard from "./TransactionSubCard.vue";

@Options({
  name: "LastWeek",
  components: {
    TransactionSubCard,
  },
  computed: {
    getTrs(): number {
      return this.$store.state.lokapi.transactions;
    },
  },

  methods: {
    dateFormated(badDate: string): string {
      var date = new Date(badDate);
      var options = { weekday: "long", day: "numeric", month: "numeric" };
      // eslint-disable-next-line
      //@ts-ignore-next-line
      const DateFr = new Intl.DateTimeFormat("fr-FR", options).format(date);
      return DateFr;
    },
  },
})
export default class LastWeek extends Vue {}
</script>
