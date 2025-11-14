<template>
  <span
    v-if="
      !hideAdminButton &&
      hasCreditRequestValidationRights &&
      hasUserAccountValidationRights
    "
    class="icon is-small is-default is-pulled-right is-rounded refresh"
    @click="handleRedirection"
  >
    <fa-icon icon="arrow-circle-up" class="fa-lg" />
  </span>
  <div class="is-flex is-justify-content-flex-start" v-if="recipient">
    <div
      class="mr-2 is-clickable is-align-items-center is-flex recipient-icon"
      :class="[recipient.is_favorite ? 'is-active' : '']"
      @click="toggleFavorite()"
      id="toggle-fav"
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
      <Badge v-if="$config.disableBadges !== true" :object="recipient" />

      <div v-if="!hideBackendId" class="is-size-6 has-text-grey-light">
        {{ `${recipient.backendId}` }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import Badge from "@/components/Badge.vue"

  import { showSpinnerMethod, replaceWithLoader } from "@/utils/showSpinner"
  import { debounceMethod } from "@/utils/debounce"
  import applyDecorators from "@/utils/applyDecorators"
  import { mapModuleState } from "@/utils/vuex"

  import { UIError } from "@/exception"

  @Options({
    name: "RecipientItem",
    components: {
      Badge,
    },
    props: {
      recipient: Object,
      hideBackendId: Boolean,
      hideAdminButton: Boolean,
    },
    computed: {
      ...mapModuleState("lokapi", [
        "isLog",
        "hasUserAccountValidationRights",
        "hasCreditRequestValidationRights",
        "userProfile",
      ]),
    },
    methods: {
      toggleFavorite: applyDecorators(
        [
          debounceMethod,
          showSpinnerMethod(function (this: any) {
            return replaceWithLoader.apply(this, [
              "#toggle-fav",
              "1.2em",
              5,
              true,
            ])
          }),
        ],
        async function (this: any): Promise<void> {
          try {
            await this.recipient.toggleFavorite()
          } catch (err: any) {
            throw new UIError(
              this.$gettext(
                "An unexpected issue occurred while switching this recipient favorite status"
              ),
              err
            )
          }
        }
      ),
      handleRedirection() {
        this.$modal.open("AdminModal", {
          administrativeBackendId: this.recipient.id,
          financialBackendId: this.recipient.internalId,
        })
      },
    },
  })
  export default class RecipientItem extends Vue {}
</script>
<style lang="scss" scoped>
  .recipient-name {
    width: 100%;
  }
  div.badges {
    font-size: 1.2em;
  }
  .recipient-icon {
    position: relative;
  }
</style>
