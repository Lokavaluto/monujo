<template>
     <!-- début card envoyer et demander de l'argent  -->
      <div
        class="action-footer card custom-card is-flex is-justify-content-space-evenly is-align-items-center pb-5 pt-5 "
      >
        <div class="is-flex is-justify-content-center">
          <button
            class="button custom-button custom-button-send-receive-money is-rounded action"
          >
            Envoyer de l'argent
          </button>
        </div>
        <div class="is-flex is-justify-content-center">
          <button
            class="button custom-button custom-button-send-receive-money is-rounded action"
          >
            Demander de l'argent
          </button>
        </div>
      </div>
      <!-- fin card envoyer et demander de l'argent  -->
</template>

<script>
export default {
    name:"SendAskMoney"
}
</script>