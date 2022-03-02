import { listenToAllSupportedEvents } from './DOMPluginEventSystem' 
function render(vdom, container){
    listenToAllSupportedEvents(container)
    mount(vdom, container)
}

function mount(vdom, parentNode){
    const newDOM = createDOM(vdom, parentNode)
    parentNode.appendChild(newDOM)
}

function createDOM(vdom, parentNode){
    const { type, props } = vdom
    let dom
    if(typeof vdom === 'string' || typeof vdom === 'number'){
        dom = document.createTextNode(vdom)
    } else {
        dom = document.createElement(type)
    }

    if(props){
        updateProps(dom, {}, props)
        if(Array.isArray(props.children)){
            reconcileChildren(props.children, dom)
        } else {
            mount(props.children, dom)
        }
    }
    return dom
}

function reconcileChildren(children, parentNode){
    children.forEach(child => {
        mount(child, parentNode)
    })
}

function updateProps(dom, oldProps, newProps ){

}

export default {
    render
}