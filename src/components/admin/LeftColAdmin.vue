<template>
    <div class="left-column column is-half">
        <CreditValidation/>
    </div>
</template>

<script lang="ts">
    import CreditValidation from "../leftColAdmin/CreditValidation.vue"
    export default {
        name: "LeftColAdmin",
        components: {
            CreditValidation,
        }
    };
</script>