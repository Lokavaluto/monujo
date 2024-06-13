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
        <span :class="{ hide: isSub || !showActions }">
          <div class="dropdown" :class="{ 'is-active': dropDownMenuState }">
            <div class="dropdown-trigger">
              <span
                class="
                  button
                  is-default
                  button-contextual-menu
                  is-pulled-right is-rounded
                  refresh
                  ml-2
                "
                aria-haspopup="true"
                aria-controls="bank-account-menu"
              >
                <span class="icon">
                  <fa-icon class="qrcode-icon" icon="ellipsis-v" />
                </span>
              </span>
            </div>
            <div class="dropdown-menu" id="bank-account-menu" role="menu">
              <div class="dropdown-content">
                <a
                  href="#"
                  class="dropdown-item is-flex"
                  @click="$modal.open('QrCodeModal', { accountId: account.id })"
                >
                  <div class="mr-1">
                    <fa-icon class="qrcode-icon" icon="qrcode" />
                  </div>
                  <div class="ml-1 is-small">{{ $gettext("Qrcode") }}</div>
                </a>
                <a
                  v-if="account.walletData"
                  href="#"
                  class="dropdown-item is-flex"
                  @click="exportWallet()"
                >
                  <div class="mr-1">
                    <fa-icon class="wallet" icon="wallet" />
                  </div>
                  <div class="ml-1 is-small">
                    {{ $gettext("Export wallet") }}
                  </div>
                </a>
              </div>
            </div>
          </div>
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
        :show-actions="false"
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
    unmounted() {
      if (this.handleCloseContextualMenu) {
        document.removeEventListener("click", this.handleCloseContextualMenu)
        this.handleCloseContextualMenu = null
      }
    },
    mounted() {
      const $clickableDropdowns = this.$el.querySelectorAll(
        ".dropdown:not(.is-hoverable)"
      )
      if ($clickableDropdowns.length > 0) {
        $clickableDropdowns.forEach(($dropdown: any) => {
          $dropdown
            .querySelector(".button-contextual-menu")
            .addEventListener("click", (event: any) => {
              event.stopPropagation()
              $dropdown.classList.toggle("is-active")
            })
        })
        this.handleCloseContextualMenu = () => {
          $clickableDropdowns.forEach(($el: any) => {
            $el.classList.remove("is-active")
          })
        }
        document.addEventListener("click", this.handleCloseContextualMenu)
      }
    },
    methods: {
      async exportWallet() {
        const wallet = this.account.walletData
        const mkFilename = (a: any) =>
          `${a.curr}_${a.backend}_${a.userAccountId.split(":")[1]}.json`
        const filename = mkFilename(this.account)
        try {
          await this.$export.download(
            JSON.stringify(wallet, null, 4),
            filename,
            "text/dat"
          )
        } catch (err) {
          throw new UIError(
            this.$gettext("The wallet could not be downloaded"),
            err
          )
        }
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
  .dropdown-item {
    font-size: inherit;
    -webkit-user-select: none; /* Chrome, Safari, Opera */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Standard syntax */
  }
  .dropdown-menu {
    @media screen and (max-width: 768px) {
      position: absolute;
      right: 0em;
      left: unset;
    }
  }
</style>
