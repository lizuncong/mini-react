### React合成事件分三个阶段
- 事件注册
- 事件绑定
- 事件触发

### 流程
- 注册阶段。这个阶段主要是收集所有的原生事件allNativeEvents
    + DOMEventProperties.js。SimpleEventPlugin.registerEvents()
    topLevelEventsToReactNames是map，里面存储的是原生事件名称和react事件名称的一一对应关系，比如{'click': 'onClick'}，然后调用
    registerTwoPhaseEvent(reactName, [topEvent])，reactName是合成事件名称，topEvent是原生事件名称

    + EventRegistry.js。registerTwoPhaseEvent，主要是给以下变量设置值
    const registrationNameDependencies = { onClick: ['click'], onClickCapture: ['click'] }，key是react合成事件名称，值是原生事件依赖数组
    const allNativeEvents = ['click']，原生事件集合，最终会在容器上绑定的事件

- 事件绑定
    + DOMPluginEventSystem.js。listenToAllSupportedEvents(root)
        + 遍历allNativeEvents，调用listenToNativeEvent()往容器root注册原生捕获以及冒泡事件
        + listenToNativeEvent()会往root节点上挂载一个属性root.__reactEvents$ggbtgfosccg =["click__bubble", "click__capture"]
    + EventListener.js。负责调用target.addEventListener(eventType, listener, capture)绑定原生的捕获及冒泡事件，这里需要注意的是，listener 是通过let listener = dispatchEvent.bind(null, domEventName, eventSystemFlags, rootContainerElement)固定了前面的入参，因此当原生事件触发时，实际上执行的dispatchEvent


- 事件触发。react-dom在运行时创建dom，会给真实的dom节点挂载一个dom.__reactFiber$ggbtgfosccg = fiber以保存dom和fiber的引用关系，同时挂在一个dom.__reactProps$ggbtgfosccg = props属性，保持原始的props值。
    + ReactDOMEventListener.js。function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent){}，点击按钮，触发原生事件执行时，实际上调用的是dispatchEvent，并传入nativeEvent对象，其他属性在绑定时已经固定，targetContainer是容器root。

    dispatchEvent根据nativeEvent.target.__reactFiber$ggbtgfosccg获取fiber节点，并调用dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer)

    + DOMPluginEventSystem.js。调用dispatchEventForPluginEventSystem方法
        + 调用SimpleEventPlugin.extractEvent提取事件处理函数，填充dispatchQueue数组，extractEvent内部调用accumulateSinglePhaseListeners方法，提取单个阶段的事件监听函数，比如递归fiber树收集所有的捕获阶段监听函数。
        dispatchQueue = [{ event: SyntheticBaseEvent, listeners: [[fiber, listener, target]] }]
