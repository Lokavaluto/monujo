<template>
  <div
    class="card custom-inner-card custom-card-padding is-flex is-justify-content-space-between is-align-items-center mb-4"
    >
      <div>
        <span class="is-size-5">
          <slot name="name">default name</slot>
        </span>
      </div>
      <div>
        <span class="is-size-4 has-text-grey-darker">{{bal}} {{curr}}</span>
      </div>
      <div>
        <button disabled class="button custom-button is-rounded action">Voir</button>
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
        curr:String
    }
})
export default class Acc extends Vue {}
</script>