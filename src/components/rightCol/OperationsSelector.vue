<template>
    <h2 class="custom-card-title">Operations</h2>
            <div
              class="x-scroll-disabled tabs is-toggle is-toggle-rounded custom-tabs-switch-div"
            >
              <ul class="is-justify-content-space-between">
                <li @click="chgOpSlct(0)" :class="[activeClass == 0 ? 'custom-is-active' : '']" class="custom-tabs-switch">
                  <a>Passées </a>
                </li>
                <li @click="chgOpSlct(1)" :class="[activeClass == 1 ? 'custom-is-active' : '']" class="custom-tabs-switch"><a>En cours</a></li>
                <li @click="chgOpSlct(2)" :class="[activeClass == 2 ? 'custom-is-active' : '']" class="custom-tabs-switch"><a>A venir</a></li>
              </ul>
            </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from 'vuex'
export default defineComponent({
    name:"OperationsSelector",
    setup(): {store:any} {
        const store : any = useStore()
        return {
            store: store
        }
    },
    mounted: function () {
      this.$nextTick(()=> {
        this.store.state.OperationsSelector = 0
      })
    },

    computed: {
      activeClass(): number {
        return this.store.state.OperationsSelector
      },
    },


    methods: {
      chgOpSlct(value:number):void {
        this.store.state.OperationsSelector = value
        console.log(this.store.state.OperationsSelector)
      }
    }
});
</script>