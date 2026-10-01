// Completion values are suggestions for an editable field, never credentials.
export function surveyReturnEmail(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const email = value.trim()
  if (
    email.length > 254 ||
    /[\x00-\x1f\x7f]/.test(email) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return undefined
  }
  return email
}

// Keep the return suggestion out of URLs and persistent storage. An empty
// object still marks a deliberate return, so Login does not auto-authenticate.
let pendingReturn: { email?: string } | undefined

export function rememberSurveyReturn(value?: unknown): () => void {
  const result = { email: surveyReturnEmail(value) }
  pendingReturn = result
  return () => {
    // A redirected/aborted navigation must not leak this suggestion to a
    // later login, nor clear a newer return from another form instance.
    if (pendingReturn === result) pendingReturn = undefined
  }
}

export function takeSurveyReturn(): { email?: string } | undefined {
  const result = pendingReturn
  pendingReturn = undefined
  return result
}
