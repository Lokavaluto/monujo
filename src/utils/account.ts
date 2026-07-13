type UIAccount = {
  _obj?: {
    getTransactions?: (...args: any[]) => AsyncGenerator<any>
    parent?: any
  }
}

export function getUserAccount(account: UIAccount): any {
  const accountObject = account?._obj

  if (accountObject?.getTransactions) return accountObject
  if (accountObject?.parent?.getTransactions) return accountObject.parent

  throw new TypeError("Unable to resolve user account")
}
