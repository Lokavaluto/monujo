<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-title-shrink">
          {{ $gettext("About ") }}{{ this.appName }}
        </p>
        <button
          class="delete"
          aria-label="close"
          @click="$emit('close'), $store.commit('setModalState', false)"
        ></button>
      </header>

      <section class="modal-card-body">
        <div>
          <div v-if="$config.logoUrl" class="app-version mb-4">
            <img class="app-img" :src="$config.logoUrl" />
          </div>
          <div class="app-version mb-3" v-html="versionText"></div>
          <p align="justify" v-html="modalText"></p>
        </div>
      </section>
      <footer
        class="
          modal-card-foot
          custom-modal-card-foot
          is-justify-content-flex-end
        "
      ></footer>
    </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  let modalText: any

  function replaceWithHtml(str: string, replacements: any) {
    return str.replaceAll(
      /%%([a-zA-Z0-9_-]+)%%/g,
      (match: any, p1: string) =>
        (replacements as { [index: string]: string })[p1]
    )
  }

  @Options({
    name: "AboutModal",
    data() {
      return {
        appName: "",
        appVersion: "",
      }
    },
    mounted() {
      this.appName = this.$appInfo.appName
      this.appVersion = this.$appInfo.appVersion

      const replacements = {
        appName: `<strong>${this.appName}</strong>`,
        appVersion: `<strong>${this.appVersion}</strong>`,
        organizationName: `<a href='https://lokavaluto.fr/' target='_blank'
                                    ><strong>Lokavaluto</strong
                                ></a>`,
      }

      this.versionText = replaceWithHtml(
        this.$gettext("%{ appName } version %{ appVersion }", {
          appName: "%%appName%%",
          appVersion: "%%appVersion%%",
        }),
        replacements
      )
      this.modalText = replaceWithHtml(
        this.$gettext(
          "%{ appName } is designed by %{ organizationName } " +
            "an association whose goal is to develop, implement," +
            " and support the deployment of evolving and open-source" +
            " information systems for organizations promoting local " +
            "economic development.",
          {
            appName: "%%appName%%",
            organizationName: "%%organizationName%%",
          }
        ),
        replacements
      )
    },
    computed: {},
    methods: {},
  })
  export default class AboutModal extends Vue {}
</script>
