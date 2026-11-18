const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'
const LENGTH = 10

export function newRoomId(): string {
  // 252 is the largest multiple of 36 below 256; rejecting bytes above it keeps the ids unbiased.
  let id = ''
  while (id.length < LENGTH) {
    for (const byte of crypto.getRandomValues(new Uint8Array(LENGTH))) {
      if (byte < 252 && id.length < LENGTH) id += ALPHABET[byte % ALPHABET.length]
    }
  }
  return id
}
