

const createTextElement = (text) => {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        }
    }
}

// children数组可能为空数组，数组中也可能包括基本的类型值，比如数字或者字符串
// 在react的代码中：
// 1.当children不存在时，react并不会创建一个空的数组。
// 2.如果数组中有基本类型值，如数字或者字符串，react也不会对这些基本类型值做特殊处理。
// 在我们的mini-react中，为了简化代码，我们使用特殊的类型TEXT_ELEMENT包装工基本的类型值
const createElement = (type, props, ...children) => {
    console.log('type..', type, props);
    return {
        type,
        props: {
            ...props,
            children: children.map(child =>
                typeof child === 'object' ?
                    child
                    :
                    createTextElement(child)
            ),
        }
    }
}



export default { createElement }



let nextUnitOfWork = null

function workLoop(deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
        )
        shouldYield = deadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(nextUnitOfWork) {
    // TODO
}
