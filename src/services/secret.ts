import crypto from "crypto"

export type Hash = {
  salt: string
  hash: string
}

export function hashSecret(secret: string, salt?: string): Hash {
  const length = Math.max(2 ** (Math.trunc(Math.log2(secret.length)) + 1), 32)
  salt =
    salt || crypto.randomBytes(length).toString("base64").substring(0, length)
  const iterations = 1023
  const hash = crypto
    .pbkdf2Sync(secret, salt, iterations, length, "sha256")
    .toString("base64")
    .substring(0, length)
  return { salt, hash }
}

export function checkSecret(secret: string, hash: Hash): boolean {
  return hash.hash === hashSecret(secret, hash.salt).hash
}

export function cipher(clearMsg: string, password: string) {
  const length = Math.max(2 ** (Math.trunc(Math.log2(password.length)) + 1), 32)
  const { salt, hash } = hashSecret(password)
  const iv = crypto.randomBytes(16)

  // hash is used as a key here
  const cipher = crypto.createCipheriv("aes-256-cbc", hash, iv)
  cipher.write(clearMsg)
  cipher.end()

  const encryptedMsg = cipher.read()
  return Buffer.concat([
    Buffer.from(salt),
    iv,
    Buffer.from(encryptedMsg),
  ]).toString("base64")
}

export function decipher(b64EncryptedMsg: string, password: string) {
  const encrypted = Buffer.from(b64EncryptedMsg, "base64")
  const length = Math.max(2 ** (Math.trunc(Math.log2(password.length)) + 1), 32)
  const salt = encrypted.slice(0, length)
  const iv = encrypted.slice(length, length + 16)
  const encryptedMsg = encrypted.slice(length + 16)
  const key = hashSecret(password, salt.toString()).hash
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)
  decipher.write(encryptedMsg)
  decipher.end()

  return decipher.read().toString()
}
