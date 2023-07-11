import { Capacitor } from "@capacitor/core"
import { createApp } from "vue"
import { Camera, CameraResultType } from "@capacitor/camera"
import { BarcodeScanner as BarCodeScanner } from "@lokavaluto/barcode-scanner"
import { App as CapacitorApp } from "@capacitor/app"
import { PluginListenerHandle } from "@capacitor/core"
import { UIError } from "../exception"

import ScanQrCode from "@/components/ScanQrCode.vue"
import { StatusBar } from "@capacitor/status-bar"

class QrCodeService {
  gettext: any

  constructor(gettext: any) {
    this.gettext = gettext
  }
  listener: PluginListenerHandle | null = null
  public async startScan(): Promise<any> {
    const app = document.getElementById("app")
    if (!app) {
      throw new Error("No element id 'app' found to insert qrcode ui")
    }
    if (this.listener) {
      console.error("Unexpected qrcode listener still in memory")
      return Promise.resolve()
    }

    this.listener = await CapacitorApp.addListener(
      "backButton",
      ({ canGoBack }) => {
        if (!canGoBack) {
          console.warn("Ignoring unexpected canGoBack false value")
        }

        this.stopScan()
      }
    )

    if (Capacitor.getPlatform() == "ios") await StatusBar.hide()
    const classicContent = document.createElement("div")
    classicContent.id = "classic-content"
    classicContent.style.display = "none"
    classicContent.style.backgroundColor = "black"
    while (app.firstChild) {
      classicContent.appendChild(app.firstChild)
    }
    app.style.backgroundColor = "transparent"
    app.appendChild(classicContent)

    const qrCodeContent = document.createElement("div")
    qrCodeContent.id = "qrcode-content"

    app.appendChild(qrCodeContent)

    const component = createApp(ScanQrCode)
    component.config.globalProperties.$qrCode = this
    component.mount(qrCodeContent)
    qrCodeContent.style.display = "block"
    qrCodeContent.style.height = "fit-content"
    classicContent.style.backgroundColor = "transparent"
    classicContent.style.opacity = "0"
    try {
      return await BarCodeScanner.startScan()
    } catch (err) {
      console.log("popo", err)
      throw err
    }
  }
  public async prepare() {
    await BarCodeScanner.prepare()
  }
  public isActive() {
    return this.listener !== null
  }

  public async stopScan() {
    if (Capacitor.getPlatform() == "ios") await StatusBar.show()
    if (!this.listener) {
      console.error("Unexpected missing qrcode listener")
      return
    }
    this.listener.remove()
    this.listener = null

    try {
      await BarCodeScanner.stopScan()
    } catch (err) {
      console.log(err)
      throw new UIError(this.gettext("Unexpected error occured"), null)
    }

    const app = document.getElementById("app")
    const classicContent = document.getElementById("classic-content")
    const qrCodeContent = document.getElementById("qrcode-content")
    if (!app || !classicContent || !qrCodeContent) {
      throw new UIError(this.gettext("Unexpected error occured"), null)
      return
    }
    while (classicContent.firstChild) {
      app.appendChild(classicContent.firstChild)
    }
    app.style.backgroundColor = ""
    app.removeChild(classicContent)
    app.removeChild(qrCodeContent)
  }

  public async isPermissionGranted(): Promise<any> {
    const platform = Capacitor.getPlatform()
    let permission
    let isPermissionGranted
    if (platform == "android") {
      permission = await Camera.requestPermissions()
      isPermissionGranted = permission.camera === "granted"
    } else if (platform == "ios") {
      permission = await BarCodeScanner.checkPermission({ force: true })
      isPermissionGranted = permission.granted
    } else if (platform === "web") {
      try {
        permission = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        isPermissionGranted = permission.active
      } catch (e: any) {
        throw new UIError(
          "The camera permission is not granted for this website",
          e
        )
        console.log(e)
        return false
      }
    }
    if (platform != "web") {
      if (!isPermissionGranted) {
        const enablePermission = confirm(
          "If you want to grant permission for using your camera, enable it in the app settings."
        )
        if (enablePermission) {
          BarCodeScanner.openAppSettings()
        }
        return false
      }
    }
    return isPermissionGranted
  }
}

export default QrCodeService
