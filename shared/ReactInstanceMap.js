export function get(key) {
    return key._reactInternals;
}
export function has(key) {
    return key._reactInternals !== undefined;
}
export function set(key, value) {
    key._reactInternals = value;
}