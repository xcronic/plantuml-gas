function decode6bit(c) {
  let n = c.charCodeAt(0);
  if (n >= 48 && n <= 57) {
    return n - 48;
  }
  if (n >= 65 && n <= 90) {
    return n - 65 + 10;
  }
  if (n >= 97 && n <= 122) {
    return n - 97 + 36;
  }
  if (n == 45) {
    return 62;
  }
  if (n == 95) {
    return 63;
  }
  return 0;
}

function decode64(data) {
  const result = new Uint8Array(Math.ceil(data.length * 3 / 4));
  let index = 0;
  for (let i = 0; i < data.length; i += 4) {
    const c1 = decode6bit(data.charAt(i));
    const c2 = decode6bit(data.charAt(i + 1));
    const c3 = decode6bit(data.charAt(i + 2));
    const c4 = decode6bit(data.charAt(i + 3));
    const n = (c1 << 18) + (c2 << 12) + (c3 << 6) + c4;
    result[index++] = (n >> 16) & 0xff;
    result[index++] = (n >> 8) & 0xff;
    result[index++] = n & 0xff;
  }
  return result;
}

function decodePlantUML(encodedUML) {
  const decodedUML = decode64(encodedUML);
  const decompressedUML = pako.inflate(decodedUML);
  return uint8ArrayToAscii(decompressedUML);
}
