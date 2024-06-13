<template>
  <div class="account" :class="{ active: account.active }">
    <div
      class="custom-inner-card card px-5 py-2 is-flex"
      @click="$emit('accountSelected', account)"
    >
      <div class="is-size-5 is-flex-grow-1">
        <slot name="name">default name</slot>
        <div v-if="isMultiCurrency && !isSub" class="account-backend is-size-6">
          {{ account.backend }}
        </div>
      </div>
      <div class="is-align-items-center is-flex">
        <span
          class="is-size-6-mobile is-size-4-tablet account-bal"
          v-if="account.active"
        >
          {{ numericFormat(parseFloat(account.bal)) }}
        </span>
        <span
          class="is-size-6-mobile is-size-4-tablet account-bal inactive"
          v-else
          >-.---,--</span
        >
        <span class="is-size-6-mobile is-size-5-tablet account-curr">{{
          account.curr
        }}</span>
        <span
          :class="{
            hide: !qrcode,
          }"
          class="button is-default is-pulled-right is-rounded refresh ml-2"
        >
          <span
            class="icon is-small"
            @click="$modal.open('QrCodeModal', { accountId: account.id })"
          >
            <fa-icon class="qrcode-icon" icon="qrcode" />
          </span>
        </span>
      </div>
    </div>

    <div
      class="sub-accounts"
      v-if="
        account.subAccounts && account.subAccounts.length > 0 && showSubAccounts
      "
    >
      <BankAccountItem
        v-for="account in account.subAccounts"
        :isSub="true"
        class="mt-4 subaccount"
        @accountSelected="$emit('accountSelected', account)"
        :account="account"
      >
        <template v-slot:name>{{ account.name() }}</template>
      </BankAccountItem>
    </div>
  </div>
</template>

<script lang="ts">
  import { mapGetters } from "vuex"
  import { Options, Vue } from "vue-class-component"
  import { mapModuleState } from "@/utils/vuex"

  @Options({
    name: "BankAccountItem",
    props: {
      showActions: Boolean,
      isSub: Boolean,
      account: Object,
      showSubAccounts: Boolean,
    },
    data() {
      return {
        dropDownMenuState: false,
      }
    },
    computed: {
      ...mapModuleState("lokapi", ["isMultiCurrency"]),
      ...mapGetters(["numericFormat"]),
    },
  })
  export default class BankAccountItem extends Vue {}
</script>
<style lang="scss" scoped>
  @import "../assets/custom-variables";

  .account-name,
  .account-bal,
  .account-curr {
    color: $inner-card-text-color;
  }
  .account-bal {
    color: $inner-card-label-text-color;
    background-color: $inner-card-label-background-color;
    border-radius: 20px;
    padding: 0 0.5em;
  }
  .account-backend {
    color: $inner-card-text-color-backend;
  }
  .custom-inner-card {
    border-radius: 43px !important;
    background-color: $inner-card-background-color;
    border: 1px solid $inner-card-border-color;
  }
  .account:not(.subaccount) {
    &:not(.active) {
      opacity: 0.6;
      .custom-inner-card {
        border: 2px #eee solid;
        box-shadow: none;
      }
    }

    &.selected {
      background-color: transparent;
    }
    &:not(.selected) {
      .custom-inner-card {
        opacity: 0.8;
        border: 1px #eee solid;
      }
    }
  }
</style>
