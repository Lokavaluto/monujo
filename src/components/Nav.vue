<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
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

      <a
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu">
      <div class="navbar-start">
        <router-link to="/" class="navbar-item">
          Accueil
        </router-link>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <router-link to="/register" class="button is-primary">
              <strong>S'inscrire</strong>
            </router-link>
            <router-link to="/login" class="button is-light">
              Se connecter
            </router-link>
               <router-link to="/profile" class="button is-light">
              Profile
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
export default {
  name: "Nav",
};
</script>