export const allNativeEvents = new Set()
// 最后allNativeEvents注册的所有原生事件近80个，篇幅有限，这里只简单列举
// ["cancel", "click", "close", "contextmenu", "copy", "cut", "auxclick", "dblclick","dragend",
// "dragstart", "drop", "focusin", "focusout", "input", "invalid", "keydown", "keypress","keyup",
// "mousedown", "mouseup", "paste", "pause", "play","touchcancel",
// ..., "touchend", "touchstart"]


export const registrationNameDependencies = {}
// {
//     onClick: ['click'],
//     onClickCapture: ['click'],
//     onChange: ['change', 'click', 'focusin', 'focusout', 'input', 'keydown', 'keyup', 'selectionchange'],
//     onChangeCapture: ['change', 'click', 'focusin', 'focusout', 'input', 'keydown', 'keyup', 'selectionchange']
// }


// registrationName 注册名称 onChange
export function registerTwoPhaseEvent(registrationName, dependencies){
    registerDirectEvent(registrationName, dependencies) // onClick
    registerDirectEvent(registrationName + 'Capture', dependencies) // onClickCapture
}

export function registerDirectEvent(registrationName, dependencies){
    registrationNameDependencies[registrationName] = dependencies
    for(let i = 0; i < dependencies.length; i++){
        allNativeEvents.add(dependencies[i])
    }
}