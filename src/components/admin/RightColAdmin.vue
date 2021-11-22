<template>
    <div class="right-column column is-half">
        <WalletValidation/>
    </div>
</template>

<script lang="ts">
    import WalletValidation from "../rightColAdmin/WalletValidation.vue"
    export default {
        name: "RightColAdmin",
        components: {
            WalletValidation,
        }
    };
</script>