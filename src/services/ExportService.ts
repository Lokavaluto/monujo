import { Capacitor, Plugins } from "@capacitor/core"
import { Directory, Encoding } from "@capacitor/filesystem"

const { Filesystem, Share } = Plugins

class ExportService {
  gettext: any

  constructor(gettext: any) {
    this.gettext = gettext
  }

  public async download(
    data: any,
    fileName: string,
    mimetype: string
  ): Promise<any> {
    const platform = Capacitor.getPlatform()
    if (platform === "web") {
      const link = document.createElement("a")
      const url = `data:${mimetype};charset=utf-8,${encodeURIComponent(data)}`
      link.setAttribute("href", url)
      link.setAttribute("download", fileName)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      console.log(`Download is not yet available on ${platform} platform.`)
      // // disabled while searching solution for permission issue
      // // issue: https://github.com/ionic-team/capacitor-plugins/issues/457
      //
      // if (platform === "android") {
      // try {
      //   await Filesystem.writeFile({
      //     path: fileName,
      //     data: data,
      //     directory: Directory.Documents,
      //     encoding: Encoding.UTF8,
      //   })
      // } catch (err: any) {
      //   throw new Error("Unable to download file")
      // }
    }
  }
  public async share(
    data: any,
    fileName: string,
    exportDates: [string, string]
  ): Promise<any> {
    const platform = Capacitor.getPlatform()
    if (platform !== "web") {
      await Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      })

      const fileResult = await Filesystem.getUri({
        directory: Directory.Cache,
        path: fileName,
      })
      const { $gettext } = this.gettext
      const [begin, end] = exportDates
      const message =
        begin && end
          ? $gettext("Transaction list from %{ begin } to %{ end }", {
              begin,
              end,
            })
          : $gettext("Transaction list")

      await Share.share({
        title: message,
        text: message,
        url: fileResult.uri,
        dialogTitle: message,
      })
    } else {
      console.log(`Share is not yet available on ${platform} platform.`)
    }
  }
}

export default ExportService
