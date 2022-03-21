### React合成事件分三个阶段
- 事件注册
- 事件绑定
- 事件触发

### 流程
- 注册阶段。这个阶段主要是收集所有的原生事件allNativeEvents
    + DOMEventProperties.js。使用discreteEventPairsForSimpleEventPlugin = ['click', 'click']收集了原生事件和react事件名称，第一个是原生事件，第二个是react事件名称。SimpleEventPlugin.registerEvents()根据discreteEventPairsForSimpleEventPlugin创建topLevelEventsToReactNames={'click': 'onClick'}，然后调用
    registerTwoPhaseEvent(reactName, [topEvent])，reactName是合成事件名称，topEvent是原生事件名称

    + EventRegistry.js。registerTwoPhaseEvent，主要是给以下变量设置值
    const registrationNameDependencies = { onClick: ['click'], onClickCapture: ['click'] }，key是react合成事件名称，值是原生事件依赖数组
    const allNativeEvents = ['click']，原生事件集合，最终会在容器上绑定的事件

- 事件绑定
    + react-dom.js。事件绑定逻辑从listenToAllSupportedEvents入口开始。
    + DOMPluginEventSystem.js。listenToAllSupportedEvents(root)
        + 遍历allNativeEvents，调用listenToNativeEvent()往容器root注册原生捕获以及冒泡事件
        + listenToNativeEvent()会往root节点上挂载一个属性root.__reactEvents$ggbtgfosccg =["click__bubble", "click__capture"]
    + EventListener.js。负责调用target.addEventListener(eventType, listener, capture)绑定原生的捕获及冒泡事件，这里需要注意的是，listener 是通过let listener = dispatchEvent.bind(null, domEventName, eventSystemFlags, rootContainerElement)固定了前面的入参，因此当原生事件触发时，实际上执行的dispatchEvent


- 事件触发。react-dom在运行时创建dom，会给真实的dom节点挂载一个dom.__reactFiber$ggbtgfosccg = fiber以保存dom和fiber的引用关系，同时挂载一个dom.__reactProps$ggbtgfosccg = props属性，保持原始的props值。
    + ReactDOMEventListener.js。function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent){}，点击按钮，触发原生事件执行时，实际上调用的是dispatchEvent，并传入nativeEvent对象，其他属性在绑定时已经固定，targetContainer是容器root。

    dispatchEvent根据nativeEvent.target.__reactFiber$ggbtgfosccg获取fiber节点，并调用dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer)

    + DOMPluginEventSystem.js。调用dispatchEventForPluginEventSystem方法
        + SimpleEventPlugin.js。 调用SimpleEventPlugin.extractEvent填充dispatchQueue数组， 通过domEventName获取topLevelEventsToReactNames对应的react事件名称，提取事件处理函数，即reactName。extractEvent内部调用accumulateSinglePhaseListeners方法，通过reactName递归fiber树，获取fiber节点，通过fiber.stateNode获取原生的dom节点，再通过dom.__reactProps$ggbtgfosccg获取节点的原始props值，然后通过onClick或者onClickCapture提取props中单个阶段的事件监听函数。最后根据事件类型，生成对应的合成事件对象。至此捕获或者冒泡阶段的事件监听处理函数已经收集完毕，我们得到一个dispatchQueue数组
        dispatchQueue = [{ event: SyntheticBaseEvent, listeners: [[fiber, listener, target]] }]。
        + DOMPluginEventSystem.js。通过processDispatchQueue方法依次遍历事件监听函数，传入合成事件对象并执行。
        
      
