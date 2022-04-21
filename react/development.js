/** @license React vundefined
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

 'use strict';

 if (process.env.NODE_ENV !== "production") {
   (function() {
 'use strict';
 
 var _assign = require('object-assign');
 
 /***************** debugger packages/shared/ReactVersion.js ==总2行 start *****************/
 // TODO: this is special because it gets imported during build.
 var ReactVersion = '17.0.0';
 /***************** debugger packages/shared/ReactVersion.js ==总2行 end *****************/
 
 /***************** debugger packages/shared/ReactSymbols.js ==总65行 start *****************/
 // ATTENTION
 // When adding new symbols to this file,
 // Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
 // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
 // nor polyfill, then a plain number is used for performance.
 var REACT_ELEMENT_TYPE = 0xeac7;
 var REACT_PORTAL_TYPE = 0xeaca;
 exports.Fragment = 0xeacb;
 exports.StrictMode = 0xeacc;
 exports.Profiler = 0xead2;
 var REACT_PROVIDER_TYPE = 0xeacd;
 var REACT_CONTEXT_TYPE = 0xeace;
 var REACT_FORWARD_REF_TYPE = 0xead0;
 exports.Suspense = 0xead1;
 exports.unstable_SuspenseList = 0xead8;
 var REACT_MEMO_TYPE = 0xead3;
 var REACT_LAZY_TYPE = 0xead4;
 var REACT_BLOCK_TYPE = 0xead9;
 var REACT_SERVER_BLOCK_TYPE = 0xeada;
 var REACT_FUNDAMENTAL_TYPE = 0xead5;
 var REACT_SCOPE_TYPE = 0xead7;
 var REACT_OPAQUE_ID_TYPE = 0xeae0;
 exports.unstable_DebugTracingMode = 0xeae1;
 var REACT_OFFSCREEN_TYPE = 0xeae2;
 exports.unstable_LegacyHidden = 0xeae3;
 
 if (typeof Symbol === 'function' && Symbol.for) {
   var symbolFor = Symbol.for;
   REACT_ELEMENT_TYPE = symbolFor('react.element');
   REACT_PORTAL_TYPE = symbolFor('react.portal');
   exports.Fragment = symbolFor('react.fragment');
   exports.StrictMode = symbolFor('react.strict_mode');
   exports.Profiler = symbolFor('react.profiler');
   REACT_PROVIDER_TYPE = symbolFor('react.provider');
   REACT_CONTEXT_TYPE = symbolFor('react.context');
   REACT_FORWARD_REF_TYPE = symbolFor('react.forward_ref');
   exports.Suspense = symbolFor('react.suspense');
   exports.unstable_SuspenseList = symbolFor('react.suspense_list');
   REACT_MEMO_TYPE = symbolFor('react.memo');
   REACT_LAZY_TYPE = symbolFor('react.lazy');
   REACT_BLOCK_TYPE = symbolFor('react.block');
   REACT_SERVER_BLOCK_TYPE = symbolFor('react.server.block');
   REACT_FUNDAMENTAL_TYPE = symbolFor('react.fundamental');
   REACT_SCOPE_TYPE = symbolFor('react.scope');
   REACT_OPAQUE_ID_TYPE = symbolFor('react.opaque.id');
   exports.unstable_DebugTracingMode = symbolFor('react.debug_trace_mode');
   REACT_OFFSCREEN_TYPE = symbolFor('react.offscreen');
   exports.unstable_LegacyHidden = symbolFor('react.legacy_hidden');
 }
 
 var MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
 var FAUX_ITERATOR_SYMBOL = '@@iterator';
 function getIteratorFn(maybeIterable) {
   if (maybeIterable === null || typeof maybeIterable !== 'object') {
     return null;
   }
 
   var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
 
   if (typeof maybeIterator === 'function') {
     return maybeIterator;
   }
 
   return null;
 }
 /***************** debugger packages/shared/ReactSymbols.js ==总65行 end *****************/
 
 /***************** debugger packages/react/src/ReactCurrentDispatcher.js ==总11行 start *****************/
 /**
  * Keeps track of the current dispatcher.
  */
 var ReactCurrentDispatcher = {
   /**
    * @internal
    * @type {ReactComponent}
    */
   current: null
 };
 /***************** debugger packages/react/src/ReactCurrentDispatcher.js ==总11行 end *****************/
 
 /***************** debugger packages/react/src/ReactCurrentBatchConfig.js ==总8行 start *****************/
 /**
  * Keeps track of the current batch's configuration such as how long an update
  * should suspend for if it needs to.
  */
 var ReactCurrentBatchConfig = {
   transition: 0
 };
 /***************** debugger packages/react/src/ReactCurrentBatchConfig.js ==总8行 end *****************/
 
 /***************** debugger packages/react/src/ReactCurrentOwner.js ==总14行 start *****************/
 /**
  * Keeps track of the current owner.
  *
  * The current owner is the component who should own any components that are
  * currently being constructed.
  */
 var ReactCurrentOwner = {
   /**
    * @internal
    * @type {ReactComponent}
    */
   current: null
 };
 /***************** debugger packages/react/src/ReactCurrentOwner.js ==总14行 end *****************/
 
 /***************** debugger packages/react/src/IsSomeRendererActing.js ==总7行 start *****************/
 /**
  * Used by act() to track whether you're inside an act() scope.
  */
 var IsSomeRendererActing = {
   current: false
 };
 /***************** debugger packages/react/src/IsSomeRendererActing.js ==总7行 end *****************/
 
 /***************** debugger packages/react/src/ReactSharedInternals.js ==总20行 start *****************/
 var ReactSharedInternals = {
   ReactCurrentDispatcher: ReactCurrentDispatcher,
   ReactCurrentBatchConfig: ReactCurrentBatchConfig,
   ReactCurrentOwner: ReactCurrentOwner,
   IsSomeRendererActing: IsSomeRendererActing,
   // Used by renderers to avoid bundling object-assign twice in UMD bundles:
   assign: _assign
 };
 /***************** debugger packages/react/src/ReactSharedInternals.js ==总20行 end *****************/
 
 /***************** debugger packages/shared/formatProdErrorMessage.js ==总14行 start *****************/
 // Do not require this module directly! Use normal `invariant` calls with
 // template literal strings. The messages will be replaced with error codes
 // during build.
 function formatProdErrorMessage(code) {
   var url = 'https://reactjs.org/docs/error-decoder.html?invariant=' + code;
 
   for (var i = 1; i < arguments.length; i++) {
     url += '&args[]=' + encodeURIComponent(arguments[i]);
   }
 
   return "Minified React error #" + code + "; visit " + url + " for the full message or " + 'use the non-minified dev environment for full errors and additional ' + 'helpful warnings.';
 }
 /***************** debugger packages/shared/formatProdErrorMessage.js ==总14行 end *****************/
 
 /***************** debugger packages/react/src/ReactNoopUpdateQueue.js ==总88行 start *****************/
 /**
  * This is the abstract API for an update queue.
  */
 
 
 var ReactNoopUpdateQueue = {
   /**
    * Checks whether or not this composite component is mounted.
    * @param {ReactClass} publicInstance The instance we want to test.
    * @return {boolean} True if mounted, false otherwise.
    * @protected
    * @final
    */
   isMounted: function (publicInstance) {
     return false;
   },
 
   /**
    * Forces an update. This should only be invoked when it is known with
    * certainty that we are **not** in a DOM transaction.
    *
    * You may want to call this when you know that some deeper aspect of the
    * component's state has changed but `setState` was not called.
    *
    * This will not invoke `shouldComponentUpdate`, but it will invoke
    * `componentWillUpdate` and `componentDidUpdate`.
    *
    * @param {ReactClass} publicInstance The instance that should rerender.
    * @param {?function} callback Called after component is updated.
    * @param {?string} callerName name of the calling function in the public API.
    * @internal
    */
   enqueueForceUpdate: function (publicInstance, callback, callerName) {
   },
 
   /**
    * Replaces all of the state. Always use this or `setState` to mutate state.
    * You should treat `this.state` as immutable.
    *
    * There is no guarantee that `this.state` will be immediately updated, so
    * accessing `this.state` after calling this method may return the old value.
    *
    * @param {ReactClass} publicInstance The instance that should rerender.
    * @param {object} completeState Next state.
    * @param {?function} callback Called after component is updated.
    * @param {?string} callerName name of the calling function in the public API.
    * @internal
    */
   enqueueReplaceState: function (publicInstance, completeState, callback, callerName) {
   },
 
   /**
    * Sets a subset of the state. This only exists because _pendingState is
    * internal. This provides a merging strategy that is not available to deep
    * properties which is confusing. TODO: Expose pendingState or don't use it
    * during the merge.
    *
    * @param {ReactClass} publicInstance The instance that should rerender.
    * @param {object} partialState Next partial state to be merged with state.
    * @param {?function} callback Called after component is updated.
    * @param {?string} Name of the calling function in the public API.
    * @internal
    */
   enqueueSetState: function (publicInstance, partialState, callback, callerName) {
   }
 };
 /***************** debugger packages/react/src/ReactNoopUpdateQueue.js ==总88行 end *****************/
 
 /***************** debugger packages/react/src/ReactBaseClasses.js ==总132行 start *****************/
 var emptyObject = {};
 /**
  * Base class helpers for the updating state of a component.
  */
 
 
 function Component(props, context, updater) {
   this.props = props;
   this.context = context; // If a component has string refs, we will assign a different object later.
 
   this.refs = emptyObject; // We initialize the default updater but the real one gets injected by the
   // renderer.
 
   this.updater = updater || ReactNoopUpdateQueue;
 }
 
 Component.prototype.isReactComponent = {};
 /**
  * Sets a subset of the state. Always use this to mutate
  * state. You should treat `this.state` as immutable.
  *
  * There is no guarantee that `this.state` will be immediately updated, so
  * accessing `this.state` after calling this method may return the old value.
  *
  * There is no guarantee that calls to `setState` will run synchronously,
  * as they may eventually be batched together.  You can provide an optional
  * callback that will be executed when the call to setState is actually
  * completed.
  *
  * When a function is provided to setState, it will be called at some point in
  * the future (not synchronously). It will be called with the up to date
  * component arguments (state, props, context). These values can be different
  * from this.* because your function may be called after receiveProps but before
  * shouldComponentUpdate, and this new state, props, and context will not yet be
  * assigned to this.
  *
  * @param {object|function} partialState Next partial state or function to
  *        produce next partial state to be merged with current state.
  * @param {?function} callback Called after state is updated.
  * @final
  * @protected
  */
 
 Component.prototype.setState = function (partialState, callback) {
   if (!(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null)) {
     {
       throw Error( formatProdErrorMessage(85));
     }
   }
 
   this.updater.enqueueSetState(this, partialState, callback, 'setState');
 };
 /**
  * Forces an update. This should only be invoked when it is known with
  * certainty that we are **not** in a DOM transaction.
  *
  * You may want to call this when you know that some deeper aspect of the
  * component's state has changed but `setState` was not called.
  *
  * This will not invoke `shouldComponentUpdate`, but it will invoke
  * `componentWillUpdate` and `componentDidUpdate`.
  *
  * @param {?function} callback Called after update is complete.
  * @final
  * @protected
  */
 
 
 Component.prototype.forceUpdate = function (callback) {
   this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
 };
 
 function ComponentDummy() {}
 
 ComponentDummy.prototype = Component.prototype;
 /**
  * Convenience component with default shallow equality check for sCU.
  */
 
 function PureComponent(props, context, updater) {
   this.props = props;
   this.context = context; // If a component has string refs, we will assign a different object later.
 
   this.refs = emptyObject;
   this.updater = updater || ReactNoopUpdateQueue;
 }
 
 var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
 pureComponentPrototype.constructor = PureComponent; // Avoid an extra prototype jump for these methods.
 
 _assign(pureComponentPrototype, Component.prototype);
 
 pureComponentPrototype.isPureReactComponent = true;
 /***************** debugger packages/react/src/ReactBaseClasses.js ==总132行 end *****************/
 
 /***************** debugger packages/react/src/ReactCreateRef.js ==总12行 start *****************/
 // an immutable object with a single mutable value
 function createRef() {
   var refObject = {
     current: null
   };
 
   return refObject;
 }
 /***************** debugger packages/react/src/ReactCreateRef.js ==总12行 end *****************/
 
 /***************** debugger packages/react/src/ReactElement.js ==总480行 start *****************/
 var hasOwnProperty = Object.prototype.hasOwnProperty;
 var RESERVED_PROPS = {
   key: true,
   ref: true,
   __self: true,
   __source: true
 };
 
 function hasValidRef(config) {
 
   return config.ref !== undefined;
 }
 
 function hasValidKey(config) {
 
   return config.key !== undefined;
 }
 /**
  * Factory method to create a new React element. This no longer adheres to
  * the class pattern, so do not use new to call it. Also, instanceof check
  * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
  * if something is a React Element.
  *
  * @param {*} type
  * @param {*} props
  * @param {*} key
  * @param {string|object} ref
  * @param {*} owner
  * @param {*} self A *temporary* helper to detect places where `this` is
  * different from the `owner` when React.createElement is called, so that we
  * can warn. We want to get rid of owner and replace string `ref`s with arrow
  * functions, and as long as `this` and owner are the same, there will be no
  * change in behavior.
  * @param {*} source An annotation object (added by a transpiler or otherwise)
  * indicating filename, line number, and/or other information.
  * @internal
  */
 
 
 var ReactElement = function (type, key, ref, self, source, owner, props) {
   var element = {
     // This tag allows us to uniquely identify this as a React Element
     $$typeof: REACT_ELEMENT_TYPE,
     // Built-in properties that belong on the element
     type: type,
     key: key,
     ref: ref,
     props: props,
     // Record the component responsible for creating this element.
     _owner: owner
   };
 
   return element;
 };
 /**
  * Create and return a new ReactElement of the given type.
  * See https://reactjs.org/docs/react-api.html#createelement
  */
 
 function createElement(type, config, children) {
   var propName; // Reserved names are extracted
 
   var props = {};
   var key = null;
   var ref = null;
   var self = null;
   var source = null;
 
   if (config != null) {
     if (hasValidRef(config)) {
       ref = config.ref;
     }
 
     if (hasValidKey(config)) {
       key = '' + config.key;
     }
 
     self = config.__self === undefined ? null : config.__self;
     source = config.__source === undefined ? null : config.__source; // Remaining properties are added to a new props object
 
     for (propName in config) {
       if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
         props[propName] = config[propName];
       }
     }
   } // Children can be more than one argument, and those are transferred onto
   // the newly allocated props object.
 
 
   var childrenLength = arguments.length - 2;
 
   if (childrenLength === 1) {
     props.children = children;
   } else if (childrenLength > 1) {
     var childArray = Array(childrenLength);
 
     for (var i = 0; i < childrenLength; i++) {
       childArray[i] = arguments[i + 2];
     }
 
     props.children = childArray;
   } // Resolve default props
 
 
   if (type && type.defaultProps) {
     var defaultProps = type.defaultProps;
 
     for (propName in defaultProps) {
       if (props[propName] === undefined) {
         props[propName] = defaultProps[propName];
       }
     }
   }
 
   return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
 }
 /**
  * Return a function that produces ReactElements of a given type.
  * See https://reactjs.org/docs/react-api.html#createfactory
  */
 
 function createFactory(type) {
   var factory = createElement.bind(null, type); // Expose the type on the factory and the prototype so that it can be
   // easily accessed on elements. E.g. `<Foo />.type === Foo`.
   // This should not be named `constructor` since this may not be the function
   // that created the element, and it may not even be a constructor.
   // Legacy hook: remove it
 
   factory.type = type;
   return factory;
 }
 function cloneAndReplaceKey(oldElement, newKey) {
   var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
   return newElement;
 }
 /**
  * Clone and return a new ReactElement using element as the starting point.
  * See https://reactjs.org/docs/react-api.html#cloneelement
  */
 
 function cloneElement(element, config, children) {
   if (!!(element === null || element === undefined)) {
     {
       throw Error( formatProdErrorMessage(267, element));
     }
   }
 
   var propName; // Original props are copied
 
   var props = _assign({}, element.props); // Reserved names are extracted
 
 
   var key = element.key;
   var ref = element.ref; // Self is preserved since the owner is preserved.
 
   var self = element._self; // Source is preserved since cloneElement is unlikely to be targeted by a
   // transpiler, and the original source is probably a better indicator of the
   // true owner.
 
   var source = element._source; // Owner will be preserved, unless ref is overridden
 
   var owner = element._owner;
 
   if (config != null) {
     if (hasValidRef(config)) {
       // Silently steal the ref from the parent.
       ref = config.ref;
       owner = ReactCurrentOwner.current;
     }
 
     if (hasValidKey(config)) {
       key = '' + config.key;
     } // Remaining properties override existing props
 
 
     var defaultProps;
 
     if (element.type && element.type.defaultProps) {
       defaultProps = element.type.defaultProps;
     }
 
     for (propName in config) {
       if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
         if (config[propName] === undefined && defaultProps !== undefined) {
           // Resolve default props
           props[propName] = defaultProps[propName];
         } else {
           props[propName] = config[propName];
         }
       }
     }
   } // Children can be more than one argument, and those are transferred onto
   // the newly allocated props object.
 
 
   var childrenLength = arguments.length - 2;
 
   if (childrenLength === 1) {
     props.children = children;
   } else if (childrenLength > 1) {
     var childArray = Array(childrenLength);
 
     for (var i = 0; i < childrenLength; i++) {
       childArray[i] = arguments[i + 2];
     }
 
     props.children = childArray;
   }
 
   return ReactElement(element.type, key, ref, self, source, owner, props);
 }
 /**
  * Verifies the object is a ReactElement.
  * See https://reactjs.org/docs/react-api.html#isvalidelement
  * @param {?object} object
  * @return {boolean} True if `object` is a ReactElement.
  * @final
  */
 
 function isValidElement(object) {
   return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
 }
 /***************** debugger packages/react/src/ReactElement.js ==总480行 end *****************/
 
 /***************** debugger packages/react/src/ReactChildren.js ==总273行 start *****************/
 var SEPARATOR = '.';
 var SUBSEPARATOR = ':';
 /**
  * Escape and wrap key so it is safe to use as a reactid
  *
  * @param {string} key to be escaped.
  * @return {string} the escaped key.
  */
 
 function escape(key) {
   var escapeRegex = /[=:]/g;
   var escaperLookup = {
     '=': '=0',
     ':': '=2'
   };
   var escapedString = key.replace(escapeRegex, function (match) {
     return escaperLookup[match];
   });
   return '$' + escapedString;
 }
 var userProvidedKeyEscapeRegex = /\/+/g;
 
 function escapeUserProvidedKey(text) {
   return text.replace(userProvidedKeyEscapeRegex, '$&/');
 }
 /**
  * Generate a key string that identifies a element within a set.
  *
  * @param {*} element A element that could contain a manual key.
  * @param {number} index Index that is used if a manual key is not provided.
  * @return {string}
  */
 
 
 function getElementKey(element, index) {
   // Do some typechecking here since we call this blindly. We want to ensure
   // that we don't block potential future ES APIs.
   if (typeof element === 'object' && element !== null && element.key != null) {
     // Explicit key
     return escape('' + element.key);
   } // Implicit key determined by the index in the set
 
 
   return index.toString(36);
 }
 
 function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
   var type = typeof children;
 
   if (type === 'undefined' || type === 'boolean') {
     // All of the above are perceived as null.
     children = null;
   }
 
   var invokeCallback = false;
 
   if (children === null) {
     invokeCallback = true;
   } else {
     switch (type) {
       case 'string':
       case 'number':
         invokeCallback = true;
         break;
 
       case 'object':
         switch (children.$$typeof) {
           case REACT_ELEMENT_TYPE:
           case REACT_PORTAL_TYPE:
             invokeCallback = true;
         }
 
     }
   }
 
   if (invokeCallback) {
     var _child = children;
     var mappedChild = callback(_child); // If it's the only child, treat the name as if it was wrapped in an array
     // so that it's consistent if the number of children grows:
 
     var childKey = nameSoFar === '' ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;
 
     if (Array.isArray(mappedChild)) {
       var escapedChildKey = '';
 
       if (childKey != null) {
         escapedChildKey = escapeUserProvidedKey(childKey) + '/';
       }
 
       mapIntoArray(mappedChild, array, escapedChildKey, '', function (c) {
         return c;
       });
     } else if (mappedChild != null) {
       if (isValidElement(mappedChild)) {
         mappedChild = cloneAndReplaceKey(mappedChild, // Keep both the (mapped) and old keys if they differ, just as
         // traverseAllChildren used to do for objects as children
         escapedPrefix + ( // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
         mappedChild.key && (!_child || _child.key !== mappedChild.key) ? // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
         escapeUserProvidedKey('' + mappedChild.key) + '/' : '') + childKey);
       }
 
       array.push(mappedChild);
     }
 
     return 1;
   }
 
   var child;
   var nextName;
   var subtreeCount = 0; // Count of children found in the current subtree.
 
   var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;
 
   if (Array.isArray(children)) {
     for (var i = 0; i < children.length; i++) {
       child = children[i];
       nextName = nextNamePrefix + getElementKey(child, i);
       subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
     }
   } else {
     var iteratorFn = getIteratorFn(children);
 
     if (typeof iteratorFn === 'function') {
       var iterableChildren = children;
 
       var iterator = iteratorFn.call(iterableChildren);
       var step;
       var ii = 0;
 
       while (!(step = iterator.next()).done) {
         child = step.value;
         nextName = nextNamePrefix + getElementKey(child, ii++);
         subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
       }
     } else if (type === 'object') {
       var childrenString = '' + children;
 
       {
         {
           throw Error( formatProdErrorMessage(31, childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString));
         }
       }
     }
   }
 
   return subtreeCount;
 }
 
 /**
  * Maps children that are typically specified as `props.children`.
  *
  * See https://reactjs.org/docs/react-api.html#reactchildrenmap
  *
  * The provided mapFunction(child, index) will be called for each
  * leaf child.
  *
  * @param {?*} children Children tree container.
  * @param {function(*, int)} func The map function.
  * @param {*} context Context for mapFunction.
  * @return {object} Object containing the ordered map of results.
  */
 function mapChildren(children, func, context) {
   if (children == null) {
     return children;
   }
 
   var result = [];
   var count = 0;
   mapIntoArray(children, result, '', '', function (child) {
     return func.call(context, child, count++);
   });
   return result;
 }
 /**
  * Count the number of children that are typically specified as
  * `props.children`.
  *
  * See https://reactjs.org/docs/react-api.html#reactchildrencount
  *
  * @param {?*} children Children tree container.
  * @return {number} The number of children.
  */
 
 
 function countChildren(children) {
   var n = 0;
   mapChildren(children, function () {
     n++; // Don't return anything
   });
   return n;
 }
 
 /**
  * Iterates through children that are typically specified as `props.children`.
  *
  * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
  *
  * The provided forEachFunc(child, index) will be called for each
  * leaf child.
  *
  * @param {?*} children Children tree container.
  * @param {function(*, int)} forEachFunc
  * @param {*} forEachContext Context for forEachContext.
  */
 function forEachChildren(children, forEachFunc, forEachContext) {
   mapChildren(children, function () {
     forEachFunc.apply(this, arguments); // Don't return anything.
   }, forEachContext);
 }
 /**
  * Flatten a children object (typically specified as `props.children`) and
  * return an array with appropriately re-keyed children.
  *
  * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
  */
 
 
 function toArray(children) {
   return mapChildren(children, function (child) {
     return child;
   }) || [];
 }
 /**
  * Returns the first child in a collection of children and verifies that there
  * is only one child in the collection.
  *
  * See https://reactjs.org/docs/react-api.html#reactchildrenonly
  *
  * The current implementation of this function assumes that a single child gets
  * passed without a wrapper, but the purpose of this helper function is to
  * abstract away the particular structure of children.
  *
  * @param {?object} children Child collection structure.
  * @return {ReactElement} The first and only `ReactElement` contained in the
  * structure.
  */
 
 
 function onlyChild(children) {
   if (!isValidElement(children)) {
     {
       throw Error( formatProdErrorMessage(143));
     }
   }
 
   return children;
 }
 /***************** debugger packages/react/src/ReactChildren.js ==总273行 end *****************/
 
 /***************** debugger packages/react/src/ReactContext.js ==总125行 start *****************/
 function createContext(defaultValue, calculateChangedBits) {
   if (calculateChangedBits === undefined) {
     calculateChangedBits = null;
   }
 
   var context = {
     $$typeof: REACT_CONTEXT_TYPE,
     _calculateChangedBits: calculateChangedBits,
     // As a workaround to support multiple concurrent renderers, we categorize
     // some renderers as primary and others as secondary. We only expect
     // there to be two concurrent renderers at most: React Native (primary) and
     // Fabric (secondary); React DOM (primary) and React ART (secondary).
     // Secondary renderers store their context values on separate fields.
     _currentValue: defaultValue,
     _currentValue2: defaultValue,
     // Used to track how many concurrent renderers this context currently
     // supports within in a single renderer. Such as parallel server rendering.
     _threadCount: 0,
     // These are circular
     Provider: null,
     Consumer: null
   };
   context.Provider = {
     $$typeof: REACT_PROVIDER_TYPE,
     _context: context
   };
 
   {
     context.Consumer = context;
   }
 
   return context;
 }
 /***************** debugger packages/react/src/ReactContext.js ==总125行 end *****************/
 
 /***************** debugger packages/react/src/ReactLazy.js ==总103行 start *****************/
 var Uninitialized = -1;
 var Pending = 0;
 var Resolved = 1;
 var Rejected = 2;
 
 function lazyInitializer(payload) {
   if (payload._status === Uninitialized) {
     var ctor = payload._result;
     var thenable = ctor(); // Transition to the next state.
 
     var pending = payload;
     pending._status = Pending;
     pending._result = thenable;
     thenable.then(function (moduleObject) {
       if (payload._status === Pending) {
         var defaultExport = moduleObject.default;
 
 
         var resolved = payload;
         resolved._status = Resolved;
         resolved._result = defaultExport;
       }
     }, function (error) {
       if (payload._status === Pending) {
         // Transition to the next state.
         var rejected = payload;
         rejected._status = Rejected;
         rejected._result = error;
       }
     });
   }
 
   if (payload._status === Resolved) {
     return payload._result;
   } else {
     throw payload._result;
   }
 }
 
 function lazy(ctor) {
   var payload = {
     // We use these fields to store the result.
     _status: -1,
     _result: ctor
   };
   var lazyType = {
     $$typeof: REACT_LAZY_TYPE,
     _payload: payload,
     _init: lazyInitializer
   };
 
   return lazyType;
 }
 /***************** debugger packages/react/src/ReactLazy.js ==总103行 end *****************/
 
 /***************** debugger packages/react/src/ReactForwardRef.js ==总46行 start *****************/
 function forwardRef(render) {
 
   var elementType = {
     $$typeof: REACT_FORWARD_REF_TYPE,
     render: render
   };
 
   return elementType;
 }
 /***************** debugger packages/react/src/ReactForwardRef.js ==总46行 end *****************/
 
 /***************** debugger packages/react/src/ReactMemo.js ==总36行 start *****************/
 function memo(type, compare) {
 
   var elementType = {
     $$typeof: REACT_MEMO_TYPE,
     type: type,
     compare: compare === undefined ? null : compare
   };
 
   return elementType;
 }
 /***************** debugger packages/react/src/ReactMemo.js ==总36行 end *****************/
 
 /***************** debugger packages/react/src/ReactBlock.js ==总65行 start *****************/
 
 function lazyInitializer$1(payload) {
   return {
     $$typeof: REACT_BLOCK_TYPE,
     _data: payload.load.apply(null, payload.args),
     _render: payload.render
   };
 }
 
 function block(render, load) {
 
   if (load === undefined) {
     return function () {
       var blockComponent = {
         $$typeof: REACT_BLOCK_TYPE,
         _data: undefined,
         // $FlowFixMe: Data must be void in this scenario.
         _render: render
       }; // $FlowFixMe: Upstream BlockComponent to Flow as a valid Node.
 
       return blockComponent;
     };
   } // Trick to let Flow refine this.
 
 
   var loadFn = load;
   return function () {
     var args = arguments;
     var payload = {
       load: loadFn,
       args: args,
       render: render
     };
     var lazyType = {
       $$typeof: REACT_LAZY_TYPE,
       _payload: payload,
       _init: lazyInitializer$1
     }; // $FlowFixMe: Upstream BlockComponent to Flow as a valid Node.
 
     return lazyType;
   };
 }
 /***************** debugger packages/react/src/ReactBlock.js ==总65行 end *****************/
 
 /***************** debugger packages/react/src/ReactHooks.js ==总95行 start *****************/
 
 function resolveDispatcher() {
   var dispatcher = ReactCurrentDispatcher.current;
 
   if (!(dispatcher !== null)) {
     {
       throw Error( formatProdErrorMessage(321));
     }
   }
 
   return dispatcher;
 }
 
 function useContext(Context, unstable_observedBits) {
   var dispatcher = resolveDispatcher();
 
   return dispatcher.useContext(Context, unstable_observedBits);
 }
 function useState(initialState) {
   var dispatcher = resolveDispatcher();
   return dispatcher.useState(initialState);
 }
 function useReducer(reducer, initialArg, init) {
   var dispatcher = resolveDispatcher();
   return dispatcher.useReducer(reducer, initialArg, init);
 }
 function useRef(initialValue) {
   var dispatcher = resolveDispatcher();
   return dispatcher.useRef(initialValue);
 }
 function useEffect(create, deps) {
   var dispatcher = resolveDispatcher();
   return dispatcher.useEffect(create, deps);
 }
 function useLayoutEffect(create, deps) {
   var dispatcher = resolveDispatcher();
   return dispatcher.useLayoutEffect(create, deps);
 }
 function useCallback(callback, deps) {
   var dispatcher = resolveDispatcher();
   return dispatcher.useCallback(callback, deps);
 }
 function useMemo(create, deps) {
   var dispatcher = resolveDispatcher();
   return dispatcher.useMemo(create, deps);
 }
 function useImperativeHandle(ref, create, deps) {
   var dispatcher = resolveDispatcher();
   return dispatcher.useImperativeHandle(ref, create, deps);
 }
 function useDebugValue(value, formatterFn) {
 }
 function useTransition() {
   var dispatcher = resolveDispatcher();
   return dispatcher.useTransition();
 }
 function useDeferredValue(value) {
   var dispatcher = resolveDispatcher();
   return dispatcher.useDeferredValue(value);
 }
 function useOpaqueIdentifier() {
   var dispatcher = resolveDispatcher();
   return dispatcher.useOpaqueIdentifier();
 }
 function useMutableSource(source, getSnapshot, subscribe) {
   var dispatcher = resolveDispatcher();
   return dispatcher.useMutableSource(source, getSnapshot, subscribe);
 }
 /***************** debugger packages/react/src/ReactHooks.js ==总95行 end *****************/
 
 /***************** debugger packages/react/src/ReactMutableSource.js ==总15行 start *****************/
 function createMutableSource(source, getVersion) {
   var mutableSource = {
     _getVersion: getVersion,
     _source: source,
     _workInProgressVersionPrimary: null,
     _workInProgressVersionSecondary: null
   };
 
   return mutableSource;
 }
 /***************** debugger packages/react/src/ReactMutableSource.js ==总15行 end *****************/
 
 /***************** debugger packages/react/src/ReactStartTransition.js ==总11行 start *****************/
 function startTransition(scope) {
   var prevTransition = ReactCurrentBatchConfig.transition;
   ReactCurrentBatchConfig.transition = 1;
 
   try {
     scope();
   } finally {
     ReactCurrentBatchConfig.transition = prevTransition;
   }
 }
 /***************** debugger packages/react/src/ReactStartTransition.js ==总11行 end *****************/
 
 /***************** debugger packages/react/src/React.js ==总34行 start *****************/
 
 var createElement$1 =  createElement;
 var cloneElement$1 =  cloneElement;
 var createFactory$1 =  createFactory;
 var Children = {
   map: mapChildren,
   forEach: forEachChildren,
   count: countChildren,
   toArray: toArray,
   only: onlyChild
 };
 /***************** debugger packages/react/src/React.js ==总34行 end *****************/
 
 exports.Children = Children;
 exports.Component = Component;
 exports.PureComponent = PureComponent;
 exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
 exports.cloneElement = cloneElement$1;
 exports.createContext = createContext;
 exports.createElement = createElement$1;
 exports.createFactory = createFactory$1;
 exports.createRef = createRef;
 exports.forwardRef = forwardRef;
 exports.isValidElement = isValidElement;
 exports.lazy = lazy;
 exports.memo = memo;
 exports.unstable_block = block;
 exports.unstable_createMutableSource = createMutableSource;
 exports.unstable_startTransition = startTransition;
 exports.unstable_useDeferredValue = useDeferredValue;
 exports.unstable_useMutableSource = useMutableSource;
 exports.unstable_useOpaqueIdentifier = useOpaqueIdentifier;
 exports.unstable_useTransition = useTransition;
 exports.useCallback = useCallback;
 exports.useContext = useContext;
 exports.useDebugValue = useDebugValue;
 exports.useEffect = useEffect;
 exports.useImperativeHandle = useImperativeHandle;
 exports.useLayoutEffect = useLayoutEffect;
 exports.useMemo = useMemo;
 exports.useReducer = useReducer;
 exports.useRef = useRef;
 exports.useState = useState;
 exports.version = ReactVersion;
   })();
 }
 