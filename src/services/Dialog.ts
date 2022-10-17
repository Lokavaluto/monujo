
export default class Dialog {
  fn: null | ((opts: any) => Promise<string>) = null
  
  public register(fn: (opts: any) => Promise<string>): void {
    this.fn = fn
  }

  public install(app: any): void {
    app.config.globalProperties.$dialog = this
  }

  public async show(opts: any): Promise<string> {
    if (!this.fn)
      throw new Error("No callback registered to manage dialog.")
    return await this.fn(opts)
  }
}
