import { ref, Ref } from "vue"

interface UseBatchLoadingOpts<T, AsyncGeneratorFactoryArg> {
  genFactory: (...args: AsyncGeneratorFactoryArg[]) => AsyncGenerator<T>
  needMorePredicate: () => boolean
  filter?: (elt: T) => boolean
  onError?: (e: any) => void
}

function UseBatchLoading<T, AsyncGeneratorFactoryArg>(
  opts: UseBatchLoadingOpts<T, AsyncGeneratorFactoryArg>
): any {
  const { genFactory, needMorePredicate, filter, onError } = opts

  const isNewBatchLoading: any = ref(false)
  const hasNoMoreElements: any = ref(false)
  const elements = ref<T[]>([]) as Ref<T[]>

  const currentGen = ref<AsyncGenerator<T> | null>(null)

  function newGen(...args: AsyncGeneratorFactoryArg[]) {
    elements.value = []
    currentGen.value = genFactory(...args)
    hasNoMoreElements.value = false
    setTimeout(() => getNextElements()) // bootstart filling
  }

  async function getNextElements() {
    if (currentGen.value === null) return
    isNewBatchLoading.value = true

    // Our current generator might be renewed by a call to
    // ``newGen(..)``, we need to cancel this obsolete filling
    // process if this is the case.
    const localCurrentGen = currentGen.value

    while (needMorePredicate()) {
      let next
      try {
        next = await localCurrentGen.next()
      } catch (e) {
        if (localCurrentGen !== currentGen.value) {
          console.warn("Ignored exception from obsolete generator", e)
          return
        }
        isNewBatchLoading.value = false
        if (!onError) throw e
        onError(e)
        return
      }
      if (localCurrentGen !== currentGen.value) {
        console.log("Canceled obsolete element request.")
        return
      }
      if (next.done) {
        currentGen.value = null
        hasNoMoreElements.value = true
        break
      }
      elements.value.push(next.value)
    }
    isNewBatchLoading.value = false
  }

  return {
    // Actions
    newGen,
    getNextElements,

    // ref

    isNewBatchLoading,
    hasNoMoreElements,
    elements,
  }
}

export default UseBatchLoading
