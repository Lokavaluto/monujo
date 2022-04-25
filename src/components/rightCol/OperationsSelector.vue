<template>
  <h2 class="custom-card-title">Operations</h2>
  <div
    class="x-scroll-disabled tabs is-toggle is-toggle-rounded is-medium custom-tabs-switch-div is-fullwidth"
  >
    <ul class="is-justify-content-space-between">
      <li
        @click="chgOpSlct(0)"
        :class="[activeClass == 0 ? 'custom-is-active' : '']"
        class="custom-tabs-switch"
      >
        <a>Passées </a>
      </li>
      <li
        @click="chgOpSlct(1)"
        :class="[activeClass == 1 ? 'custom-is-active' : '']"
        class="custom-tabs-switch"
      >
        <a>En cours</a>
      </li>
      <li
        @click="chgOpSlct(2)"
        :class="[activeClass == 2 ? 'custom-is-active' : '']"
        class="custom-tabs-switch"
      >
        <a>A venir</a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  // @TODO: il y a un souci, le troisième tab du sélecteur n'apparaît pas (mais est bien rendu dans le DOM)
  @Options({
    name: "OperationsSelector",
    mounted() {
      this.$nextTick(() => {
        // @TODO
        // Ca n'est pas terrible ça...
        // Ce n'est pas une très bonne idée de muter le state du store directement
        // depuis un composant.
        // Mieux vaut passer par un commit (this.$store.commit) ou une action (this.$store.dispatch).
        this.$store.state.OperationsSelector = 0
      })
    },

    computed: {
      activeClass(): number {
        return this.$store.state.OperationsSelector
      },
    },

    methods: {
      chgOpSlct(value: number): void {
        this.$store.state.OperationsSelector = value
        console.log(this.$store.state.OperationsSelector)
      },
    },
  })
  export default class OperationsSelector extends Vue {}
</script>
