// This exception is meant to trigger a general level error.
export class UIError extends Error {
  origException: any
  constructor(message: string, origException: any) {
    super(message)
    this.name = "UIError"
    this.origException = origException
  }
}
