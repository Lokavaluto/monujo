<template>
  <div
    class="account"
    :class="{ active: account.active }"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    @click="$emit('accountSelected', account)"
  >
    <div class="custom-inner-card card px-5 py-2 is-flex">
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
          v-if="!isSub && showSubAccounts"
          :class="{ hide: !isAccountSelected && !hover }"
        >
          <DropdownMenu
            v-if="$dropdownMenu.listItems(account).length > 1"
            :object="account"
            :isAccountSelected="isAccountSelected"
            @refreshTransaction="refreshTransaction"
            @accountSelected="accountSelected"
          />
          <span
            v-if="$dropdownMenu.listItems(account).length === 1"
            class="
              button
              is-default
              button-contextual-menu
              is-pulled-right is-rounded
              refresh
              ml-2
            "
            aria-haspopup="true"
            aria-controls="dropdown-menu3"
            @click="
              $dropdownMenu.listItems(account)[0].action(refreshTransaction)
            "
          >
            <span class="icon">
              <fa-icon
                class="qrcode-icon"
                :icon="$dropdownMenu.listItems(account)[0].icon"
              />
            </span>
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
        accountSelected="false"
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
  import { UIError } from "../exception"
  import DropdownMenu from "@/components/DropdownMenu.vue"
  @Options({
    name: "BankAccountItem",
    components: {
      DropdownMenu,
    },
    props: {
      isAccountSelected: Boolean,
      isSub: Boolean,
      account: Object,
      showSubAccounts: Boolean,
    },
    data() {
      return {
        hover: false,
      }
    },
    computed: {
      ...mapModuleState("lokapi", ["isMultiCurrency"]),
      ...mapGetters(["numericFormat"]),
    },
    methods: {
      accountSelected(account: any) {
        this.$emit("accountSelected", account)
      },
      refreshTransaction() {
        this.$emit("refreshTransaction")
      },
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
