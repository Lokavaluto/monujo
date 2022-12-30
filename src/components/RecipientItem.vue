<template>
  <div class="is-flex is-justify-content-flex-start" v-if="recipient">
    <div
      class="pr-3 is-clickable is-align-items-center is-flex"
      :class="[recipient.is_favorite ? 'is-active' : '']"
      @click="recipient.toggleFavorite()"
    >
      <span class="icon">
        <fa-icon
          :class="!recipient.is_favorite ? 'has-text-grey-light' : ''"
          :icon="recipient.is_favorite ? 'fa fa-star' : 'far fa-star'"
        />
      </span>
    </div>
    <div class="recipient-name is-size-5" @click="$emit('select', recipient)">
      {{ recipient.name }}
      <div v-if="recipient.markBackend" class="is-size-6 has-text-grey-light">
        {{ `${recipient.backendId}` }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import moment from "moment"

  @Options({
    name: "RecipientItem",
    props: {
      recipient: Object,
    },
  })
  export default class RecipientItem extends Vue {}
</script>
<style lang="scss" scoped>
  .recipient-name {
    width: 100%;
  }
</style>
