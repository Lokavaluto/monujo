<template>
  <nav
    class="navbar is-fixed-top"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="navbar-brand">
      <router-link
        :to="{ name: 'dashboard' }"
        class="navbar-item"
        @click="showNav = false"
      >
        <img class="is-rounded" :src="$config.logoUrl" />
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
        <router-link to="/carto" class="navbar-item" v-if="hasMapUrl">
          {{ $gettext("Map") }}
        </router-link>
        <template v-if="!isLog">
          <a v-if="helpUrl" :href="helpUrl" class="navbar-item">
            {{ $gettext("Help") }}
          </a>
          <a v-if="cguUrl" :href="cguUrl" class="navbar-item">
            {{ $gettext("Terms of Service") }}
          </a>
          <router-link to="/" class="navbar-item">
            {{ $gettext("Sign in") }}
          </router-link>
        </template>
        <template v-if="isLog">
          <router-link to="/dashboard" class="navbar-item">
            {{ $gettext("Dashboard") }}
          </router-link>
          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link">
              {{ userProfile?.name ? userProfile.name : $gettext("User") }}
            </a>

            <div class="navbar-dropdown is-right">
              <a :href="profilePageUrl" target="_blank" class="navbar-item">
                {{ $gettext("Profile") }}
              </a>
              <router-link
                v-if="hasPreferences"
                to="/preferences"
                class="navbar-item"
              >
                {{ $gettext("Settings") }}
              </router-link>

              <router-link
                v-if="hasUnconfiguredBackend()"
                to="/create-account"
                class="navbar-item"
              >
                {{ $gettext("Create my wallet") }}
              </router-link>

              <hr class="dropdown-divider" />

              <template
                v-if="
                  isLog &&
                  (hasUserAccountValidationRights ||
                    hasCreditRequestValidationRights)
                "
              >
                <router-link
                  v-if="hasUserAccountValidationRights"
                  to="/admin/pending-accounts"
                  class="navbar-item"
                >
                  {{ $gettext("Account requests") }}
                </router-link>
                <router-link
                  v-if="hasCreditRequestValidationRights"
                  to="/admin/pending-credits"
                  class="navbar-item"
                >
                  {{ $gettext("Credit requests") }}
                </router-link>
                <hr class="dropdown-divider" />
              </template>

              <a v-if="helpUrl" :href="helpUrl" class="navbar-item">
                {{ $gettext("Help") }}
              </a>
              <a v-if="cguUrl" :href="cguUrl" class="navbar-item">
                {{ $gettext("Terms of Service") }}
              </a>

              <hr v-if="helpUrl || cguUrl" class="dropdown-divider" />

              <a @click="logout" class="navbar-item">
                {{ $gettext("Sign out") }}
              </a>
            </div>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapModuleState } from "@/utils/vuex"
  import { mapGetters } from "vuex"
  @Options({
    name: "TheNavBar",
    data() {
      return {
        showNav: false,
      }
    },
    methods: {
      logout() {
        this.$store.dispatch("askLogOut")
        this.$router.push({ name: "Login" })
        this.$auth.flush()
      },
    },
    computed: {
      hasPreferences(): boolean {
        return this.$store.state.prefs.componentDefs.length > 0
      },
      profilePageUrl(): string {
        return this.$store.getters.getOdooUrl() + "/web/login"
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

      ...mapModuleState("lokapi", [
        "isLog",
        "hasUserAccountValidationRights",
        "hasCreditRequestValidationRights",
        "userProfile",
      ]),
      ...mapGetters(["hasUnconfiguredBackend"]),
    },
  })
  export default class TheNavBar extends Vue {}
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
        background-color: $top-menu-link-hover-background-color-bg;
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
        background-color: $top-menu-link-background-color-bg;
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
      opacity: 0.3;
    }
  }
  .close-navbar {
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
