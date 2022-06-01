import { createElement, setInitialProperties } from './ReactDOMComponent'
import { ELEMENT_NODE, DOCUMENT_NODE } from '../shared/HTMLNodeType'

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

export function clearContainer(container) {
    if (container.nodeType === ELEMENT_NODE) {
        container.textContent = '';
    } else if (container.nodeType === DOCUMENT_NODE) {
        const body = container.body;

        if (body != null) {
            body.textContent = '';
        }
    }
}