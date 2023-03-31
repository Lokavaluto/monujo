export default function PasswordUtilsFactory(gettext: any) {
  const { $gettext, $ngettext } = gettext
  return {
    translatePwdFieldErrors(errors: string[]) {
      return errors.map((e: string) => {
        if (e.indexOf("tooShort") > -1) {
          const [_, nbChar] = e.split(":")
          const msgSizePassword = $ngettext(
            "%{ nbChar } character",
            "%{ nbChar } characters",
            parseInt(nbChar),
            {
              nbChar,
            }
          )
          return $gettext(
            "Password must be at least %{ msgSizePassword } long",
            {
              msgSizePassword,
            }
          )
        } else if (e === "noLowerCase") {
          return $gettext(
            "Password should use at least one lowercase character"
          )
        } else if (e === "noUpperCase") {
          return $gettext(
            "Password should use at least one uppercase character"
          )
        } else if (e === "noDigit") {
          return $gettext("Password should use at least one digit")
        } else if (e === "noSymbol") {
          return $gettext("Password should use at least one symbol")
        }
      })
    },
  }
}
