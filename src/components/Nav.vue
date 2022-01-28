<template>
  <nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-item">
        <img
          class="is-rounded"
          style="max-height:none !important"
          src="https://lokavaluto.fr/web/image/res.company/1/logo?unique=2eaba5c"
          width="80"
          height="80"
        />
      </router-link>

      <div
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
        @click="showNav = !showNav"
        :class="{ 'is-active': showNav }"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </div>
    </div>

    <div
      id="navbarBasicExample"
      class="navbar-menu"
      :class="{ 'is-active': showNav }"
    >

      <div class="navbar-end">

        <div v-if="getLog && hasUserAccountValidationRights" class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">
            Admin
          </a>

          <div class="navbar-dropdown is-right">
            <router-link to="/admin/pending-accounts" class="navbar-item">
              Comptes
            </router-link>
          </div>
        </div>

        <div class="navbar-item has-dropdown is-hoverable" v-if="getLog">
          <a class="navbar-link">
            {{ userProfile?.name ? userProfile.name : 'Utilisateur' }}
          </a>

          <div class="navbar-dropdown is-right">
            <a :href="profilePageUrl" target="_blank" class="navbar-item">
              Profil
            </a>
            <router-link v-if="hasUnconfiguredBackend" to="/create-account" class="navbar-item">
              Créer mon portefeuille
            </router-link>

            <hr class="navbar-divider">

            <router-link to="/" @click="logout" class="navbar-item">
              Déconnexion
            </router-link>
          </div>
        </div>

      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  name: "Nav",
  data() {
    return {
      showNav: false
    };
  },
  methods : {
    logout() {
      this.$store.dispatch("askLogOut")
    }
  },
  computed: {
      getLog(): string {
         return this.$store.state.lokapi.isLog
      },
      hasUnconfiguredBackend(): boolean {
        // Display of the account creation button should be displayed only
        // if there's an un-configured backend
        return this.$store.getters.hasUnconfiguredBackend()
      },
      hasUserAccountValidationRights(): boolean {
        return this.$store.state.lokapi.hasUserAccountValidationRights
      },
      userProfile(): string {
        return this.$store.state.lokapi.userProfile
      },
      profilePageUrl(): string {
        return this.$store.getters.getOdooUrl() + '/fr_FR/my/home'
      }
    },
})
export default class Nav extends Vue {}
</script>
