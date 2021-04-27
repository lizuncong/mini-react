function createDom(fiber){
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type);

  const isProperty = key => key !== 'children';

  Object.keys(fiber.props)
      .filter(isProperty)
      .forEach(name => {
        dom[name] = fiber.props[name];
      })

  return dom;
}


let nextUnitOfWork = null;
let wipRoot = null;
function render(element, container) {
  wipRoot = {
    dom: container, // 真实的dom
    props: {
      children: [element], // element为virtual dom树
    }
  }

  nextUnitOfWork = wipRoot;
}

function workLoop(deadline){
  let shouldYield = false;
  while(nextUnitOfWork && !shouldYield){
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 如果nextUnitOfWork为空，说明整个Fiber树构建已经完成，可以提交整棵树了。
  if(!nextUnitOfWork && wipRoot){
    commitRoot();
  }
  requestIdleCallback(workLoop)
}


requestIdleCallback(workLoop)


// 递归遍历整个wipRoot Fiber Tree，添加所有的节点到dom中。
function commitRoot(){
  commitWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber){
  if(!fiber) return;
  fiber.parent.dom.appendChild(fiber.dom);
  commitWork(fiber.child); // 先添加子节点
  commitWork(fiber.sibling); // 其次添加兄弟节点
}

function performUnitOfWork(fiber){
  if(!fiber.dom){
    fiber.dom = createDom(fiber); //为fiber创建真实的dom节点，并保存在fiber.dom属性中。
  }

// 不在performUnitOfWork中添加元素
  // 添加到父节点中。对于根root fiber而言，其dom节点已经是渲染到浏览器上的真实节点，也就是通过document.getElementById('root')
  // 获取到的dom。因此根root fiber是没有父节点的。
//  if(fiber.parent){
//    fiber.parent.dom.appendChild(fiber.dom);
//  }

  // 遍历每一个子元素，并创建fiber节点，设置fiber节点的子节点指针，兄弟节点指针，父节点三个指针。
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null; // 用于设置兄弟节点的指针

  while(index < elements.length){
    const element = elements[index];

    // 为element创建相应的fiber节点
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber, // 设置父节点指针
      dom: null, // 注意，此时还没有创建真实的dom
    }

    // 设置子节点及兄弟节点
    if(index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }

  // 找到下一个可执行单元并返回
  // 1.先找子节点
  if(fiber.child){
    return fiber.child;
  }
  // 2.没有子节点就找兄弟节点
  let nextFiber = fiber;
  while(nextFiber){
    if(nextFiber.sibling){
      return nextFiber.sibling;
    }
    // 3.没有兄弟节点，则找父节点的兄弟节点
    nextFiber = nextFiber.parent;
  }
}
