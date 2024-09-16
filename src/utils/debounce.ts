export function debounceMethod<
  T extends (this: any, ...args: any[]) => Promise<any>
>(fn: T): T {
  const promiseMapKey = Symbol("__debouncePromiseMap__")

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    if (!this[promiseMapKey]) {
      this[promiseMapKey] = new Map<string, ReturnType<T>>()
    }

    const argsKey = JSON.stringify(args)

    if (!this[promiseMapKey].has(argsKey)) {
      const promise = (async () => {
        try {
          return await fn.apply(this, args)
        } finally {
          this[promiseMapKey].delete(argsKey)
        }
      })()

      this[promiseMapKey].set(argsKey, promise)
    } else {
      console.trace(`Debounced call`)
    }

    return this[promiseMapKey].get(argsKey)
  } as unknown as T
}

export function debounce(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  return debounceMethod(descriptor.value)
}
