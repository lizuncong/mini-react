import { createElement, setInitialProperties } from './ReactDOMComponent'
export function shouldSetTextContent(type, props) {
    return type === 'textarea' || type === 'option' || type === 'noscript' || typeof props.children === 'string' || typeof props.children === 'number' || typeof props.dangerouslySetInnerHTML === 'object' && props.dangerouslySetInnerHTML !== null && props.dangerouslySetInnerHTML.__html != null;
}


export const createInstance = (type, props, rootContainerInstance, hostContext, internalInstanceHandle) => {
    const domElement = createElement(type, props, rootContainerInstance, hostContext);
    return domElement;
};


export function finalizeInitialChildren(domElement, type, props, rootContainerInstance, hostContext) {
    setInitialProperties(domElement, type, props);
}