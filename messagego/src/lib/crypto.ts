const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value);

  const bytes = new Uint8Array(
    binary.length
  );

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

export async function encryptMessage(
  message: string
) {
  const key =
    await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );

  const iv = crypto.getRandomValues(
    new Uint8Array(12)
  );

  const encrypted =
    await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encoder.encode(message)
    );

  const rawKey =
    await crypto.subtle.exportKey(
      "raw",
      key
    );

  return {
    ciphertext: toBase64(encrypted),
    iv: toBase64(iv.buffer),
    key: toBase64(rawKey),
  };
}

export async function decryptMessage(
  ciphertext: string,
  ivBase64: string,
  keyBase64: string
) {
  const keyBytes =
    fromBase64(keyBase64);

  const iv =
    fromBase64(ivBase64);

  const encrypted =
    fromBase64(ciphertext);

  const key =
    await crypto.subtle.importKey(
      "raw",
      keyBytes,
      {
        name: "AES-GCM",
      },
      false,
      ["decrypt"]
    );

  const decrypted =
    await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encrypted
    );

  return decoder.decode(decrypted);
}