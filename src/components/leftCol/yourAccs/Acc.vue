<template>
  <div
    class="account card custom-inner-card custom-card-padding mb-4"
  >
    <span class="account-name">
      <span class="is-size-6-mobile is-size-5-tablet">
        <slot name="name">default name</slot>
      </span>
    </span>
    <span class="account-backend is-size-6-mobile account-backend" v-if="isMultiCurrency && !isSub">
      - {{ backend }}
    </span>
    <span class="is-pulled-right">
      <span class="is-size-6-mobile is-size-4-tablet account-bal" v-if="active">
        {{
          parseFloat(bal).toLocaleString(
            "fr", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
        }}
      </span>
      <span class="is-size-6-mobile is-size-4-tablet account-bal inactive" v-else>-.---,--</span>
      <span class="is-size-6-mobile is-size-5-tablet account-curr">{{curr}}</span>
    </span>
    <div class="is-clearfix"></div>
  </div>
  <div class="sub-accounts" v-if="subAccounts && subAccounts.length > 0">
    <Acc v-for="account in subAccounts"
         :bal="account.bal"
         :curr="account.curr"
         :backend="account.backend"
         :type="account.type"
         :active="account.active"
         :isSub="true"
    >
      <template v-slot:name>{{ account.name }}</template>
    </Acc>
  </div>

</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';

  @Options({
    name:"Acc",
    props: {
      name:String,
      bal:Number,
      curr:String,
      backend:String,
      type:String,
      active:Boolean,
      subAccounts: Array,
      isSub: Boolean,
    },
    computed: {
      isMultiCurrency(): any {
        return this.$store.state.lokapi.isMultiCurrency
      },
    }
  })
  export default class Acc extends Vue {}
</script>
<style lang="scss" scoped>
@import "../../../assets/custom-variables";

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
  color: darken($inner-card-text-color, 15%);
}
</style>

