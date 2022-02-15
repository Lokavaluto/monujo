<template>
  <div
    class="account card custom-inner-card custom-card-padding is-flex is-justify-content-space-between is-align-items-center mb-4"
  >
    <div class="account-name">
      <span class="is-size-5">
        <slot name="name">default name</slot>
      </span>
    </div>
    <div class="account-bal">
      <span class="is-size-4 has-text-grey-darker account-bal" v-if="active">
        {{
          parseFloat(bal).toLocaleString(
            "fr", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
        }}
      </span>
      <span class="is-size-4 account-bal inactive" v-else>-.---,--</span>
      <span class="is-size-5 account-curr">{{curr}}</span>
    </div>
    <div class="account-backend" v-if="isMultiCurrency">
      <span class="is-size-6 account-backend" v-if="!isSub">
        {{ backend }}
      </span>
    </div>
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


