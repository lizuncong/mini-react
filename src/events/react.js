import { REACT_ELEMENT_TYPE } from '@shared/ReactSymbols' 
// 保留关键字属性
const RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true,
};

/**
 * 根据给定type类型创建新的ReactElement
 * type可以是div，span或者类组件，函数组件等
*/
export function createElement(type, config, children) {
    let propName;
    const props = {};
  
    let key = null;
    let ref = null;
    let self = null;
    let source = null;
  
    if (config) {
        if (config.ref) {
            ref = config.ref;
        }
        if (config.key) {
            key = '' + config.key; // key会被转换成字符串
        }
  
        self =  config.__self;
        source = config.__source;
        for (propName in config) {
            if (!RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
            }
        }
    }
  

    const childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      const childArray = Array(childrenLength);
      for (let i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }
      props.children = childArray;
    }
    return  {
        mini: true, // mini react标记
        $$typeof: REACT_ELEMENT_TYPE,
        type: type,
        key: key,
        ref: ref,
        props: props,
        // _owner: owner,
      };
}

export default {
    createElement
}