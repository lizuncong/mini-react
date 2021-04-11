const createDom = (fiber) => {
    const dom = fiber.type === 'TEXT_ELEMENT' ?
        document.createTextNode('') :
        document.createElement(fiber.type);

    const isProperty = key => key !== 'children';

    Object
        .keys(fiber.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = fiber.props[name]
        })

    return dom;
}

let nextUnitOfWork = null; // 一个unitWork对应一个fiber
let wipRoot = null;
let currentRoot = null; // 上一次commmit的fiber树。如果状态改变，重新render时，用currentRoot和改变后的fiber树做比较
// 在render方法中，将nextUnitOfWork设置成fiber树的根节点
const render = (element, container) => {
    wipRoot = { // 根fiber，这个对象就是fiber的结构，一个unitWork单元就是一个fiber数据结构
        dom: container, // 真实的dom元素
        props: {
            children: [element]
        },
        alternate: currentRoot, // 给每一个fiber添加alternate属性，这个属性用于保存旧的fiber
    }
    nextUnitOfWork = wipRoot;
}


function commitRoot(){
    // add nodes to dom
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}


function commitWork(fiber){
    if(!fiber){
        return;
    }
    const domParent = fiber.parent.dom;
    domParent.appendChild(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}



// 构建fiber树
function performUnitOfWork(fiber) {
    if(!fiber.dom){
        fiber.dom = createDom(fiber);
    }

    // 如果在每个执行单元都修改dom，那么如果浏览器打断了render，那么用户看到的
    // 界面将不是完整的，因此这里不每次都修改dom，而是使用commitRoot一次性修改
    // if(fiber.parent){
    //     fiber.parent.dom.appendChild(fiber.dom)
    // }

    // 为每个子节点创建一个新的fiber
    const elements = fiber.props.children;
    let index = 0;
    let prevSibling = null;
    while (index < elements.length) {
        const element = elements[index];

        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null,
            child: null,
            sibling: null,
        }

        // 为当前fiber设置子节点及兄弟节点指针
        if(index === 0){
            fiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber;
        index++;
    }
    // 返回下一个执行单元
    // 寻找下一个执行单元，先尝试子节点，没有子节点，则尝试兄弟节点，没有兄弟节点则继续往上找
    if(fiber.child){
        return fiber.child;
    }
    let nextFiber = fiber;
    while(nextFiber){
        if(nextFiber.sibling){
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent
    }

}


function workLoop(deadline){
    let shouldYield = false;
    console.log('worklopp')
    while(nextUnitOfWork && !shouldYield){
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    // 如果nextUnitOfWork为空时，说明所有任务已经执行完成了，因此需要提交整个
    // fiber树到dom中

    if(!nextUnitOfWork && wipRoot){
        commitRoot();
    }
    window.requestIdleCallback(workLoop)
}

window.requestIdleCallback(workLoop)




export default {
    render,
}
