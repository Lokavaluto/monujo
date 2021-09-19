<template>
  <div
    class="card custom-inner-card custom-card-padding is-flex is-justify-content-space-around is-align-items-center mb-4"
    >
      <h3 class="custom-card-content-2">
        <slot name="name">
          default name
        </slot>
      </h3>
      <h3 class="custom-card-content">{{bal}} {{curr}}</h3>
      <button disabled class="button custom-button is-rounded action">
        Voir
      </button>
    </div>
</template>

<script>
export default {
    name:"Acc",
    props: {
        name:String,
        bal:Number,
        curr:String
    }
}
</script>