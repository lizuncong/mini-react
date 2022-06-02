import { registerTwoPhaseEvent } from './EventRegistry'

export const topLevelEventsToReactNames = new Map()
// {
//     "cancel": "onCancel",
//     "click": "onClick",
//     "close": "onClose",
//     "contextmenu": "onContextMenu",
//     "copy": "onCopy",
//     "cut": "onCut",
//     "auxclick": "onAuxClick",
//     "dblclick": "onDoubleClick",
//     "dragend": "onDragEnd",
//     "dragstart": "onDragStart",
// }

// 偶数项是原生事件，奇数项是对应的React事件
const discreteEventPairsForSimpleEventPlugin = [
    // 'cancel', 'cancel',
    'click', 'click',
    // 'close', 'close',
    // 'contextmenu', 'contextMenu',
    // 'copy', 'copy',
    // 'cut', 'cut',
    // 'auxclick', 'auxClick',
    // 'dblclick', 'doubleClick', // Careful!
    // 'dragend', 'dragEnd',
    // 'dragstart', 'dragStart',
    // 'drop', 'drop',
    // 'focusin', 'focus', // Careful!
    // 'focusout', 'blur', // Careful!
    // 'input', 'input',
    // 'invalid', 'invalid',
    // 'keydown', 'keyDown',
    // 'keypress', 'keyPress',
    // 'keyup', 'keyUp',
    // 'mousedown', 'mouseDown',
    // 'mouseup', 'mouseUp',
    // 'paste', 'paste',
    // 'pause', 'pause',
    // 'play', 'play',
    // 'pointercancel', 'pointerCancel',
    // 'pointerdown', 'pointerDown',
    // 'pointerup', 'pointerUp',
    // 'ratechange', 'rateChange',
    // 'reset', 'reset',
    // 'seeked', 'seeked',
    // 'submit', 'submit',
    // 'touchcancel', 'touchCancel',
    // 'touchend', 'touchEnd',
    // 'touchstart', 'touchStart',
    // 'volumechange', 'volumeChange',
];

function registerSimplePluginEventsAndSetTheirPriorities(eventTypes, priority) {
    for (let i = 0; i < eventTypes.length; i += 2) {
      const topEvent = eventTypes[i];
      const event = eventTypes[i + 1];
      const capitalizedEvent = event[0].toUpperCase() + event.slice(1);
      const reactName = 'on' + capitalizedEvent;
      topLevelEventsToReactNames.set(topEvent, reactName);
      registerTwoPhaseEvent(reactName, [ topEvent ]);
    }
  }

export function registerSimpleEvents(){
    registerSimplePluginEventsAndSetTheirPriorities(discreteEventPairsForSimpleEventPlugin, 0);
}