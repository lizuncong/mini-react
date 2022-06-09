import { createElement, createTextNode, setInitialProperties } from './ReactDOMComponent'
import { ELEMENT_NODE, DOCUMENT_NODE, COMMENT_NODE } from '../shared/HTMLNodeType'
import { precacheFiberNode, updateFiberProps } from './ReactDOMComponentTree'
export function shouldSetTextContent(type, props) {
    return type === 'textarea' || type === 'option' || type === 'noscript' || typeof props.children === 'string' || typeof props.children === 'number' || typeof props.dangerouslySetInnerHTML === 'object' && props.dangerouslySetInnerHTML !== null && props.dangerouslySetInnerHTML.__html != null;
}


export const createInstance = (type, props, rootContainerInstance, hostContext, internalInstanceHandle) => {
    const domElement = createElement(type, props, rootContainerInstance, hostContext);
    precacheFiberNode(internalInstanceHandle, domElement);
    updateFiberProps(domElement, props);
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

export function appendChildToContainer(container, child) {
    let parentNode;
    if (container.nodeType === COMMENT_NODE) {
        parentNode = container.parentNode;
        parentNode.insertBefore(child, container);
    } else {
        parentNode = container;
        parentNode.appendChild(child);
    }
}

export function createTextInstance(text, rootContainerInstance, hostContext, internalInstanceHandle) {
    const textNode = createTextNode(text, rootContainerInstance);
    precacheFiberNode(internalInstanceHandle, textNode);
    return textNode
}

export function appendInitialChild(parentInstance, child) {
    parentInstance.appendChild(child);
}
// export function appendChild(parentInstance, child) {
//     parentInstance.appendChild(child);
// }
// export function insertBefore(parentInstance, child, before) {
//     parentInstance.insertBefore(child, before);
// }
// export function prepareUpdate(domElement, type, oldProps, newProps) {
//     return diffProperties(domElement, type, oldProps, newProps);
// }

// export function removeChild(parentInstance, child) {
//     parentInstance.removeChild(child);
// }