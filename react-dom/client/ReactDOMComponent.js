import { registrationNameDependencies } from '../events/EventRegistry'
const STYLE = 'style';


function setInitialDOMProperties(tag, domElement, props) {
    for (const propKey in props) {
        const nextProp = props[propKey];
        if (propKey === "children") {
            if (typeof nextProp === "string" || typeof nextProp === "number") {
                domElement.textContent = nextProp;
            }
        } else if (propKey === "style") {
            for (let stylePropKey in nextProp) {
                domElement.style[stylePropKey] = nextProp[stylePropKey];
            }
        } else if (registrationNameDependencies.hasOwnProperty(propKey)) {
        } else {
            domElement[propKey] = nextProp;
        }
    }
}

export const createElement = (type) => {
    return document.createElement(type);
};


export const setInitialProperties = (domElement, tag, props) => {
    setInitialDOMProperties(tag, domElement, props);
};

export function createTextNode(text, rootContainerElement) {
    return document.createTextNode(text)
}





// export const diffProperties = (domElement, type, oldProps, newProps) => {
//     let updatePayload = null; // 存放需要更新的键值，比如[key1, key1对应的value1，key2, key2对应的value2]
//     let propKey;
//     for (propKey in oldProps) {
//         if (oldProps.hasOwnProperty(propKey) && !newProps.hasOwnProperty(propKey)) {
//             (updatePayload = updatePayload || []).push(propKey, null);
//         }
//     }
//     for (propKey in newProps) {
//         const nextProp = newProps[propKey];
//         if (propKey === "children") {
//             if (typeof nextProp === "string" || typeof nextProp === "number") {
//                 if (nextProp !== oldProps[propKey]) {
//                     (updatePayload = updatePayload || []).push(propKey, nextProp);
//                 }
//             }
//         } else {
//             if (nextProp !== oldProps[propKey]) {
//                 (updatePayload = updatePayload || []).push(propKey, nextProp);
//             }
//         }
//     }
//     return updatePayload;
// };

// export function updateProperties(domElement, updatePayload) {
//     for (let i = 0; i < updatePayload.length; i += 2) {
//         const propKey = updatePayload[i];
//         const propValue = updatePayload[i + 1];
//         if (propKey === "children") {
//             domElement.textContent = propValue;
//         } else {
//             domElement.setAttribute(propKey, propValue);
//         }
//     }
// }
