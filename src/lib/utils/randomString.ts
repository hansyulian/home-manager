export function randomString(length: number) {
  const result = [];
  for (let i = 0; i < length; i += 1) {
    result.push(((Math.random() * 36) | 0).toString(36));
  }
  return result.join("");
}
