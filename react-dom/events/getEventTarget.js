
import { TEXT_NODE } from '../shared/HTMLNodeType';

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

export default getEventTarget;
