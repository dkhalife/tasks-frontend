export function retrieveValue<T>(key: string, defaultValue: T): T {
  const stickyValue = window.localStorage.getItem(key)
  return stickyValue !== null ? JSON.parse(stickyValue) as T : defaultValue
}

export function storeValue<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}
