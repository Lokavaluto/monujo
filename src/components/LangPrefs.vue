<template>
  <div class="main">
    <div class="mb-5 is-flex">
      <div class="is-flex mb-5">
        <div class="switch-centered">
          <label class="switch">
            <input
              type="checkbox"
              :checked="useCustomLanguage"
              @click="switchCustomLanguage"
              ref="langCheckbox"
            />
            <span class="slider round"></span>
          </label>
        </div>
        <div class="mr-1 switch-centered">
          {{ $gettext("Use custom language") }}
        </div>
      </div>
      <div v-if="useCustomLanguage" class="is-flax ml-5">
        <span class="select center">
          <select v-model="userLanguage">
            <option
              v-for="(name, key) in $language.available"
              :key="key"
              :value="key"
            >
              {{ name }}
            </option>
          </select>
        </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { useGettext } from "vue3-gettext"
  @Options({
    name: "LangPrefs",
    components: {},
    props: {
      prefsData: Object,
    },
    data() {
      return {
        useCustomLanguage: false,
        userLanguage: null,
      }
    },
    async mounted() {
      this.userLanguage = (await this.$localSettings.load())?.language

      if (this.userLanguage) {
        this.useCustomLanguage = true
      }
      this.userLanguage = this.userLanguage || this.$language.current
    },
    watch: {
      userLanguage: function (): void {
        this.setCustomLanguage(this.userLanguage)
      },
    },
    methods: {
      setUseCustomLanguage(value: any) {
        this.setCustomLanguage(value ? this.userLanguage : null)
        this.useCustomLanguage = value
        // XXXvlab: nextTick didn't work.
        setTimeout(() => {
          this.$refs.langCheckbox.checked = value
        }, 0)
      },
      switchCustomLanguage(e: any) {
        e.preventDefault()
        this.setUseCustomLanguage(!this.useCustomLanguage)
      },
      async setCustomLanguage(l: string) {
        let settings = (await this.$localSettings.load()) || {}
        settings.language = l
        await this.$localSettings.save(settings)
        await this.$store.dispatch("switchLocale", l)
      },
    },
  })
  export default class LangPrefs extends Vue {}
</script>
<style lang="scss" scoped>
  @import "@/assets/custom-variables";
  @import "@/assets/switch-prefs";

  .custom-card-prefs {
    max-width: 550px;
    margin: auto;
  }
  .switch-centered {
    padding-right: 7px;
  }
  .center {
    position: relative;
    bottom: 5px;
    left: 5px;
  }
</style>
