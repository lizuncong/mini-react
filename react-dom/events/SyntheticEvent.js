function functionThatReturnsTrue(){
    return true
}
function functionThatReturnsFalse(){
    return false
}

function createSyntheticEvent(Interface){
    function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget){
        this._reactName = reactName
        this._targetInst = targetInst
        this.type = reactEventType
        this.nativeEvent = nativeEvent
        this.target = nativeEventTarget
        this.currentTarget = null // 当前的事件源
        // 选择性的把原生事件对象上的属性，拷贝到合成事件对象实例
        for(const propName in Interface){
            this[propName] = nativeEvent[propName]
        }
        const defaultPrevented =
        nativeEvent.defaultPrevented != null
          ? nativeEvent.defaultPrevented
          : nativeEvent.returnValue === false;

      if (defaultPrevented) {
        this.isDefaultPrevented = functionThatReturnsTrue;
      } else {
        this.isDefaultPrevented = functionThatReturnsFalse;
      }

        this.isDefaultPrevented = functionThatReturnsFalse
        this.isPropagationStopped = functionThatReturnsFalse

        return this
    }

    Object.assign(SyntheticBaseEvent.prototype, {
        preventDefault(){
            // event.defaultPrevented返回一个布尔值，表明当前事件是否调用了 event.preventDefault()方法。
            this.defaultPrevented = true
            const event = this.nativeEvent
            if (event.preventDefault) {
                event.preventDefault(); // $FlowFixMe - flow is not aware of `unknown` in IE
              } else if (typeof event.returnValue !== 'unknown') {
                event.returnValue = false;
              }
            this.isDefaultPrevented = functionThatReturnsTrue
        },
        stopPropagation(){
            const event = this.nativeEvent
            if (event.stopPropagation) {
                event.stopPropagation(); // $FlowFixMe - flow is not aware of `unknown` in IE
              } else if (typeof event.cancelBubble !== 'unknown') {
                // The ChangeEventPlugin registers a "propertychange" event for
                // IE. This event does not support bubbling or cancelling, and
                // any references to cancelBubble throw "Member not found".  A
                // typeof check of "unknown" circumvents this issue (and is also
                // IE specific).
                event.cancelBubble = true;
              }
            this.isPropagationStopped = functionThatReturnsTrue
        }
    })

    return SyntheticBaseEvent
}


const MouseEventInterface = {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
}

export const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface)

export const SyntheticEvent = createSyntheticEvent({})