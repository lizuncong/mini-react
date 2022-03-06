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

        this.isDefaultPrevented = functionThatReturnsFalse
        this.isPropagationStopped = functionThatReturnsFalse

        return this
    }

    Object.assign(SyntheticBaseEvent.prototype, {
        preventDefault(){
            this.defaultPrevented = true
            const event = this.nativeEvent
            if(event.preventDefault){
                event.preventDefault()
            } else {
                event.returnValue = true; // IE
            }
            this.isDefaultPrevented = functionThatReturnsTrue
        },
        stopPropagation(){
            const event = this.nativeEvent
            if(event.stopPropagation){
                event.stopPropagation()
            } else {
                event.cancelBubble = true; // IE
            }
            this.isPropagationStopped = functionThatReturnsTrue
        }
    })

    return SyntheticBaseEvent
}


const MouseEventInterface = {
    clientX: 0,
    clientY: 0
}

export const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface)

export const SyntheticEvent = createSyntheticEvent({})