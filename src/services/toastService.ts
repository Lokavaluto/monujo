import { createToaster } from "@meforma/vue-toaster"

class ToastService {
  private position = "top"
  private duration = 5000

  private show(
    message: string,
    type: string,
    duration: boolean | number = this.duration
  ) {
    const toaster = createToaster({
      type,
      position: this.position,
      duration: duration,
    })
    toaster.show(message)
  }
  public error_Persistant(message: string) {
    this.show(message, "error", false)
  }
  public error(message: string) {
    this.show(message, "error")
  }
  public warning(message: string) {
    this.show(message, "warning")
  }
  public success(message: string) {
    this.show(message, "success")
  }
  public info(message: string) {
    this.show(message, "info")
  }
}

export default new ToastService()
