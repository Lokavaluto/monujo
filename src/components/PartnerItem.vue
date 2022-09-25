<template>
  <div
    class="is-flex is-justify-content-flex-start"
    v-if="partner"
  >
    <div
      class="pr-3 is-clickable is-align-items-center is-flex"
      :class="[partner.is_favorite ? 'is-active' : '']"
      @click="partner.toggleFavorite()"
    >
      <span class="icon">
        <fa-icon
          :class="!partner.is_favorite ? 'has-text-grey-light' : ''"
          :icon="
            partner.is_favorite ? 'fa fa-star' : 'far fa-star'
          "
        />
      </span>
    </div>
    <div
      class="partner-name is-size-5"
      @click="$emit('select', partner)"
    >
      {{ partner.name }}
      <div v-if="partner.markBackend" class="is-size-6 has-text-grey-light">
        {{ `${partner.backendId}` }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import moment from "moment"

  @Options({
    name: "PartnerItem",
    props: {
      partner: Object,
    },
  })
  export default class PartnerItem extends Vue {}
</script>
<style lang="scss" scoped>
  .partner-name {
    width: 100%;
  }
</style>
