//import type { Ref, WatchOptions, WatchSource } from 'vue-demi'
import { ref, computed, watch } from "vue"

function UseModal(): any {
  const modalStack: any = ref([])
  let modalUI: any

  function register(fns: {
    open: (opts: any) => Promise<string>
    close: () => Promise<void>
  }): void {
    modalUI = fns
  }

  async function open(label: string): Promise<void> {
    if (modal.value == label) {
      modalStack.value[stackSize.value - 1] = { label, step: step.value + 1 }
    } else {
      modalStack.value.push({ label, step: 1 })
    }
    if (!modalUI?.show)
      throw new Error("No callback registered to manage modal.")
    await modalUI.show(label, step)
  }

  function next(): void {
    const frame = currentFrame.value
    if (!frame) {
      throw new Error(
        "Unexpected call to useModal.next() with no modal in stack."
      )
    }
    const { label, step } = frame
    modalStack.value[stackSize.value - 1] = { label, step: step + 1 }
  }

  function close(): void {
    const modalName = modal.value
    if (!modalName) {
      throw new Error(
        "Unexpected call to useModal.close() with no modal in stack."
      )
    }
    do {
      back()
    } while (modal.value == modalName)
  }

  function back(): void {
    const frame = currentFrame.value
    if (!frame) {
      throw new Error("Unexpected call to Modal.back() with no modal in stack.")
    }
    const { label, step } = frame
    if (step > 1) {
      modalStack.value[stackSize.value - 1] = { label, step: step - 1 }
    } else {
      modalStack.value.pop()
    }
  }

  const stackSize = computed(() => modalStack.value.length)
  const isActive = computed(() => !!stackSize.value)
  const currentFrame = computed(() =>
    isActive.value ? modalStack.value[stackSize.value - 1] : null
  )
  const step = computed(() => currentFrame.value?.step)
  const modal = computed(() => currentFrame.value?.label)

  const modals = computed(() => modalStack.value.map((f: any) => f.label))

  watch(modal, async (newModal, oldModal) => {
    if (oldModal && modalUI.hide) {
      if (modalStack.value.every((x: any) => x.label != oldModal))
        modalUI.hide(oldModal)
    }
  })

  watch(isActive, async (newActive, oldActive) => {
    if (newActive) {
      document.body.classList.add("is-clipped")
    } else {
      document.body.classList.remove("is-clipped")
    }
  })

  return {
    // Connect UI to service
    register,

    // Actions
    open,
    next,
    back,
    close,

    // Computed
    modal,
    modals,
    step,
    isActive,
  }
}

export default UseModal
