<template>
  <div>
    <div class="action-footer">
      <div class="columns is-mobile menu">
        <div class="column has-text-centered mb-2">
          <button
            :disabled="!hasActiveMoneyAccount"
            @click="
              ;(showTransferModal = true), $store.commit('setModalState', true)
            "
            class="button custom-button is-payer has-text-weight-medium is-rounded action"
          >
            <span class="icon-text">
              <span class="icon">
                <i class="fas fa-lg fa-arrow-circle-up"></i>
              </span>
              <span>Payer</span>
            </span>
          </button>
        </div>
        <div class="column has-text-centered mb-2">
          <button
            :disabled="true"
            class="button custom-button is-recevoir has-text-weight-medium is-rounded action"
          >
            <span class="icon-text">
              <span class="icon">
                <i class="fas fa-lg fa-arrow-circle-down"></i>
              </span>
              <span>Recevoir</span>
            </span>
          </button>
        </div>
        <div class="column has-text-centered mb-2">
          <button
            :disabled="!hasActiveMoneyAccount"
            class="button custom-button is-recharger has-text-weight-medium is-rounded action"
            @click="
              ;(showCreditModal = true), $store.commit('setModalState', true)
            "
          >
            <span class="icon-text">
              <span class="icon">
                <i class="fas fa-lg fa-plus-circle"></i>
              </span>
              <span>Recharger</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <money-transfer-modal
      v-if="showTransferModal"
      @close="
        ;(showTransferModal = false), $store.commit('setModalState', false)
      "
    />

    <money-credit-modal
      v-if="showCreditModal"
      @close=";(showCreditModal = false), $store.commit('setModalState', false)"
    />
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import MoneyTransferModal from "./MoneyTransferModal.vue"
  import MoneyCreditModal from "./MoneyCreditModal.vue"

  @Options({
    name: "TheDashboardFooter",
    components: {
      MoneyTransferModal,
      MoneyCreditModal,
    },
    data() {
      return {
        showTransferModal: false,
        showCreditModal: false,
      }
    },
    computed: {
      hasActiveMoneyAccount(): boolean {
        return this.$store.getters.activeVirtualAccounts.length > 0
      },
    },
  })
  export default class TheDashboardFooter extends Vue {}
</script>

<style scoped lang="sass"></style>