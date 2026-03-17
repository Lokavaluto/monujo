<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card" tabindex="0">
      <header class="modal-card-head">
        <span class="is-flex is-flex-shrink-0">
          <a class="mr-3 is-flex" @click="$modal.back()">
            <span class="icon has-text-white">
              <fa-icon icon="arrow-left" class="fa-lg" />
            </span>
          </a>
        </span>

        <p class="modal-card-title is-title-shrink">
          {{ $gettext("Technical infos") }}
        </p>
        <button class="delete" aria-label="close" @click="close()"></button>
      </header>
      <component :is="current.componentName" v-bind="current.params" />
      <footer class="modal-card-foot is-justify-content-flex-end"></footer>
    </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import RecipientTechnicalDetails from "./RecipientTechnicalDetails.vue"

  @Options({
    name: "RecipientTechnicalDetailsModal",
    components: {
      RecipientTechnicalDetails,
    },
    computed: {
      current() {
        const [opts] = this.$modal.args.value
        return { componentName: opts.componentName, params: opts.params }
      },
    },
    methods: {
      close() {
        this.$modal.close()
      },
    },
  })
  export default class RecipientTechnicalDetailsModal extends Vue {}
</script>
<style lang="scss" scoped>
  @import "@/assets/custom-variables";
</style>
