### React合成事件分三个阶段
- 事件注册
- 事件绑定
- 事件触发

### 流程阶段
- 事件名称注册阶段。这个阶段主要涉及两个方法：`registerSimpleEvents`以及`registerTwoPhaseEvent`。这个阶段主要是收集所有的原生事件`allNativeEvents`
    + registerSimpleEvents方法。在DOMEventProperties.js文件中。       
        >`registerSimpleEvents`方法根据原生事件集合`discreteEventPairsForSimpleEventPlugin = ['click', 'click', 'dragend', 'dragEnd']`(集合中第一个是原生事件名称，第二个是react事件名称)创建`topLevelEventsToReactNames={ click: 'onClick', dragend: 'onDragEnd' }`对象。然后调用`registerTwoPhaseEvent(reactName, [topEvent])`(`reactName`是合成事件名称如`onClick`，`topEvent`是原生事件名称如`click`)注册合成事件名称

    + registerTwoPhaseEvent方法。在EventRegistry.js文件中。          
        >`registerTwoPhaseEvent`方法创建合成事件名称和原生事件名称依赖集合`const registrationNameDependencies = { onClick: ['click'], onClickCapture: ['click'] }`。同时收集所有的原生事件集合`const allNativeEvents = ['click']`，这是最终会在容器上绑定的事件

    + 目的。这一阶段最主要的目的就是收集`allNativeEvents`以及`topLevelEventsToReactNames`。为事件绑定阶段做准备

- 事件绑定阶段。这个阶段的入口从`listenToAllSupportedEvents`方法开始
    + listenToAllSupportedEvents方法。在DOMPluginEventSystem.js文件中
        + 遍历`allNativeEvents`给容器root注册原生的`捕获`和`冒泡`事件。
        + 注册过的事件会存储在容器root的`__reactEvents$ggbtgfosccg`属性中($后面是随机生成的字符串)，`root.__reactEvents$ggbtgfosccg=['click__bubble', 'click__capture']`
        + 通过`let listener = dispatchEvent.bind(null, domEventName, eventSystemFlags, rootContainerElement)`创建事件监听器`dispatchEvent`
        + 通过`target.addEventListener(eventType, dispatchEvent, capture)`绑定事件
        + 目的。这个阶段主要两个目的：一是绑定事件，通过`dispatchEvent`注册原生事件处理函数，这个函数会在事件触发时执行，比如点击按钮。二是在容器上创建一个`root.__reactEvents$ggbtgfosccg`收集容器已经绑定过的事件，避免重复绑定

- 事件触发阶段。这里需要了解一下真实dom和fiber的引用关系。react在运行时，创建真实dom节点时，会给真实的dom节点挂载一个`dom.__reactFiber$ggbtgfosccg = fiber`属性以保存dom和fiber的引用关系，同时挂载一个`dom.__reactProps$ggbtgfosccg = props`属性，保持fiber的props值。
    + dispatchEvent方法。在ReactDOMEventListener.js文件中。根据nativeEvent.target.__reactFiber$ggbtgfosccg获取fiber节点，并调用dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer)

    + dispatchEventForPluginEventSystem方法。在DOMPluginEventSystem.js文件中。
        + 调用`SimpleEventPlugin.extractEvents`方法提取事件处理函数，并存在`dispatchQueue`数组中
            + 根据原生事件名称获取对应的合成事件构造函数
            + 找出父节点上所有的事件监听函数，dom.__reactProps$ggbtgfosccg.onClick或者dom.__reactProps$ggbtgfosccg.onClickCapture，存在`listeners`数组中
            + 通过合成事件构造函数生成合成事件对象`event`，将`{event, listeners}`存入`dispatchQueue`数组中
        + 调用`processDispatchQueue`方法遍历执行事件处理函数
        
      
