// Promise.allSettled
Promise.allSettled =
  Promise.allSettled ||
  ((promises: any) =>
    Promise.all(
      promises.map((p: any) =>
        p
          .then((value: any) => ({
            status: "fulfilled",
            value,
          }))
          .catch((reason: any) => ({
            status: "rejected",
            reason,
          }))
      )
    ))

// AbortSignal.throwIfAborted
;(function () {
  if (
    typeof AbortSignal !== "undefined" &&
    !AbortSignal.prototype.throwIfAborted
  ) {
    const makeAbortError = (cause?: any) => {
      try {
        const err = new DOMException("The operation was aborted.", "AbortError")
        if (cause !== undefined) {
          try {
            Object.defineProperty(err, "cause", {
              value: cause,
              configurable: true,
            })
          } catch {}
        }
        return err
      } catch {
        const err = new Error("The operation was aborted.")
        err.name = "AbortError"
        if (cause !== undefined) err.cause = cause
        return err
      }
    }

    AbortSignal.prototype.throwIfAborted = function () {
      if (!this.aborted) return
      // Spec behavior: throw the *existing reason* if present; else AbortError DOMException
      const r = this.reason
      if (r === undefined) throw makeAbortError()
      throw r
    }
  }
})()
