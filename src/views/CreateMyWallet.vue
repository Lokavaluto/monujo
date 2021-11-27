<template>
    <section>
        <CreateWallet />
    </section>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import CreateWallet from '@/components/CreateWallet.vue'; // @ is an alias to /src

@Options({
  components: {
    CreateWallet,
  },
})
export default class CreateMyWallet extends Vue {}
</script>
