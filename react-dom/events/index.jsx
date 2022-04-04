import { listenToAllSupportedEvents } from './DOMPluginEventSystem'
import { internalInstanceKey, internalPropsKey } from '../client/ReactDOMComponentTree'
const root = document.getElementById('root')

const handleDivClick = () => {
    console.log('父元素冒泡')
}

const handleDivClickCapture = event => {
    console.log('父元素捕获')
}

const handleButtonClick = event => {
    console.log('子元素冒泡')
}

const handleButtonClickCapture = () => {
    console.log('子元素捕获')
}

const element = {
    type: 'div',
    props: {
        onClick: handleDivClick,
        onClickCapture: handleDivClickCapture,
        id: 'parent',
        children: {
            type: 'button',
            props: {
                id: 'child',
                children: '点击',
                onClick: handleButtonClick,
                onClickCapture: handleButtonClickCapture
            }
        }
    }
}

const HostComponent = 5

function render(vdom, container){
    listenToAllSupportedEvents(container)
    const newDOM = createDOM(vdom, container)
    container.appendChild(newDOM)
}
render(element, root)


function createDOM(vdom, parentNode){
    const { type, props } = vdom
    let dom
    if(typeof vdom === 'string' || typeof vdom === 'number'){
        dom = document.createTextNode(vdom)
    } else {
        dom = document.createElement(type)
    }
    const returnFiber = parentNode[internalInstanceKey] || null
    const fiber = { tag: HostComponent, type, stateNode: dom, return: returnFiber }
    dom[internalInstanceKey] = fiber
    dom[internalPropsKey] = props
    if(props){
        createDOM(props.children, dom)
    }
    parentNode.appendChild(dom)
    return dom
}