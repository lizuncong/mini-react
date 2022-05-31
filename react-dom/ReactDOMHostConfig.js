import {
  createElement,
  setInitialProperties,
  diffProperties,
} from "./ReactDOMComponent";






export function appendChild(parentInstance, child) {
  parentInstance.appendChild(child);
}
export function insertBefore(parentInstance, child, before) {
  parentInstance.insertBefore(child, before);
}
export function prepareUpdate(domElement, type, oldProps, newProps) {
  return diffProperties(domElement, type, oldProps, newProps);
}

export function removeChild(parentInstance, child) {
  parentInstance.removeChild(child);
}
