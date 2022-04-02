### addEventListener option支持的安全检测
在`target.addEventListener(type, listener, options);` 中，由于旧版本浏览器仍然认为`options`是个布尔值，因此需要检测浏览器是否支持`option`为对象的情况

比如检测是否支持`passive`值：
```js
export let passiveBrowserEventsSupported = false;
// Check if browser support events with passive listeners
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
try {
  const options = {};
  Object.defineProperty(options, 'passive', {
    get: function() {
      passiveBrowserEventsSupported = true;
    },
  });
  window.addEventListener('test', options, options);
  window.removeEventListener('test', options, options);
} catch (e) {
  passiveBrowserEventsSupported = false;
}
```


### 获取事件target对象
```js
const TEXT_NODE = 3;
// 获取target对象，兼容浏览器
function getEventTarget(nativeEvent) {
  // IE9 使用nativeEvent.srcElement
  let target = nativeEvent.target || nativeEvent.srcElement || window;

  // 兼容 SVG <use> element events
  if (target.correspondingUseElement) {
    target = target.correspondingUseElement;
  }

  //兼容safari，safari在文本节点上也会触发事件
  // Safari may fire events on text nodes (Node.TEXT_NODE is 3).
  // @see http://www.quirksmode.org/js/events_properties.html
  return target.nodeType === TEXT_NODE ? target.parentNode : target;
}

```


### Safari浏览器NonInteractiveElement事件委托的问题
可以通过给元素绑定一个空的noop触发其向上冒泡
```js
function noop() {}
function trapClickOnNonInteractiveElement(node) {
  // Mobile Safari does not fire properly bubble click events on
  // non-interactive elements, which means delegated click listeners do not
  // fire. The workaround for this bug involves attaching an empty click
  // listener on the target node.
  // https://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
  // Just set it using the onclick property so that we don't have to manage any
  // bookkeeping for it. Not sure if we need to clear it when the listener is
  // removed.
  // TODO: Only do this for the relevant Safaris maybe?
  node.onclick = noop;
}
```