import { createToaster } from "@meforma/vue-toaster"

class ToastService {
  private position = "top"
  private duration = 5000

  private show(
    message: string,
    type: string,
    duration: false | number = this.duration
  ) {
    const toaster = createToaster({
      type,
      position: this.position,
      duration: duration,
    })
    toaster.show(message)
  }
  public error(message: string, duration?: false | number) {
    this.show(message, "error", duration)
  }
  public warning(message: string, duration?: false | number) {
    this.show(message, "warning", duration)
  }
  public success(message: string, duration?: false | number) {
    this.show(message, "success", duration)
  }
  public info(message: string, duration?: false | number) {
    this.show(message, "info", duration)
  }
}

export default new ToastService()
