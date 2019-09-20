import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'
import Base64 from 'crypto-js/enc-base64'
import lib from 'crypto-js/lib-typedarrays'
export default {
  methods: {
    encrypt (msgString, key) {
      key = Utf8.parse(key)
      var iv = lib.random(16)
      var encrypted = AES.encrypt(msgString, key, {
        iv: iv
      })
      return iv.concat(encrypted.ciphertext).toString(Base64)
    },
    decrypt (ciphertextStr, key) {
      key = Utf8.parse(key)
      var ciphertext = Base64.parse(ciphertextStr)
      var iv = ciphertext.clone()
      iv.sigBytes = 16
      iv.clamp()
      ciphertext.words.splice(0, 4)
      ciphertext.sigBytes -= 16
      var decrypted = AES.decrypt({
        ciphertext: ciphertext
      }, key, {
        iv: iv
      })
      return decrypted.toString(Utf8)
    }
  }
}
