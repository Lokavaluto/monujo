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
        <span class="is-size-4 has-text-grey-darker account-bal">
          {{
             parseFloat(bal).toLocaleString(
               "fr", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2
               })
          }}
        </span>
      </div>
      <div class="account-curr">
        <span class="is-size-5">{{curr}}</span>
      </div>
      <div class="account-backend" v-if="isMultiCurrency">
        <span class="is-size-6 account-backend">
          {{ backend }}
        </span>
      </div>
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
    },
  computed: {
    isMultiCurrency(): any {
        return this.$store.state.lokapi.isMultiCurrency
    },
  }
})
export default class Acc extends Vue {}
</script>


