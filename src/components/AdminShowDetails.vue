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
          {{ title }}
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
  import { mapModuleState } from "@/utils/vuex"

  import "vue-loading-overlay/dist/css/index.css"

  import RecipientTechnicalDetails from "./RecipientTechnicalDetails.vue"
  import TransactionList from "./TransactionList.vue"

  @Options({
    name: "AdminShowDetails",
    components: {
      TransactionList,
      RecipientTechnicalDetails,
    },
    computed: {
      ...mapModuleState("lokapi"),

      current() {
        const [opts] = this.$modal.args.value
        return { componentName: opts.componentName, params: opts.params }
      },
    },
    methods: {
      close() {
        this.$modal.close()
      },
      setFocus(refLabel: string) {
        this.$nextTick(() => {
          const ref = this.$refs[refLabel]
          ref.focus()
          ref.select()
        })
      },
    },
  })
  export default class AdminShowDetails extends Vue {}
</script>
<style lang="scss" scoped>
  @import "@/assets/custom-variables";

  .button.action {
    white-space: normal;
    height: auto;
  }
  .card-recipient-wrapper {
    width: 90%;
  }
  .favorit-icon-wrapper {
    width: 10%;
  }
  .modal-card-body {
    min-height: 120px;
  }
  .loader-container {
    position: relative;
    height: 80px;
  }
  .amount-currency-symbol {
    margin: auto;
    font-size: 1.25em;
    font-weight: bold;
    line-height: 1em;
    padding-bottom: calc(0.5em - 1px);
    padding-left: calc(0.75em - 1px);
    padding-right: calc(0.75em - 1px);
    padding-top: calc(0.5em - 1px);
  }
  .w-100 {
    width: 100%;
  }
  .custom-search-bar {
    margin: auto;
  }
  .search-bar-container {
    width: 75%;
  }
  .qrcode-icon {
    font-size: 1.5em;
    opacity: 0.8;
    padding: 0.1em;
    border: 0.2em solid #e8e8e8;
    border-radius: 5px;
  }
  .custom-search-bar input {
    background: #ffffff;
    border: 1px solid #e8e8e8;
    border-radius: 24px;
    width: 100% !important;
  }

  .custom-pictogram-search svg {
    width: 24px !important;
    height: 24px !important;
  }

  .custom-pictogram-search path,
  rect {
    fill: $color-2 !important;
    background: $color-2 !important;
  }

  .custom-button-pictogram {
    background-color: inherit !important;
    border: none;
    cursor: pointer;
  }

  hr.transaction-list-separator {
    margin-top: 0.2em;
    margin-bottom: 0.2em;
  }
  h2 {
    font-weight: 500;
  }
</style>
