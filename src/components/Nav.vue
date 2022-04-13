<template>
  <nav
    class="navbar is-fixed-top"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="navbar-brand">
      <router-link :to="{ name: 'dashboard' }" class="navbar-item" @click="showNav = false">
        <img
          class="is-rounded"
          :src="$config.logoUrl"
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
      @click="showNav = false"
    >
      <div class="burger-menu-overlay" v-if="showNav"></div>
      <div class="navbar-end">
        <router-link to="/dashboard" class="navbar-item" v-if="getLog">
          Tableau de bord
        </router-link>
        <router-link to="/carto" class="navbar-item" v-if="hasMapUrl"> Carte </router-link>
        <router-link to="/" class="navbar-item" v-if="!getLog">
          Se connecter
        </router-link>
        <div class="navbar-item has-dropdown is-hoverable" v-if="getLog">
          <a class="navbar-link">
            {{ userProfile?.name ? userProfile.name : "Utilisateur" }}
          </a>

          <div class="navbar-dropdown is-right">
            <a :href="profilePageUrl" target="_blank" class="navbar-item">
              Profil
            </a>
            <router-link
              v-if="hasUnconfiguredBackend"
              to="/create-account"
              class="dropdown-item"
            >
              Créer mon portefeuille
            </router-link>

            <hr class="dropdown-divider" />

            <template v-if="getLog && (hasUserAccountValidationRights || hasCreditRequestValidationRights)">
              <router-link
                v-if="hasUserAccountValidationRights"
                to="/admin/pending-accounts"
                class="dropdown-item"
              >
                Demandes de comptes
              </router-link>
              <router-link
                v-if="hasCreditRequestValidationRights"
                to="/admin/pending-credits"
                class="dropdown-item"
              >
                Demandes de crédit
              </router-link>
              <hr class="dropdown-divider" />
            </template>

            <a v-if="helpUrl" :href="helpUrl" class="dropdown-item"> Aide </a>
            <a v-if="cguUrl" :href="cguUrl" class="dropdown-item"> CGU </a>

            <hr v-if="helpUrl || cguUrl" class="dropdown-divider" />

            <a @click="logout" class="dropdown-item"> Déconnexion </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component";

  @Options({
    name: "Nav",
    data() {
      return {
        showNav: false,
      };
    },
    methods: {
      logout() {
        this.$store.dispatch("askLogOut");
        this.$router.push({ name: "Login" });
      },
    },
    computed: {
      getLog(): string {
        return this.$store.state.lokapi.isLog;
      },
      hasUnconfiguredBackend(): boolean {
        // Display of the account creation button should be displayed only
        // if there's an un-configured backend
        return this.$store.getters.hasUnconfiguredBackend();
      },
      hasUserAccountValidationRights(): boolean {
        return this.$store.state.lokapi.hasUserAccountValidationRights;
      },
      hasCreditRequestValidationRights(): boolean {
        return this.$store.state.lokapi.hasCreditRequestValidationRights
      },
      userProfile(): string {
        return this.$store.state.lokapi.userProfile;
      },
      profilePageUrl(): string {
        return this.$store.getters.getOdooUrl() + "/web/login";
      },
      hasMapUrl(): string {
        return this.$config.mapUrl
      },
      helpUrl(): string {
        return this.$config.helpUrl
      },
      cguUrl(): string {
        return this.$config.cguUrl
      },
    },
  })
  export default class Nav extends Vue {}
</script>
<style lang="scss" scoped>
@import "../assets/custom-variables";

.navbar {
  background-color: $top-menu-background-color;

  .navbar-item,
  .navbar-item:visited,
  .navbar-link,
  .navbar-link:visited {
    color: $top-menu-link-color;
    background-color: $top-menu-link-background-color;

    &:hover {
      color: $top-menu-link-hover-color;
      background-color: lighten($top-menu-link-hover-background-color, 5%);
    }
  }
  .navbar-menu {
    background-color: $top-menu-link-background-color;
  }

  .navbar-burger span,
  .navbar-burger.is-active span {
    background-color: $top-menu-link-color;
  }

  .navbar-dropdown {
    background: $top-menu-background-color;

    .navbar-divider {
      background-color: $top-menu-dropdown-divider-color;
    }
  }
  .navbar-item.has-dropdown .navbar-link,
  .navbar-item.has-dropdown:visited .navbar-link {
    background-color: $top-menu-link-background-color;

    &:hover {
      background-color: lighten($top-menu-link-background-color, 5%);
    }
  }
}

@media screen and (max-width: 1023px) {
   .burger-menu-overlay {
      position: fixed;
      left: 0;
      top: 45.5px;
      right: 0;
      bottom: 0;
      z-index: -1;
      background: black;
      opacity: .3;
  }
}
.close-navbar{
  display: none !important;
}
.navbar-item {
  &.has-dropdown {
    .navbar-link::after {
      border-color: inherit;
    }
  }
}
 
</style>
