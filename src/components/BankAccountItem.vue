<template>
  <div
    class="account"
    :class="{
      active: account.active && account.isActiveAccount,
      'type-barter': account?._obj?.isBarter && account._obj.isBarter,
    }"
    @click="isSub || isAccountSelected || $emit('accountSelected', account)"
  >
    <div class="custom-inner-card card px-5 py-2 is-flex">
      <div class="is-flex-grow-1 account-title">
        <slot name="name">default name</slot>
        <Badge
          v-if="$config.disableBadges !== true"
          :object="account"
          :toggleRefreshBadge="toggleRefreshBadge"
        />
        <div v-if="isTemporarilyUnavailable" class="account-backend error-msg">
          {{ $gettext("Temporarily unavailable - please refresh") }}
        </div>
        <div v-if="isMultiCurrency && !isSub" class="account-backend">
          {{ account?.backend }}
        </div>
      </div>

      <div class="barter-limits" v-if="account.isBarter">
        <div class="max">
          {{
            barterLimits?.max
              ? numericFormat(parseFloat(barterLimits.max))
              : numericPlaceholder(1000)
          }}
        </div>
        <div class="min">
          {{
            barterLimits?.min
              ? numericFormat(parseFloat(barterLimits.min))
              : numericPlaceholder(-1000)
          }}
        </div>
      </div>
      <div class="is-align-items-center is-flex bal">
        <span
          class="account-bal"
          v-if="
            showInactiveAccountBalance || (account?.active && isActiveAccount)
          "
        >
          {{ numericFormat(parseFloat(account?.bal)) }}
        </span>
        <span class="account-bal inactive" v-else>{{
          numericPlaceholder(10000000)
        }}</span>
        <span class="account-curr ml-1">{{ account?.curr || "--" }}</span>
        <span
          v-if="!disableDropDown"
          :class="{
            hide: !isAccountSelected || isSub || !showSubAccounts,
          }"
        >
          <DropdownMenu
            :object="account"
            @refreshTransaction="refreshTransaction"
            @refreshAccounts="refreshAccounts"
          />
        </span>
      </div>
    </div>
    <div
      class="sub-accounts"
      v-if="
        account?.subAccounts &&
        account.subAccounts.length > 0 &&
        showSubAccounts
      "
    >
      <BankAccountItem
        v-for="account in account.subAccounts"
        :isSub="true"
        accountSelected="false"
        class="mt-4 subaccount"
        @accountSelected="$emit('accountSelected', account)"
        :account="account"
        :showInactiveAccountBalance="showInactiveAccountBalance"
        :toggleRefreshBadge="toggleRefreshBadge"
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
  import { e as LokapiExc } from "@lokavaluto/lokapi-browser"

  import DropdownMenu from "@/components/DropdownMenu.vue"
  import Badge from "@/components/Badge.vue"

  @Options({
    name: "BankAccountItem",
    components: {
      DropdownMenu,
      Badge,
    },
    props: {
      isAccountSelected: Boolean,
      isSub: Boolean,
      account: Object,
      showSubAccounts: Boolean,
      disableDropDown: Boolean,
      showInactiveAccountBalance: Boolean,
      toggleRefreshBadge: Boolean,
    },
    data() {
      return {
        barterLimits: {},
      }
    },
    computed: {
      isTemporarilyUnavailable() {
        return (
          this.account instanceof Array &&
          this.account.length == 1 &&
          this.account[0] instanceof LokapiExc.BackendUnavailableTransient
        )
      },
      isActiveAccount() {
        return this.account.isActiveAccount
      },
      ...mapModuleState("lokapi", ["isMultiCurrency"]),
      ...mapGetters(["numericFormat", "numericPlaceholder"]),
    },
    async mounted() {
      if (this.account.isBarter) {
        const o = this.account._obj
        let min, max
        try {
          ;[min, max] = await Promise.all([o.getLowLimit(), o.getHighLimit()])
        } catch (err) {
          console.error(
            "An unexpected server error occurred while fetching barter limits",
            err
          )
          return
        }
        this.barterLimits = { min, max }
      }
    },
    methods: {
      accountSelected(account: any) {
        this.$emit("accountSelected", account)
      },
      refreshTransaction() {
        this.$emit("refreshTransaction")
      },
      refreshAccounts(retryUntilChange: boolean) {
        this.$emit("refreshAccounts", retryUntilChange)
      },
    },
  })
  export default class BankAccountItem extends Vue {}
</script>
<style lang="scss" scoped>
  @import "../assets/custom-variables";
  .account {
    font-size: 1.2rem;
    cursor: pointer;
  }
  .custom-inner-card {
    container-type: inline-size;
    container-name: card;
  }

  @container card (max-width: 15rem) {
    .account div.barter-limits {
      font-size: 0.5em;
    }
    .account-title,
    .bal {
      font-size: 1rem;
    }
  }
  @container card (max-width: 17rem) {
    .account-title,
    .bal {
      font-size: 1.1rem;
    }
  }
  @container card (max-width: 19rem) {
    .hide {
      width: 0em;
    }
  }

  .sub-accounts {
    margin-left: 1.6em;
  }
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
  .type-barter .account-bal {
    /* border: 0.1em solid $color-2; */
    background-color: $barter-bg-color;
  }
  .account-backend {
    color: $inner-card-text-color-backend;
    font-size: 0.8em;
    font-style: italic;
    opacity: 0.7;
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
  .error-msg {
    font-style: italic;
  }
  .account .account-title {
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
    min-width: 0;
  }
  .account div.pro-badge {
    vertical-align: top;
    margin-left: 0.5em;
    display: inline;
    border-radius: 1em;
    font-size: 0.6em;
    padding: 0em 0.5em;
    background-color: $color-2;
    color: white;
    font-weight: bold;
  }
  .account div.barter-limits {
    font-size: 0.7em;
    display: flex;
    flex-direction: column;
    min-width: 5em;
    padding: 0em 1em;
    margin: auto;

    > div {
      line-height: 1.1em;
      text-align: right;
    }
  }
</style>
