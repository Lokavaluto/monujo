import { Capacitor, Plugins } from "@capacitor/core"
import { Directory, Encoding } from "@capacitor/filesystem"

const { Filesystem, Share } = Plugins

class ExportService {
  public async download(data: any, fileName: string, mimetype: string) {
    if (Capacitor.getPlatform() === "web") {
      const link = document.createElement("a")
      const url = `data:${mimetype};charset=utf-8,${encodeURIComponent(data)}`
      link.setAttribute("href", url)
      link.setAttribute("download", fileName)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (Capacitor.getPlatform() === "android") {
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        })
      } catch (err) {
        throw new Error("Unable to download file")
      }
    }
  }
  public async share(data: any, fileName: string) {
    if (Capacitor.getPlatform() !== "web") {
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

      await Share.share({
        title: "liste des transactions",
        text: "liste des transactions",
        url: fileResult.uri,
        dialogTitle: "liste des transactions",
      })
    }
  }
}

export default new ExportService()
