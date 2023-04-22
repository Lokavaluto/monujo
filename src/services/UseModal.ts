//import type { Ref, WatchOptions, WatchSource } from 'vue-demi'
import { ref, computed } from "vue"

function UseModal(): any {
  const modalStack: any = ref([])
  let modalUI: any

  function register(fns: {
    open: (opts: any) => Promise<string>
    close: () => Promise<void>
  }): void {
    modalUI = fns
  }

  async function open(label: string, step = 1): Promise<void> {
    modalStack.value.push({ label, step })
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
    modalStack.value.push({ label, step: step + 1 })
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
    if (!isActive.value) {
      throw new Error("Unexpected call to Modal.back() with no modal in stack.")
    }
    modalStack.value.pop()

    if (!stackSize.value) {
      modalUI.hide()
    }
  }

  const stackSize = computed(() => modalStack.value.length)
  const isActive = computed(() => !!stackSize.value)
  const currentFrame = computed(() =>
    isActive.value ? modalStack.value[stackSize.value - 1] : null
  )
  const step = computed(() => currentFrame.value?.step)
  const modal = computed(() => currentFrame.value?.label)

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
    step,
    isActive,
  }
}

export default UseModal
