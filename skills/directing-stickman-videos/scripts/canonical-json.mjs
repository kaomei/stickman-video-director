// Object member order and JSON whitespace have no meaning; array order does.
// Accept JSON data only. Do not omit unknown fields or normalize their values.
export function canonicalJson(value) {
  const ordered = item => Array.isArray(item) ? item.map(ordered)
    : item && typeof item === 'object' ? Object.fromEntries(Object.keys(item).sort().map(key => [key, ordered(item[key])]))
    : item;
  return JSON.stringify(ordered(value));
}
