<template>
  <div class="account" :class="{ active }">
    <div
      class="custom-inner-card card px-5 py-2 is-flex"
      @click="$emit('accountSelected', account)"
    >
      <div class="is-size-5 is-flex-grow-1">
        <slot name="name">default name</slot>
        <div v-if="isMultiCurrency && !isSub" class="account-backend is-size-6">
          {{ backend }}
        </div>
      </div>
      <div class="is-align-items-center is-flex">
        <span
          class="is-size-6-mobile is-size-4-tablet account-bal"
          v-if="active"
        >
          {{ numericFormat(parseFloat(bal)) }}
        </span>
        <span
          class="is-size-6-mobile is-size-4-tablet account-bal inactive"
          v-else
          >-.---,--</span
        >
        <span class="is-size-6-mobile is-size-5-tablet account-curr">{{
          curr
        }}</span>
        <span
          :class="{
            hide: !qrcode,
          }"
          class="button is-default is-pulled-right is-rounded refresh ml-2"
        >
          <span
            class="icon is-small"
            @click="$modal.open('QrCodeModal', { accountId: id })"
          >
            <fa-icon class="qrcode-icon" icon="qrcode" />
          </span>
        </span>
      </div>
    </div>

    <div class="sub-accounts" v-if="subAccounts && subAccounts.length > 0">
      <BankAccountItem
        v-for="account in subAccounts"
        :bal="account.bal"
        :curr="account.curr"
        :backend="account.backend"
        :type="account.type"
        :active="account.active"
        :isSub="true"
        class="mt-4 subaccount"
        @accountSelected="$emit('accountSelected', account)"
        :qrcode="false"
        :id="id"
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
      name: String,
      bal: Number,
      curr: String,
      backend: String,
      type: String,
      active: Boolean,
      subAccounts: Array,
      isSub: Boolean,
      qrcode: Boolean,
      id: Object,
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
