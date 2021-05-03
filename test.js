!function(t) {
  if ("object" == typeof exports && "undefined" != typeof module)
    module.exports = t();
  else if ("function" == typeof define && define.amd)
    define([], t);
  else {
    var e;
    e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this,
        e.videoPlayer = t()
  }
}(function() {
  var t;
  return function e(t, n, o) {
    function r(s, a) {
      if (!n[s]) {
        if (!t[s]) {
          var l = "function" == typeof require && require;
          if (!a && l)
            return l(s, !0);
          if (i)
            return i(s, !0);
          var u = new Error("Cannot find module '" + s + "'");
          throw u.code = "MODULE_NOT_FOUND",
              u
        }
        var c = n[s] = {
          exports: {}
        };
        t[s][0].call(c.exports, function(e) {
          var n = t[s][1][e];
          return r(n ? n : e)
        }, c, c.exports, e, t, n, o)
      }
      return n[s].exports
    }
    for (var i = "function" == typeof require && require, s = 0; s < o.length; s++)
      r(o[s]);
    return r
  }({
    1: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("./button.js")
          , l = o(a)
          , u = t("./component.js")
          , c = o(u)
          , p = function(t) {
        function e(n, o) {
          return r(this, e),
              i(this, t.call(this, n, o))
        }
        return s(e, t),
            e.prototype.buildCSSClass = function() {
              return "vjs-big-play-button"
            }
            ,
            e.prototype.handleClick = function() {
              this.player_.play()
            }
            ,
            e
      }(l["default"]);
      p.prototype.controlText_ = "Play Video",
          c["default"].registerComponent("BigPlayButton", p),
          n["default"] = p
    }
      , {
        "./button.js": 2,
        "./component.js": 5
      }],
    2: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("./clickable-component.js")
          , l = o(a)
          , u = t("./component")
          , c = o(u)
          , p = t("./utils/log.js")
          , f = o(p)
          , h = t("object.assign")
          , d = o(h)
          , y = function(t) {
        function e(n, o) {
          return r(this, e),
              i(this, t.call(this, n, o))
        }
        return s(e, t),
            e.prototype.createEl = function() {
              var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "button"
                  , e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
                  , n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
              e = d["default"]({
                className: this.buildCSSClass()
              }, e),
              "button" !== t && (f["default"].warn("Creating a Button with an HTML element of " + t + " is deprecated; use ClickableComponent instead."),
                  e = d["default"]({
                    tabIndex: 0
                  }, e),
                  n = d["default"]({
                    role: "button"
                  }, n)),
                  n = d["default"]({
                    type: "button",
                    "aria-live": "polite"
                  }, n);
              var o = c["default"].prototype.createEl.call(this, t, e, n);
              return this.createControlTextEl(o),
                  o
            }
            ,
            e.prototype.addChild = function(t) {
              var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
                  , n = this.constructor.name;
              return f["default"].warn("Adding an actionable (user controllable) child to a Button (" + n + ") is not supported; use a ClickableComponent instead."),
                  c["default"].prototype.addChild.call(this, t, e)
            }
            ,
            e.prototype.handleKeyPress = function(e) {
              32 !== e.which && 13 !== e.which && t.prototype.handleKeyPress.call(this, e)
            }
            ,
            e
      }(l["default"]);
      c["default"].registerComponent("Button", y),
          n["default"] = y
    }
      , {
        "./clickable-component.js": 3,
        "./component": 5,
        "./utils/log.js": 89,
        "object.assign": 140
      }],
    3: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("./component")
          , u = r(l)
          , c = t("./utils/dom.js")
          , p = o(c)
          , f = t("./utils/events.js")
          , h = o(f)
          , d = t("./utils/fn.js")
          , y = o(d)
          , v = t("./utils/log.js")
          , g = r(v)
          , m = t("global/document")
          , b = r(m)
          , _ = t("object.assign")
          , j = r(_)
          , w = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.emitTapEvents(),
              r.on("tap", r.handleClick),
              r.on("click", r.handleClick),
              r.on("focus", r.handleFocus),
              r.on("blur", r.handleBlur),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "div"
                  , n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
                  , o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
              n = j["default"]({
                className: this.buildCSSClass(),
                tabIndex: 0
              }, n),
              "button" === e && g["default"].error("Creating a ClickableComponent with an HTML element of " + e + " is not supported; use a Button instead."),
                  o = j["default"]({
                    role: "button",
                    "aria-live": "polite"
                  }, o);
              var r = t.prototype.createEl.call(this, e, n, o);
              return this.createControlTextEl(r),
                  r
            }
            ,
            e.prototype.createControlTextEl = function(t) {
              return this.controlTextEl_ = p.createEl("span", {
                className: "vjs-control-text"
              }),
              t && t.appendChild(this.controlTextEl_),
                  this.controlText(this.controlText_, t),
                  this.controlTextEl_
            }
            ,
            e.prototype.controlText = function(t) {
              var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.el();
              if (!t)
                return this.controlText_ || "Need Text";
              var n = this.localize(t);
              return this.controlText_ = t,
                  this.controlTextEl_.innerHTML = n,
                  e.setAttribute("title", n),
                  this
            }
            ,
            e.prototype.buildCSSClass = function() {
              return "vjs-control vjs-button " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.addChild = function(e) {
              var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
              return t.prototype.addChild.call(this, e, n)
            }
            ,
            e.prototype.enable = function() {
              return this.removeClass("vjs-disabled"),
                  this.el_.setAttribute("aria-disabled", "false"),
                  this
            }
            ,
            e.prototype.disable = function() {
              return this.addClass("vjs-disabled"),
                  this.el_.setAttribute("aria-disabled", "true"),
                  this
            }
            ,
            e.prototype.handleClick = function() {}
            ,
            e.prototype.handleFocus = function() {
              h.on(b["default"], "keydown", y.bind(this, this.handleKeyPress))
            }
            ,
            e.prototype.handleKeyPress = function(e) {
              32 === e.which || 13 === e.which ? (e.preventDefault(),
                  this.handleClick(e)) : t.prototype.handleKeyPress && t.prototype.handleKeyPress.call(this, e)
            }
            ,
            e.prototype.handleBlur = function() {
              h.off(b["default"], "keydown", y.bind(this, this.handleKeyPress))
            }
            ,
            e
      }(u["default"]);
      u["default"].registerComponent("ClickableComponent", w),
          n["default"] = w
    }
      , {
        "./component": 5,
        "./utils/dom.js": 84,
        "./utils/events.js": 85,
        "./utils/fn.js": 86,
        "./utils/log.js": 89,
        "global/document": 96,
        "object.assign": 140
      }],
    4: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("./button")
          , l = o(a)
          , u = t("./component")
          , c = o(u)
          , p = function(t) {
        function e(n, o) {
          r(this, e);
          var s = i(this, t.call(this, n, o));
          return s.controlText(o && o.controlText || s.localize("Close")),
              s
        }
        return s(e, t),
            e.prototype.buildCSSClass = function() {
              return "vjs-close-button " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.handleClick = function() {
              this.trigger({
                type: "close",
                bubbles: !1
              })
            }
            ,
            e
      }(l["default"]);
      c["default"].registerComponent("CloseButton", p),
          n["default"] = p
    }
      , {
        "./button": 2,
        "./component": 5
      }],
    5: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      n.__esModule = !0;
      var s = t("global/window")
          , a = r(s)
          , l = t("./utils/dom.js")
          , u = o(l)
          , c = t("./utils/fn.js")
          , p = o(c)
          , f = t("./utils/guid.js")
          , h = o(f)
          , d = t("./utils/events.js")
          , y = o(d)
          , v = t("./utils/log.js")
          , g = r(v)
          , m = t("./utils/to-title-case.js")
          , b = r(m)
          , _ = t("./utils/merge-options.js")
          , j = r(_)
          , w = function() {
        function t(e, n, o) {
          if (i(this, t),
              this.player_ = !e && this.play ? e = this : e,
              this.options_ = j["default"]({}, this.options_),
              n = this.options_ = j["default"](this.options_, n),
              this.id_ = n.id || n.el && n.el.id,
              !this.id_) {
            var r = e && e.id && e.id() || "no_player";
            this.id_ = r + "_component_" + h.newGUID()
          }
          this.name_ = n.name || null,
              n.el ? this.el_ = n.el : n.createEl !== !1 && (this.el_ = this.createEl(n.type, n.props, n.attrs)),
              this.children_ = [],
              this.childIndex_ = {},
              this.childNameIndex_ = {},
          n.initChildren !== !1 && this.initChildren(),
              this.ready(o),
          n.reportTouchActivity !== !1 && this.enableTouchActivity()
        }
        return t.prototype.dispose = function() {
          if (this.trigger({
            type: "dispose",
            bubbles: !1
          }),
              this.children_)
            for (var t = this.children_.length - 1; t >= 0; t--)
              this.children_[t].dispose && this.children_[t].dispose();
          this.children_ = null,
              this.childIndex_ = null,
              this.childNameIndex_ = null,
              this.off(),
          this.el_.parentNode && this.el_.parentNode.removeChild(this.el_),
              u.removeElData(this.el_),
              this.el_ = null
        }
            ,
            t.prototype.player = function() {
              return this.player_
            }
            ,
            t.prototype.options = function(t) {
              return g["default"].warn("this.options() has been deprecated and will be moved to the constructor in 6.0"),
                  t ? (this.options_ = j["default"](this.options_, t),
                      this.options_) : this.options_
            }
            ,
            t.prototype.el = function() {
              return this.el_
            }
            ,
            t.prototype.createEl = function(t, e, n) {
              return u.createEl(t, e, n)
            }
            ,
            t.prototype.localize = function(t) {
              var e = this.player_.language && this.player_.language()
                  , n = this.player_.languages && this.player_.languages();
              if (!e || !n)
                return t;
              var o = n[e];
              if (o && o[t])
                return o[t];
              var r = e.split("-")[0]
                  , i = n[r];
              return i && i[t] ? i[t] : t
            }
            ,
            t.prototype.contentEl = function() {
              return this.contentEl_ || this.el_
            }
            ,
            t.prototype.id = function() {
              return this.id_
            }
            ,
            t.prototype.name = function() {
              return this.name_
            }
            ,
            t.prototype.children = function() {
              return this.children_
            }
            ,
            t.prototype.getChildById = function(t) {
              return this.childIndex_[t]
            }
            ,
            t.prototype.getChild = function(t) {
              return this.childNameIndex_[t]
            }
            ,
            t.prototype.addChild = function(e) {
              var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
                  , o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : this.children_.length
                  , r = void 0
                  , i = void 0;
              if ("string" == typeof e) {
                i = e,
                n || (n = {}),
                n === !0 && (g["default"].warn("Initializing a child component with `true` is deprecated. Children should be defined in an array when possible, but if necessary use an object instead of `true`."),
                    n = {});
                var s = n.componentClass || b["default"](i);
                n.name = i;
                var a = t.getComponent(s);
                if (!a)
                  throw new Error("Component " + s + " does not exist");
                if ("function" != typeof a)
                  return null;
                r = new a(this.player_ || this,n)
              } else
                r = e;
              if (this.children_.splice(o, 0, r),
              "function" == typeof r.id && (this.childIndex_[r.id()] = r),
                  i = i || r.name && r.name(),
              i && (this.childNameIndex_[i] = r),
              "function" == typeof r.el && r.el()) {
                var l = this.contentEl().children
                    , u = l[o] || null;
                this.contentEl().insertBefore(r.el(), u)
              }
              return r
            }
            ,
            t.prototype.removeChild = function(t) {
              if ("string" == typeof t && (t = this.getChild(t)),
              t && this.children_) {
                for (var e = !1, n = this.children_.length - 1; n >= 0; n--)
                  if (this.children_[n] === t) {
                    e = !0,
                        this.children_.splice(n, 1);
                    break
                  }
                if (e) {
                  this.childIndex_[t.id()] = null,
                      this.childNameIndex_[t.name()] = null;
                  var o = t.el();
                  o && o.parentNode === this.contentEl() && this.contentEl().removeChild(t.el())
                }
              }
            }
            ,
            t.prototype.initChildren = function() {
              var e = this
                  , n = this.options_.children;
              n && !function() {
                var o = e.options_
                    , r = function(t) {
                  var n = t.name
                      , r = t.opts;
                  if (void 0 !== o[n] && (r = o[n]),
                  r !== !1) {
                    r === !0 && (r = {}),
                        r.playerOptions = e.options_.playerOptions;
                    var i = e.addChild(n, r);
                    i && (e[n] = i)
                  }
                }
                    , i = void 0
                    , s = t.getComponent("Tech");
                i = Array.isArray(n) ? n : Object.keys(n),
                    i.concat(Object.keys(e.options_).filter(function(t) {
                      return !i.some(function(e) {
                        return "string" == typeof e ? t === e : t === e.name
                      })
                    })).map(function(t) {
                      var o = void 0
                          , r = void 0;
                      return "string" == typeof t ? (o = t,
                          r = n[o] || e.options_[o] || {}) : (o = t.name,
                          r = t),
                          {
                            name: o,
                            opts: r
                          }
                    }).filter(function(e) {
                      var n = t.getComponent(e.opts.componentClass || b["default"](e.name));
                      return n && !s.isTech(n)
                    }).forEach(r)
              }()
            }
            ,
            t.prototype.buildCSSClass = function() {
              return ""
            }
            ,
            t.prototype.on = function(t, e, n) {
              var o = this;
              return "string" == typeof t || Array.isArray(t) ? y.on(this.el_, t, p.bind(this, e)) : !function() {
                var r = t
                    , i = e
                    , s = p.bind(o, n)
                    , a = function() {
                  return o.off(r, i, s)
                };
                a.guid = s.guid,
                    o.on("dispose", a);
                var l = function() {
                  return o.off("dispose", a)
                };
                l.guid = s.guid,
                    t.nodeName ? (y.on(r, i, s),
                        y.on(r, "dispose", l)) : "function" == typeof t.on && (r.on(i, s),
                        r.on("dispose", l))
              }(),
                  this
            }
            ,
            t.prototype.off = function(t, e, n) {
              if (!t || "string" == typeof t || Array.isArray(t))
                y.off(this.el_, t, e);
              else {
                var o = t
                    , r = e
                    , i = p.bind(this, n);
                this.off("dispose", i),
                    t.nodeName ? (y.off(o, r, i),
                        y.off(o, "dispose", i)) : (o.off(r, i),
                        o.off("dispose", i))
              }
              return this
            }
            ,
            t.prototype.one = function(t, e, n) {
              var o = this
                  , r = arguments;
              return "string" == typeof t || Array.isArray(t) ? y.one(this.el_, t, p.bind(this, e)) : !function() {
                var i = t
                    , s = e
                    , a = p.bind(o, n)
                    , l = function u() {
                  o.off(i, s, u),
                      a.apply(null, r)
                };
                l.guid = a.guid,
                    o.on(i, s, l)
              }(),
                  this
            }
            ,
            t.prototype.trigger = function(t, e) {
              return y.trigger(this.el_, t, e),
                  this
            }
            ,
            t.prototype.triggerEvent = function(t) {
              var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
                  , n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : !1
                  , o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : !1
                  , r = a["default"].Event
                  , i = null;
              return "function" == typeof r ? i = new r(t,{
                bubbles: n,
                cancelable: o
              }) : (i = a["default"].document.createEvent("HTMLEvents"),
                  i.initEvent("click", n, o)),
                  i.data = e,
                  this.el_.dispatchEvent(i),
                  this
            }
            ,
            t.prototype.ready = function(t) {
              var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : !1;
              return t && (this.isReady_ ? e ? t.call(this) : this.setTimeout(t, 1) : (this.readyQueue_ = this.readyQueue_ || [],
                  this.readyQueue_.push(t))),
                  this
            }
            ,
            t.prototype.triggerReady = function() {
              this.isReady_ = !0,
                  this.setTimeout(function() {
                    var t = this.readyQueue_;
                    this.readyQueue_ = [],
                    t && t.length > 0 && t.forEach(function(t) {
                      t.call(this)
                    }, this),
                        this.trigger("ready")
                  }, 1)
            }
            ,
            t.prototype.$ = function(t, e) {
              return u.$(t, e || this.contentEl())
            }
            ,
            t.prototype.$$ = function(t, e) {
              return u.$$(t, e || this.contentEl())
            }
            ,
            t.prototype.hasClass = function(t) {
              return u.hasElClass(this.el_, t)
            }
            ,
            t.prototype.addClass = function(t) {
              return u.addElClass(this.el_, t),
                  this
            }
            ,
            t.prototype.removeClass = function(t) {
              return u.removeElClass(this.el_, t),
                  this
            }
            ,
            t.prototype.toggleClass = function(t, e) {
              return u.toggleElClass(this.el_, t, e),
                  this
            }
            ,
            t.prototype.show = function() {
              return this.removeClass("vjs-hidden"),
                  this
            }
            ,
            t.prototype.hide = function() {
              return this.addClass("vjs-hidden"),
                  this
            }
            ,
            t.prototype.isHide = function() {
              return this.hasClass("vjs-hidden")
            }
            ,
            t.prototype.lockShowing = function() {
              return this.addClass("vjs-lock-showing"),
                  this
            }
            ,
            t.prototype.unlockShowing = function() {
              return this.removeClass("vjs-lock-showing"),
                  this
            }
            ,
            t.prototype.width = function(t, e) {
              return this.dimension("width", t, e)
            }
            ,
            t.prototype.height = function(t, e) {
              return this.dimension("height", t, e)
            }
            ,
            t.prototype.dimensions = function(t, e) {
              return this.width(t, !0).height(e)
            }
            ,
            t.prototype.dimension = function(t, e, n) {
              if (void 0 !== e)
                return (null === e || e !== e) && (e = 0),
                    this.el_.style[t] = -1 !== ("" + e).indexOf("%") || -1 !== ("" + e).indexOf("px") ? e : "auto" === e ? "" : e + "px",
                n || this.trigger("resize"),
                    this;
              if (!this.el_)
                return 0;
              var o = this.el_.style[t]
                  , r = o.indexOf("px");
              return -1 !== r ? parseInt(o.slice(0, r), 10) : parseInt(this.el_["offset" + b["default"](t)], 10)
            }
            ,
            t.prototype.currentDimension = function(t) {
              var e = 0;
              if ("width" !== t && "height" !== t)
                throw new Error("currentDimension only accepts width or height value");
              if ("function" == typeof a["default"].getComputedStyle) {
                var n = a["default"].getComputedStyle(this.el_);
                e = n.getPropertyValue(t) || n[t]
              } else if (this.el_.currentStyle) {
                var o = "offset" + b["default"](t);
                e = this.el_[o]
              }
              return e = parseFloat(e)
            }
            ,
            t.prototype.currentDimensions = function() {
              return {
                width: this.currentDimension("width"),
                height: this.currentDimension("height")
              }
            }
            ,
            t.prototype.currentWidth = function() {
              return this.currentDimension("width")
            }
            ,
            t.prototype.currentHeight = function() {
              return this.currentDimension("height")
            }
            ,
            t.prototype.emitTapEvents = function() {
              var t = 0
                  , e = null
                  , n = 10
                  , o = 200
                  , r = void 0;
              this.on("touchstart", function(n) {
                1 === n.touches.length && (e = {
                  pageX: n.touches[0].pageX,
                  pageY: n.touches[0].pageY
                },
                    t = (new Date).getTime(),
                    r = !0)
              }),
                  this.on("touchmove", function(t) {
                    if (t.touches.length > 1)
                      r = !1;
                    else if (e) {
                      var o = t.touches[0].pageX - e.pageX
                          , i = t.touches[0].pageY - e.pageY
                          , s = Math.sqrt(o * o + i * i);
                      s > n && (r = !1)
                    }
                  });
              var i = function() {
                r = !1
              };
              this.on("touchleave", i),
                  this.on("touchcancel", i),
                  this.on("touchend", function(n) {
                    if (e = null,
                    r === !0) {
                      var i = (new Date).getTime() - t;
                      o > i && (n.preventDefault(),
                          this.trigger("tap"))
                    }
                  })
            }
            ,
            t.prototype.enableTouchActivity = function() {
              if (this.player() && this.player().reportUserActivity) {
                var t = p.bind(this.player(), this.player().reportUserActivity)
                    , e = void 0;
                this.on("touchstart", function() {
                  t(),
                      this.clearInterval(e),
                      e = this.setInterval(t, 250)
                });
                var n = function() {
                  t(),
                      this.clearInterval(e)
                };
                this.on("touchmove", t),
                    this.on("touchend", n),
                    this.on("touchcancel", n)
              }
            }
            ,
            t.prototype.setTimeout = function(t, e) {
              t = p.bind(this, t);
              var n = a["default"].setTimeout(t, e)
                  , o = function() {
                this.clearTimeout(n)
              };
              return o.guid = "vjs-timeout-" + n,
                  this.on("dispose", o),
                  n
            }
            ,
            t.prototype.clearTimeout = function(t) {
              a["default"].clearTimeout(t);
              var e = function() {};
              return e.guid = "vjs-timeout-" + t,
                  this.off("dispose", e),
                  t
            }
            ,
            t.prototype.setInterval = function(t, e) {
              t = p.bind(this, t);
              var n = a["default"].setInterval(t, e)
                  , o = function() {
                this.clearInterval(n)
              };
              return o.guid = "vjs-interval-" + n,
                  this.on("dispose", o),
                  n
            }
            ,
            t.prototype.clearInterval = function(t) {
              a["default"].clearInterval(t);
              var e = function() {};
              return e.guid = "vjs-interval-" + t,
                  this.off("dispose", e),
                  t
            }
            ,
            t.registerComponent = function(e, n) {
              return t.components_ || (t.components_ = {}),
                  t.components_[e] = n,
                  n
            }
            ,
            t.getComponent = function(e) {
              return t.components_ && t.components_[e] ? t.components_[e] : a["default"] && a["default"].videoPlayer && a["default"].videoPlayer[e] ? (g["default"].warn("The " + e + " component was added to the videojs object when it should be registered using videojs.registerComponent(name, component)"),
                  a["default"].videoPlayer[e]) : void 0
            }
            ,
            t.extend = function(e) {
              e = e || {},
                  g["default"].warn("Component.extend({}) has been deprecated, use videojs.extend(Component, {}) instead");
              var n = e.init || e.init || this.prototype.init || this.prototype.init || function() {}
                  , o = function() {
                n.apply(this, arguments)
              };
              o.prototype = Object.create(this.prototype),
                  o.prototype.constructor = o,
                  o.extend = t.extend;
              for (var r in e)
                e.hasOwnProperty(r) && (o.prototype[r] = e[r]);
              return o
            }
            ,
            t
      }();
      w.registerComponent("Component", w),
          n["default"] = w
    }
      , {
        "./utils/dom.js": 84,
        "./utils/events.js": 85,
        "./utils/fn.js": 86,
        "./utils/guid.js": 88,
        "./utils/log.js": 89,
        "./utils/merge-options.js": 90,
        "./utils/to-title-case.js": 93,
        "global/window": 97
      }],
    6: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../track-button.js")
          , l = o(a)
          , u = t("../../component.js")
          , c = o(u)
          , p = t("./audio-track-menu-item.js")
          , f = o(p)
          , h = function(t) {
        function e(n) {
          var o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          r(this, e),
              o.tracks = n.audioTracks && n.audioTracks();
          var s = i(this, t.call(this, n, o));
          return s.el_.setAttribute("aria-label", "Audio Menu"),
              s
        }
        return s(e, t),
            e.prototype.buildCSSClass = function() {
              return "vjs-audio-button " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.createItems = function() {
              var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : []
                  , e = this.player_.audioTracks && this.player_.audioTracks();
              if (!e)
                return t;
              for (var n = 0; n < e.length; n++) {
                var o = e[n];
                t.push(new f["default"](this.player_,{
                  track: o,
                  selectable: !0
                }))
              }
              return t
            }
            ,
            e
      }(l["default"]);
      h.prototype.controlText_ = "Audio Track",
          c["default"].registerComponent("AudioTrackButton", h),
          n["default"] = h
    }
      , {
        "../../component.js": 5,
        "../track-button.js": 39,
        "./audio-track-menu-item.js": 7
      }],
    7: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../../menu/menu-item.js")
          , u = r(l)
          , c = t("../../component.js")
          , p = r(c)
          , f = t("../../utils/fn.js")
          , h = o(f)
          , d = function(t) {
        function e(n, o) {
          i(this, e);
          var r = o.track
              , a = n.audioTracks();
          o.label = r.label || r.language || "Unknown",
              o.selected = r.enabled;
          var l = s(this, t.call(this, n, o));
          return l.track = r,
          a && !function() {
            var t = h.bind(l, l.handleTracksChange);
            a.addEventListener("change", t),
                l.on("dispose", function() {
                  a.removeEventListener("change", t)
                })
          }(),
              l
        }
        return a(e, t),
            e.prototype.handleClick = function(e) {
              var n = this.player_.audioTracks();
              if (t.prototype.handleClick.call(this, e),
                  n)
                for (var o = 0; o < n.length; o++) {
                  var r = n[o];
                  r.enabled = r === this.track
                }
            }
            ,
            e.prototype.handleTracksChange = function() {
              this.selected(this.track.enabled)
            }
            ,
            e
      }(u["default"]);
      p["default"].registerComponent("AudioTrackMenuItem", d),
          n["default"] = d
    }
      , {
        "../../component.js": 5,
        "../../menu/menu-item.js": 51,
        "../../utils/fn.js": 86
      }],
    8: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../component.js")
          , l = o(a);
      t("./play-toggle.js"),
          t("./time-controls/current-time-display.js"),
          t("./time-controls/duration-display.js"),
          t("./time-controls/time-divider.js"),
          t("./time-controls/remaining-time-display.js"),
          t("./live-display.js"),
          t("./progress-control/progress-control.js"),
          t("./fullscreen-toggle.js"),
          t("./volume-control/volume-control.js"),
          t("./volume-menu-button.js"),
          t("./mute-toggle.js"),
          t("./text-track-controls/chapters-button.js"),
          t("./text-track-controls/descriptions-button.js"),
          t("./text-track-controls/subtitles-button.js"),
          t("./text-track-controls/captions-button.js"),
          t("./simple-text-track-controls/simple-captions-button.js"),
          t("./audio-track-controls/audio-track-button.js"),
          t("./playback-rate-menu/playback-rate-menu-button.js"),
          t("./spacer-controls/custom-control-spacer.js");
      var u = function(t) {
        function e() {
          return r(this, e),
              i(this, t.apply(this, arguments))
        }
        return s(e, t),
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: "vjs-control-bar",
                dir: "ltr"
              }, {
                role: "group"
              })
            }
            ,
            e
      }(l["default"]);
      u.prototype.options_ = {
        children: ["playToggle", "volumeMenuButton", "currentTimeDisplay", "timeDivider", "durationDisplay", "progressControl", "simpleCaptionsButton", "fullscreenToggle"]
      },
          l["default"].registerComponent("ControlBar", u),
          n["default"] = u
    }
      , {
        "../component.js": 5,
        "./audio-track-controls/audio-track-button.js": 6,
        "./fullscreen-toggle.js": 9,
        "./live-display.js": 10,
        "./mute-toggle.js": 11,
        "./play-toggle.js": 12,
        "./playback-rate-menu/playback-rate-menu-button.js": 13,
        "./progress-control/progress-control.js": 18,
        "./simple-text-track-controls/simple-captions-button.js": 22,
        "./spacer-controls/custom-control-spacer.js": 24,
        "./text-track-controls/captions-button.js": 27,
        "./text-track-controls/chapters-button.js": 28,
        "./text-track-controls/descriptions-button.js": 30,
        "./text-track-controls/subtitles-button.js": 32,
        "./time-controls/current-time-display.js": 35,
        "./time-controls/duration-display.js": 36,
        "./time-controls/remaining-time-display.js": 37,
        "./time-controls/time-divider.js": 38,
        "./volume-control/volume-control.js": 41,
        "./volume-menu-button.js": 43
      }],
    9: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../button.js")
          , l = o(a)
          , u = t("../component.js")
          , c = o(u)
          , p = function(t) {
        function e(n, o) {
          r(this, e);
          var s = i(this, t.call(this, n, o));
          return s.on(n, "fullscreenchange", s.handleFullscreenChange),
              s
        }
        return s(e, t),
            e.prototype.buildCSSClass = function() {
              return "vjs-fullscreen-control " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.handleFullscreenChange = function() {
              this.controlText(this.player_.isFullscreen() ? "Non-Fullscreen" : "Fullscreen")
            }
            ,
            e.prototype.handleClick = function() {
              this.player_.isFullscreen() ? this.player_.exitFullscreen() : this.player_.requestFullscreen()
            }
            ,
            e
      }(l["default"]);
      p.prototype.controlText_ = "Fullscreen",
          c["default"].registerComponent("FullscreenToggle", p),
          n["default"] = p
    }
      , {
        "../button.js": 2,
        "../component.js": 5
      }],
    10: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../component")
          , u = r(l)
          , c = t("../utils/dom.js")
          , p = o(c)
          , f = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.updateShowing(),
              r.on(r.player(), "durationchange", r.updateShowing),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              var e = t.prototype.createEl.call(this, "div", {
                className: "vjs-live-control vjs-control"
              });
              return this.contentEl_ = p.createEl("div", {
                className: "vjs-live-display",
                innerHTML: '<span class="vjs-control-text">' + this.localize("Stream Type") + "</span>" + this.localize("LIVE")
              }, {
                "aria-live": "off"
              }),
                  e.appendChild(this.contentEl_),
                  e
            }
            ,
            e.prototype.updateShowing = function() {
              1 / 0 === this.player().duration() ? this.show() : this.hide()
            }
            ,
            e
      }(u["default"]);
      u["default"].registerComponent("LiveDisplay", f),
          n["default"] = f
    }
      , {
        "../component": 5,
        "../utils/dom.js": 84
      }],
    11: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../button")
          , u = r(l)
          , c = t("../component")
          , p = r(c)
          , f = t("../utils/dom.js")
          , h = o(f)
          , d = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.on(n, "volumechange", r.update),
          n.tech_ && n.tech_.featuresVolumeControl === !1 && r.addClass("vjs-hidden"),
              r.on(n, "loadstart", function() {
                this.update(),
                    n.tech_.featuresVolumeControl === !1 ? this.addClass("vjs-hidden") : this.removeClass("vjs-hidden")
              }),
              r
        }
        return a(e, t),
            e.prototype.buildCSSClass = function() {
              return "vjs-mute-control " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.handleClick = function() {
              this.player_.muted(this.player_.muted() ? !1 : !0)
            }
            ,
            e.prototype.update = function() {
              var t = this.player_.volume()
                  , e = 3;
              0 === t || this.player_.muted() ? e = 0 : .33 > t ? e = 1 : .67 > t && (e = 2);
              var n = this.player_.muted() ? "Unmute" : "Mute";
              this.controlText() !== n && this.controlText(n);
              for (var o = 0; 4 > o; o++)
                h.removeElClass(this.el_, "vjs-vol-" + o);
              h.addElClass(this.el_, "vjs-vol-" + e)
            }
            ,
            e
      }(u["default"]);
      d.prototype.controlText_ = "Mute",
          p["default"].registerComponent("MuteToggle", d),
          n["default"] = d
    }
      , {
        "../button": 2,
        "../component": 5,
        "../utils/dom.js": 84
      }],
    12: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../button.js")
          , l = o(a)
          , u = t("../component.js")
          , c = o(u)
          , p = function(t) {
        function e(n, o) {
          r(this, e);
          var s = i(this, t.call(this, n, o));
          return s.on(n, "play", s.handlePlay),
              s.on(n, "pause", s.handlePause),
              s
        }
        return s(e, t),
            e.prototype.buildCSSClass = function() {
              return "vjs-play-control " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.handleClick = function() {
              this.player_.paused() ? this.player_.play() : this.player_.pause()
            }
            ,
            e.prototype.handlePlay = function() {
              this.removeClass("vjs-paused"),
                  this.addClass("vjs-playing"),
                  this.controlText("Pause")
            }
            ,
            e.prototype.handlePause = function() {
              this.removeClass("vjs-playing"),
                  this.addClass("vjs-paused"),
                  this.controlText("Play")
            }
            ,
            e
      }(l["default"]);
      p.prototype.controlText_ = "Play",
          c["default"].registerComponent("PlayToggle", p),
          n["default"] = p
    }
      , {
        "../button.js": 2,
        "../component.js": 5
      }],
    13: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../../menu/menu-button.js")
          , u = r(l)
          , c = t("../../menu/menu.js")
          , p = r(c)
          , f = t("./playback-rate-menu-item.js")
          , h = r(f)
          , d = t("../../component.js")
          , y = (r(d),
          t("../../utils/dom.js"))
          , v = o(y)
          , g = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.updateVisibility(),
              r.updateLabel(),
              r.on(n, "loadstart", r.updateVisibility),
              r.on(n, "ratechange", r.updateLabel),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              var e = t.prototype.createEl.call(this);
              return this.labelEl_ = v.createEl("div", {
                className: "vjs-playback-rate-value",
                innerHTML: 1
              }),
                  e.appendChild(this.labelEl_),
                  e
            }
            ,
            e.prototype.buildCSSClass = function() {
              return "vjs-playback-rate " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.createMenu = function() {
              var t = new p["default"](this.player())
                  , e = this.playbackRates();
              if (e)
                for (var n = e.length - 1; n >= 0; n--)
                  t.addChild(new h["default"](this.player(),{
                    rate: e[n] + "x"
                  }));
              return t
            }
            ,
            e.prototype.updateARIAAttributes = function() {
              this.el().setAttribute("aria-valuenow", this.player().playbackRate())
            }
            ,
            e.prototype.handleClick = function() {
              for (var t = this.player().playbackRate(), e = this.playbackRates(), n = e[0], o = 0; o < e.length; o++)
                if (e[o] > t) {
                  n = e[o];
                  break
                }
              this.player().playbackRate(n)
            }
            ,
            e.prototype.playbackRates = function() {
              return this.options_.playbackRates || this.options_.playerOptions && this.options_.playerOptions.playbackRates
            }
            ,
            e.prototype.playbackRateSupported = function() {
              return this.player().tech_ && this.player().tech_.featuresPlaybackRate && this.playbackRates() && this.playbackRates().length > 0
            }
            ,
            e.prototype.updateVisibility = function() {
              this.playbackRateSupported() ? this.removeClass("vjs-hidden") : this.addClass("vjs-hidden")
            }
            ,
            e.prototype.updateLabel = function() {
              this.playbackRateSupported() && (this.labelEl_.innerHTML = this.player().playbackRate() + "x")
            }
            ,
            e
      }(u["default"]);
      g.prototype.controlText_ = "Playback Rate",
          n["default"] = g
    }
      , {
        "../../component.js": 5,
        "../../menu/menu-button.js": 50,
        "../../menu/menu.js": 52,
        "../../utils/dom.js": 84,
        "./playback-rate-menu-item.js": 14
      }],
    14: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../../menu/menu-item.js")
          , l = o(a)
          , u = t("../../component.js")
          , c = o(u)
          , p = function(t) {
        function e(n, o) {
          r(this, e);
          var s = o.rate
              , a = parseFloat(s, 10);
          o.label = s,
              o.selected = 1 === a;
          var l = i(this, t.call(this, n, o));
          return l.label = s,
              l.rate = a,
              l.on(n, "ratechange", l.update),
              l
        }
        return s(e, t),
            e.prototype.handleClick = function() {
              t.prototype.handleClick.call(this),
                  this.player().playbackRate(this.rate)
            }
            ,
            e.prototype.update = function() {
              this.selected(this.player().playbackRate() === this.rate)
            }
            ,
            e
      }(l["default"]);
      p.prototype.contentElType = "button",
          c["default"].registerComponent("PlaybackRateMenuItem", p),
          n["default"] = p
    }
      , {
        "../../component.js": 5,
        "../../menu/menu-item.js": 51
      }],
    15: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../../component.js")
          , u = r(l)
          , c = t("../../utils/dom.js")
          , p = o(c)
          , f = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.on(n, "progress", r.update),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: "vjs-load-progress",
                innerHTML: '<span class="vjs-control-text"><span>' + this.localize("Loaded") + "</span>: 0%</span>"
              })
            }
            ,
            e.prototype.update = function() {
              var t = this.player_.buffered()
                  , e = this.player_.duration()
                  , n = this.player_.bufferedEnd()
                  , o = this.el_.children
                  , r = function(t, e) {
                var n = t / e || 0;
                return 100 * (n >= 1 ? 1 : n) + "%"
              };
              this.el_.style.width = r(n, e);
              for (var i = 0; i < t.length; i++) {
                var s = t.start(i)
                    , a = t.end(i)
                    , l = o[i];
                l || (l = this.el_.appendChild(p.createEl())),
                    l.style.left = r(s, n),
                    l.style.width = r(a - s, n)
              }
              for (var u = o.length; u > t.length; u--)
                this.el_.removeChild(o[u - 1])
            }
            ,
            e
      }(u["default"]);
      u["default"].registerComponent("LoadProgressBar", f),
          n["default"] = f
    }
      , {
        "../../component.js": 5,
        "../../utils/dom.js": 84
      }],
    16: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("global/window")
          , u = r(l)
          , c = t("../../component.js")
          , p = r(c)
          , f = t("../../utils/dom.js")
          , h = o(f)
          , d = t("../../utils/fn.js")
          , y = o(d)
          , v = t("../../utils/format-time.js")
          , g = r(v)
          , m = t("lodash-compat/function/throttle")
          , b = r(m)
          , _ = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return o.playerOptions && o.playerOptions.controlBar && o.playerOptions.controlBar.progressControl && o.playerOptions.controlBar.progressControl.keepTooltipsInside && (r.keepTooltipsInside = o.playerOptions.controlBar.progressControl.keepTooltipsInside),
          r.keepTooltipsInside && (r.tooltip = h.createEl("div", {
            className: "vjs-time-tooltip"
          }),
              r.el().appendChild(r.tooltip),
              r.addClass("vjs-keep-tooltips-inside")),
              r.update(0, 0),
              n.on("ready", function() {
                r.on(n.controlBar.progressControl.el(), "mousemove", b["default"](y.bind(r, r.handleMouseMove), 25))
              }),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: "vjs-mouse-display"
              })
            }
            ,
            e.prototype.handleMouseMove = function(t) {
              var e = this.player_.duration()
                  , n = this.calculateDistance(t) * e
                  , o = t.pageX - h.findElPosition(this.el().parentNode).left;
              this.update(n, o)
            }
            ,
            e.prototype.update = function(t, e) {
              var n = this.player_.duration()
                  , o = "";
              if (1 / 0 === t || 1 / 0 === n ? (o = "视频转码中，请稍后...",
                  h.addElClass(this.el(), "vjs-progress-transcoding")) : (o = g["default"](t, this.player_.duration()),
                  h.removeElClass(this.el(), "vjs-progress-transcoding")),
                  this.el().style.left = e + "px",
                  this.el().setAttribute("data-current-time", o),
                  this.keepTooltipsInside) {
                var r = this.clampPosition_(e)
                    , i = e - r + 1
                    , s = parseFloat(u["default"].getComputedStyle(this.tooltip).width)
                    , a = s / 2;
                this.tooltip.innerHTML = o,
                    this.tooltip.style.right = "-" + (a - i) + "px"
              }
            }
            ,
            e.prototype.calculateDistance = function(t) {
              return h.getPointerPosition(this.el().parentNode, t).x
            }
            ,
            e.prototype.clampPosition_ = function(t) {
              if (!this.keepTooltipsInside)
                return t;
              var e = parseFloat(u["default"].getComputedStyle(this.player().el()).width)
                  , n = parseFloat(u["default"].getComputedStyle(this.tooltip).width)
                  , o = n / 2
                  , r = t;
              return o > t ? r = Math.ceil(o) : t > e - o && (r = Math.floor(e - o)),
                  r
            }
            ,
            e
      }(p["default"]);
      p["default"].registerComponent("MouseTimeDisplay", _),
          n["default"] = _
    }
      , {
        "../../component.js": 5,
        "../../utils/dom.js": 84,
        "../../utils/fn.js": 86,
        "../../utils/format-time.js": 87,
        "global/window": 97,
        "lodash-compat/function/throttle": 102
      }],
    17: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../../component.js")
          , u = r(l)
          , c = t("../../utils/fn.js")
          , p = o(c)
          , f = t("../../utils/format-time.js")
          , h = r(f)
          , d = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.updateDataAttr(),
              r.on(n, "timeupdate", r.updateDataAttr),
              n.ready(p.bind(r, r.updateDataAttr)),
          o.playerOptions && o.playerOptions.controlBar && o.playerOptions.controlBar.progressControl && o.playerOptions.controlBar.progressControl.keepTooltipsInside && (r.keepTooltipsInside = o.playerOptions.controlBar.progressControl.keepTooltipsInside),
          r.keepTooltipsInside && r.addClass("vjs-keep-tooltips-inside"),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: "vjs-play-progress vjs-slider-bar",
                innerHTML: '<span class="vjs-control-text"><span>' + this.localize("Progress") + "</span>: 0%</span>"
              })
            }
            ,
            e.prototype.updateDataAttr = function() {
              var t = this.player_.scrubbing() ? this.player_.getCache().currentTime : this.player_.currentTime();
              this.el_.setAttribute("data-current-time", h["default"](t, this.player_.duration()))
            }
            ,
            e
      }(u["default"]);
      u["default"].registerComponent("PlayProgressBar", d),
          n["default"] = d
    }
      , {
        "../../component.js": 5,
        "../../utils/fn.js": 86,
        "../../utils/format-time.js": 87
      }],
    18: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../../component.js")
          , l = o(a);
      t("./seek-bar.js"),
          t("./mouse-time-display.js");
      var u = function(t) {
        function e() {
          return r(this, e),
              i(this, t.apply(this, arguments))
        }
        return s(e, t),
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: "vjs-progress-control vjs-control"
              })
            }
            ,
            e
      }(l["default"]);
      u.prototype.options_ = {
        children: ["seekBar"]
      },
          l["default"].registerComponent("ProgressControl", u),
          n["default"] = u
    }
      , {
        "../../component.js": 5,
        "./mouse-time-display.js": 16,
        "./seek-bar.js": 19
      }],
    19: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("global/window")
          , u = r(l)
          , c = t("../../slider/slider.js")
          , p = r(c)
          , f = t("../../component.js")
          , h = r(f)
          , d = t("../../utils/fn.js")
          , y = o(d)
          , v = t("../../utils/format-time.js")
          , g = r(v);
      t("./load-progress-bar.js"),
          t("./play-progress-bar.js"),
          t("./tooltip-progress-bar.js");
      var m = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.playerOptions = n.options_.playerOptions,
              r.on(n, "timeupdate", r.updateProgress),
              r.on(n, "ended", r.updateProgress),
              n.ready(y.bind(r, r.updateProgress)),
          o.playerOptions && o.playerOptions.controlBar && o.playerOptions.controlBar.progressControl && o.playerOptions.controlBar.progressControl.keepTooltipsInside && (r.keepTooltipsInside = o.playerOptions.controlBar.progressControl.keepTooltipsInside),
          r.keepTooltipsInside && (r.tooltipProgressBar = r.addChild("TooltipProgressBar")),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: "vjs-progress-holder"
              }, {
                "aria-label": "progress bar"
              })
            }
            ,
            e.prototype.updateProgress = function() {
              if (this.updateAriaAttributes(this.el_),
                  this.keepTooltipsInside) {
                this.updateAriaAttributes(this.tooltipProgressBar.el_),
                    this.tooltipProgressBar.el_.style.width = this.bar.el_.style.width;
                var t = parseFloat(u["default"].getComputedStyle(this.player().el()).width)
                    , e = parseFloat(u["default"].getComputedStyle(this.tooltipProgressBar.tooltip).width)
                    , n = this.tooltipProgressBar.el().style;
                n.maxWidth = Math.floor(t - e / 2) + "px",
                    n.minWidth = Math.ceil(e / 2) + "px",
                    n.right = "-" + e / 2 + "px"
              }
            }
            ,
            e.prototype.updateAriaAttributes = function(t) {
              var e = this.player_.scrubbing() ? this.player_.getCache().currentTime : this.player_.currentTime();
              t.setAttribute("aria-valuenow", (100 * this.getPercent()).toFixed(2)),
                  t.setAttribute("aria-valuetext", g["default"](e, this.player_.duration()))
            }
            ,
            e.prototype.getPercent = function() {
              var t = this.player_.currentTime() / this.player_.duration();
              return t >= 1 ? 1 : t
            }
            ,
            e.prototype.handleMouseDown = function(e) {
              this.playerOptions.canSeek_ && (t.prototype.handleMouseDown.call(this, e),
                  this.player_.scrubbing(!0),
                  this.videoWasPlaying = !this.player_.paused(),
                  this.player_.pause())
            }
            ,
            e.prototype.handleMouseMove = function(t) {
              if (this.playerOptions.canSeek_) {
                var e = this.calculateDistance(t) * this.player_.duration();
                e === this.player_.duration() && (e -= .1),
                    this.player_.currentTime(e)
              }
            }
            ,
            e.prototype.handleMouseUp = function(e) {
              t.prototype.handleMouseUp.call(this, e),
                  this.player_.scrubbing(!1),
              this.videoWasPlaying && this.player_.play()
            }
            ,
            e.prototype.stepForward = function() {
              this.playerOptions.canSeek_ && this.player_.currentTime(this.player_.currentTime() + 5)
            }
            ,
            e.prototype.stepBack = function() {
              this.playerOptions.canSeek_ && this.player_.currentTime(this.player_.currentTime() - 5)
            }
            ,
            e
      }(p["default"]);
      m.prototype.options_ = {
        children: ["loadProgressBar", "mouseTimeDisplay", "playProgressBar"],
        barName: "playProgressBar"
      },
          m.prototype.playerEvent = "timeupdate",
          h["default"].registerComponent("SeekBar", m),
          n["default"] = m
    }
      , {
        "../../component.js": 5,
        "../../slider/slider.js": 60,
        "../../utils/fn.js": 86,
        "../../utils/format-time.js": 87,
        "./load-progress-bar.js": 15,
        "./play-progress-bar.js": 17,
        "./tooltip-progress-bar.js": 20,
        "global/window": 97
      }],
    20: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../../component.js")
          , u = r(l)
          , c = t("../../utils/fn.js")
          , p = o(c)
          , f = t("../../utils/format-time.js")
          , h = r(f)
          , d = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.updateDataAttr(),
              r.on(n, "timeupdate", r.updateDataAttr),
              n.ready(p.bind(r, r.updateDataAttr)),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              var e = t.prototype.createEl.call(this, "div", {
                className: "vjs-tooltip-progress-bar vjs-slider-bar",
                innerHTML: '<div class="vjs-time-tooltip"></div>\n        <span class="vjs-control-text"><span>' + this.localize("Progress") + "</span>: 0%</span>"
              });
              return this.tooltip = e.querySelector(".vjs-time-tooltip"),
                  e
            }
            ,
            e.prototype.updateDataAttr = function() {
              var t = this.player_.scrubbing() ? this.player_.getCache().currentTime : this.player_.currentTime()
                  , e = h["default"](t, this.player_.duration());
              this.el_.setAttribute("data-current-time", e),
                  this.tooltip.innerHTML = e
            }
            ,
            e
      }(u["default"]);
      u["default"].registerComponent("TooltipProgressBar", d),
          n["default"] = d
    }
      , {
        "../../component.js": 5,
        "../../utils/fn.js": 86,
        "../../utils/format-time.js": 87
      }],
    21: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("./text-track-menu-item.js")
          , l = o(a)
          , u = t("../../component.js")
          , c = o(u)
          , p = function(t) {
        function e(n, o) {
          r(this, e),
              o.track = {
                player: n,
                kind: o.kind,
                label: o.label ? o.label : o.kind + " off",
                "default": !1,
                mode: "disabled"
              },
              o.selectable = !0;
          var s = i(this, t.call(this, n, o));
          return s.selected(!0),
              s
        }
        return s(e, t),
            e.prototype.handleTracksChange = function() {
              for (var t = this.player().textTracks(), e = !0, n = 0, o = t.length; o > n; n++) {
                var r = t[n];
                if (r.kind === this.track.kind && "showing" === r.mode) {
                  e = !1;
                  break
                }
              }
              this.selected(e)
            }
            ,
            e
      }(l["default"]);
      c["default"].registerComponent("OffTextTrackMenuItem", p),
          n["default"] = p
    }
      , {
        "../../component.js": 5,
        "./text-track-menu-item.js": 23
      }],
    22: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../track-button.js")
          , l = o(a)
          , u = t("./text-track-menu-item.js")
          , c = o(u)
          , p = t("./off-text-track-menu-item.js")
          , f = o(p)
          , h = t("../../component.js")
          , d = o(h)
          , y = function(t) {
        function e(n, o, s) {
          r(this, e),
              o.tracks = n.textTracks();
          var a = i(this, t.call(this, n, o, s));
          return a.el_.setAttribute("aria-label", "Simple Captions Menu"),
              a.show(),
              a
        }
        return s(e, t),
            e.prototype.buildCSSClass = function() {
              return "vjs-simple-captions-button " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: this.buildCSSClass(),
                innerHTML: this.localize("Captions")
              })
            }
            ,
            e.prototype.update = function() {
              t.prototype.update.call(this),
                  this.player().getChild("simpleTextTrackSettings").updateTracks(this.menu, this.items)
            }
            ,
            e.prototype.createItems = function() {
              var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
              t.push(new f["default"](this.player_,{
                kind: this.kind_,
                label: "No Track",
                attrs: {
                  name: "No Track"
                }
              }));
              var e = this.player_.textTracks();
              if (!e)
                return t;
              for (var n = 0; n < e.length; n++) {
                var o = e[n]
                    , r = o.label;
                o.kind === this.kind_ && t.push(new c["default"](this.player_,{
                  track: o,
                  selectable: !0,
                  attrs: {
                    title: r
                  }
                }))
              }
              return t
            }
            ,
            e.prototype.handleClick = function() {
              var t = this.player().getChild("simpleTextTrackSettings");
              t.isHide() ? t.show() : t.hide()
            }
            ,
            e
      }(l["default"]);
      y.prototype.kind_ = "captions",
          y.prototype.controlText_ = "字幕",
          d["default"].registerComponent("SimpleCaptionsButton", y),
          n["default"] = y
    }
      , {
        "../../component.js": 5,
        "../track-button.js": 39,
        "./off-text-track-menu-item.js": 21,
        "./text-track-menu-item.js": 23
      }],
    23: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
          }
          : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
          }
          , u = t("../../menu/menu-item.js")
          , c = r(u)
          , p = t("../../component.js")
          , f = r(p)
          , h = t("../../utils/fn.js")
          , d = o(h)
          , y = t("global/window")
          , v = r(y)
          , g = t("global/document")
          , m = r(g)
          , b = t("object.assign")
          , _ = r(b)
          , j = function(t) {
        function e(n, o) {
          i(this, e);
          var r = o.track
              , a = n.textTracks();
          o.label = r.label || r.language || "Unknown",
              o.selected = r["default"] || "showing" === r.mode;
          var u = s(this, t.call(this, n, o));
          return u.track = r,
          a && !function() {
            var t = d.bind(u, u.handleTracksChange);
            a.addEventListener("change", t),
                u.on("dispose", function() {
                  a.removeEventListener("change", t)
                })
          }(),
          a && void 0 === a.onchange && !function() {
            var t = void 0;
            u.on(["tap", "click"], function() {
              if ("object" !== l(v["default"].Event))
                try {
                  t = new v["default"].Event("change")
                } catch (e) {}
              t || (t = m["default"].createEvent("Event"),
                  t.initEvent("change", !0, !0)),
                  a.dispatchEvent(t)
            })
          }(),
              u
        }
        return a(e, t),
            e.prototype.handleClick = function(e) {
              var n = this.track.kind
                  , o = this.player_.textTracks();
              if (t.prototype.handleClick.call(this, e),
              "No Track" === e.currentTarget.getAttribute("name") && this.player_.trigger("trackclose"),
                  o)
                for (var r = 0; r < o.length; r++) {
                  var i = o[r];
                  i.kind === n && (i.mode = i === this.track ? "showing" : "disabled")
                }
            }
            ,
            e.prototype.handleTracksChange = function() {
              this.selected("showing" === this.track.mode)
            }
            ,
            e.prototype.createEl = function(e, n, o) {
              for (var r = this.localize(this.options_.label), i = 0, s = 0; s < r.length; s++)
                if (r.charCodeAt(s) < 128 ? i++ : i += 2,
                i > 18) {
                  r = r.substring(0, s) + "...srt";
                  break
                }
              return t.prototype.createEl.call(this, "li", _["default"]({
                className: "vjs-menu-item",
                innerHTML: r,
                tabIndex: -1
              }, n), o)
            }
            ,
            e
      }(c["default"]);
      f["default"].registerComponent("TextTrackMenuItem", j),
          n["default"] = j
    }
      , {
        "../../component.js": 5,
        "../../menu/menu-item.js": 51,
        "../../utils/fn.js": 86,
        "global/document": 96,
        "global/window": 97,
        "object.assign": 140
      }],
    24: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("./spacer.js")
          , l = o(a)
          , u = t("../../component.js")
          , c = o(u)
          , p = function(t) {
        function e() {
          return r(this, e),
              i(this, t.apply(this, arguments))
        }
        return s(e, t),
            e.prototype.buildCSSClass = function() {
              return "vjs-custom-control-spacer " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.createEl = function() {
              var e = t.prototype.createEl.call(this, {
                className: this.buildCSSClass()
              });
              return e.innerHTML = "&nbsp;",
                  e
            }
            ,
            e
      }(l["default"]);
      c["default"].registerComponent("CustomControlSpacer", p),
          n["default"] = p
    }
      , {
        "../../component.js": 5,
        "./spacer.js": 25
      }],
    25: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../../component.js")
          , l = o(a)
          , u = function(t) {
        function e() {
          return r(this, e),
              i(this, t.apply(this, arguments))
        }
        return s(e, t),
            e.prototype.buildCSSClass = function() {
              return "vjs-spacer " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: this.buildCSSClass()
              })
            }
            ,
            e
      }(l["default"]);
      l["default"].registerComponent("Spacer", u),
          n["default"] = u
    }
      , {
        "../../component.js": 5
      }],
    26: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("./text-track-menu-item.js")
          , l = o(a)
          , u = t("../../component.js")
          , c = o(u)
          , p = function(t) {
        function e(n, o) {
          r(this, e),
              o.track = {
                player: n,
                kind: o.kind,
                label: o.kind + " settings",
                selectable: !1,
                "default": !1,
                mode: "disabled"
              },
              o.selectable = !1;
          var s = i(this, t.call(this, n, o));
          return s.addClass("vjs-texttrack-settings"),
              s.controlText("opens " + o.kind + " settings dialog"),
              s
        }
        return s(e, t),
            e.prototype.handleClick = function() {
              this.player().getChild("textTrackSettings").show(),
                  this.player().getChild("textTrackSettings").el_.focus()
            }
            ,
            e
      }(l["default"]);
      c["default"].registerComponent("CaptionSettingsMenuItem", p),
          n["default"] = p
    }
      , {
        "../../component.js": 5,
        "./text-track-menu-item.js": 34
      }],
    27: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("./text-track-button.js")
          , l = o(a)
          , u = t("../../component.js")
          , c = o(u)
          , p = t("./caption-settings-menu-item.js")
          , f = o(p)
          , h = function(t) {
        function e(n, o, s) {
          r(this, e);
          var a = i(this, t.call(this, n, o, s));
          return a.el_.setAttribute("aria-label", "Captions Menu"),
              a
        }
        return s(e, t),
            e.prototype.buildCSSClass = function() {
              return "vjs-captions-button " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.update = function() {
              var e = 2;
              t.prototype.update.call(this),
              this.player().tech_ && this.player().tech_.featuresNativeTextTracks && (e = 1),
                  this.items && this.items.length > e ? this.show() : this.hide()
            }
            ,
            e.prototype.createItems = function() {
              var e = [];
              return this.player().tech_ && this.player().tech_.featuresNativeTextTracks || e.push(new f["default"](this.player_,{
                kind: this.kind_
              })),
                  t.prototype.createItems.call(this, e)
            }
            ,
            e
      }(l["default"]);
      h.prototype.kind_ = "captions",
          h.prototype.controlText_ = "Captions",
          c["default"].registerComponent("CaptionsButton", h),
          n["default"] = h
    }
      , {
        "../../component.js": 5,
        "./caption-settings-menu-item.js": 26,
        "./text-track-button.js": 33
      }],
    28: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("./text-track-button.js")
          , u = r(l)
          , c = t("../../component.js")
          , p = r(c)
          , f = t("./text-track-menu-item.js")
          , h = r(f)
          , d = t("./chapters-track-menu-item.js")
          , y = r(d)
          , v = t("../../menu/menu.js")
          , g = r(v)
          , m = t("../../utils/dom.js")
          , b = o(m)
          , _ = t("../../utils/to-title-case.js")
          , j = r(_)
          , w = function(t) {
        function e(n, o, r) {
          i(this, e);
          var a = s(this, t.call(this, n, o, r));
          return a.el_.setAttribute("aria-label", "Chapters Menu"),
              a
        }
        return a(e, t),
            e.prototype.buildCSSClass = function() {
              return "vjs-chapters-button " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.createItems = function() {
              var t = []
                  , e = this.player_.textTracks();
              if (!e)
                return t;
              for (var n = 0; n < e.length; n++) {
                var o = e[n];
                o.kind === this.kind_ && t.push(new h["default"](this.player_,{
                  track: o
                }))
              }
              return t
            }
            ,
            e.prototype.createMenu = function() {
              for (var t = this, e = this.player_.textTracks() || [], n = void 0, o = this.items || [], r = e.length - 1; r >= 0; r--) {
                var i = e[r];
                if (i.kind === this.kind_) {
                  n = i;
                  break
                }
              }
              var s = this.menu;
              if (void 0 === s) {
                s = new g["default"](this.player_);
                var a = b.createEl("li", {
                  className: "vjs-menu-title",
                  innerHTML: j["default"](this.kind_),
                  tabIndex: -1
                });
                s.children_.unshift(a),
                    b.insertElFirst(a, s.contentEl())
              } else
                o.forEach(function(t) {
                  return s.removeChild(t)
                }),
                    o = [];
              if (n && (null === n.cues || void 0 === n.cues)) {
                n.mode = "hidden";
                var l = this.player_.remoteTextTrackEls().getTrackElementByTrack_(n);
                l && l.addEventListener("load", function() {
                  return t.update()
                })
              }
              if (n && n.cues && n.cues.length > 0)
                for (var u = n.cues, c = 0, p = u.length; p > c; c++) {
                  var f = u[c]
                      , h = new y["default"](this.player_,{
                    cue: f,
                    track: n
                  });
                  o.push(h),
                      s.addChild(h)
                }
              return o.length > 0 && this.show(),
                  this.items = o,
                  s
            }
            ,
            e
      }(u["default"]);
      w.prototype.kind_ = "chapters",
          w.prototype.controlText_ = "Chapters",
          p["default"].registerComponent("ChaptersButton", w),
          n["default"] = w
    }
      , {
        "../../component.js": 5,
        "../../menu/menu.js": 52,
        "../../utils/dom.js": 84,
        "../../utils/to-title-case.js": 93,
        "./chapters-track-menu-item.js": 29,
        "./text-track-button.js": 33,
        "./text-track-menu-item.js": 34
      }],
    29: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../../menu/menu-item.js")
          , u = r(l)
          , c = t("../../component.js")
          , p = r(c)
          , f = t("../../utils/fn.js")
          , h = o(f)
          , d = function(t) {
        function e(n, o) {
          i(this, e);
          var r = o.track
              , a = o.cue
              , l = n.currentTime();
          o.label = a.text,
              o.selected = a.startTime <= l && l < a.endTime;
          var u = s(this, t.call(this, n, o));
          return u.track = r,
              u.cue = a,
              r.addEventListener("cuechange", h.bind(u, u.update)),
              u
        }
        return a(e, t),
            e.prototype.handleClick = function() {
              t.prototype.handleClick.call(this),
                  this.player_.currentTime(this.cue.startTime),
                  this.update(this.cue.startTime)
            }
            ,
            e.prototype.update = function() {
              var t = this.cue
                  , e = this.player_.currentTime();
              this.selected(t.startTime <= e && e < t.endTime)
            }
            ,
            e
      }(u["default"]);
      p["default"].registerComponent("ChaptersTrackMenuItem", d),
          n["default"] = d
    }
      , {
        "../../component.js": 5,
        "../../menu/menu-item.js": 51,
        "../../utils/fn.js": 86
      }],
    30: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("./text-track-button.js")
          , u = r(l)
          , c = t("../../component.js")
          , p = r(c)
          , f = t("../../utils/fn.js")
          , h = o(f)
          , d = function(t) {
        function e(n, o, r) {
          i(this, e);
          var a = s(this, t.call(this, n, o, r));
          a.el_.setAttribute("aria-label", "Descriptions Menu");
          var l = n.textTracks();
          return l && !function() {
            var t = h.bind(a, a.handleTracksChange);
            l.addEventListener("change", t),
                a.on("dispose", function() {
                  l.removeEventListener("change", t)
                })
          }(),
              a
        }
        return a(e, t),
            e.prototype.handleTracksChange = function() {
              for (var t = this.player().textTracks(), e = !1, n = 0, o = t.length; o > n; n++) {
                var r = t[n];
                if (r.kind !== this.kind_ && "showing" === r.mode) {
                  e = !0;
                  break
                }
              }
              e ? this.disable() : this.enable()
            }
            ,
            e.prototype.buildCSSClass = function() {
              return "vjs-descriptions-button " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e
      }(u["default"]);
      d.prototype.kind_ = "descriptions",
          d.prototype.controlText_ = "Descriptions",
          p["default"].registerComponent("DescriptionsButton", d),
          n["default"] = d
    }
      , {
        "../../component.js": 5,
        "../../utils/fn.js": 86,
        "./text-track-button.js": 33
      }],
    31: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("./text-track-menu-item.js")
          , l = o(a)
          , u = t("../../component.js")
          , c = o(u)
          , p = function(t) {
        function e(n, o) {
          r(this, e),
              o.track = {
                player: n,
                kind: o.kind,
                label: o.kind + " off",
                "default": !1,
                mode: "disabled"
              },
              o.selectable = !0;
          var s = i(this, t.call(this, n, o));
          return s.selected(!0),
              s
        }
        return s(e, t),
            e.prototype.handleTracksChange = function() {
              for (var t = this.player().textTracks(), e = !0, n = 0, o = t.length; o > n; n++) {
                var r = t[n];
                if (r.kind === this.track.kind && "showing" === r.mode) {
                  e = !1;
                  break
                }
              }
              this.selected(e)
            }
            ,
            e
      }(l["default"]);
      c["default"].registerComponent("OffTextTrackMenuItem", p),
          n["default"] = p
    }
      , {
        "../../component.js": 5,
        "./text-track-menu-item.js": 34
      }],
    32: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("./text-track-button.js")
          , l = o(a)
          , u = t("../../component.js")
          , c = o(u)
          , p = function(t) {
        function e(n, o, s) {
          r(this, e);
          var a = i(this, t.call(this, n, o, s));
          return a.el_.setAttribute("aria-label", "Subtitles Menu"),
              a
        }
        return s(e, t),
            e.prototype.buildCSSClass = function() {
              return "vjs-subtitles-button " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e
      }(l["default"]);
      p.prototype.kind_ = "subtitles",
          p.prototype.controlText_ = "Subtitles",
          c["default"].registerComponent("SubtitlesButton", p),
          n["default"] = p
    }
      , {
        "../../component.js": 5,
        "./text-track-button.js": 33
      }],
    33: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../track-button.js")
          , l = o(a)
          , u = t("../../component.js")
          , c = o(u)
          , p = t("./text-track-menu-item.js")
          , f = o(p)
          , h = t("./off-text-track-menu-item.js")
          , d = o(h)
          , y = function(t) {
        function e(n) {
          var o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          return r(this, e),
              o.tracks = n.textTracks(),
              i(this, t.call(this, n, o))
        }
        return s(e, t),
            e.prototype.createItems = function() {
              var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
              t.push(new d["default"](this.player_,{
                kind: this.kind_
              }));
              var e = this.player_.textTracks();
              if (!e)
                return t;
              for (var n = 0; n < e.length; n++) {
                var o = e[n];
                o.kind === this.kind_ && t.push(new f["default"](this.player_,{
                  track: o,
                  selectable: !0
                }))
              }
              return t
            }
            ,
            e
      }(l["default"]);
      c["default"].registerComponent("TextTrackButton", y),
          n["default"] = y
    }
      , {
        "../../component.js": 5,
        "../track-button.js": 39,
        "./off-text-track-menu-item.js": 31,
        "./text-track-menu-item.js": 34
      }],
    34: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
          }
          : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
          }
          , u = t("../../menu/menu-item.js")
          , c = r(u)
          , p = t("../../component.js")
          , f = r(p)
          , h = t("../../utils/fn.js")
          , d = o(h)
          , y = t("global/window")
          , v = r(y)
          , g = t("global/document")
          , m = r(g)
          , b = function(t) {
        function e(n, o) {
          i(this, e);
          var r = o.track
              , a = n.textTracks();
          o.label = r.label || r.language || "Unknown",
              o.selected = r["default"] || "showing" === r.mode;
          var u = s(this, t.call(this, n, o));
          return u.track = r,
          a && !function() {
            var t = d.bind(u, u.handleTracksChange);
            a.addEventListener("change", t),
                u.on("dispose", function() {
                  a.removeEventListener("change", t)
                })
          }(),
          a && void 0 === a.onchange && !function() {
            var t = void 0;
            u.on(["tap", "click"], function() {
              if ("object" !== l(v["default"].Event))
                try {
                  t = new v["default"].Event("change")
                } catch (e) {}
              t || (t = m["default"].createEvent("Event"),
                  t.initEvent("change", !0, !0)),
                  a.dispatchEvent(t)
            })
          }(),
              u
        }
        return a(e, t),
            e.prototype.handleClick = function(e) {
              var n = this.track.kind
                  , o = this.player_.textTracks();
              if (t.prototype.handleClick.call(this, e),
                  o)
                for (var r = 0; r < o.length; r++) {
                  var i = o[r];
                  i.kind === n && (i.mode = i === this.track ? "showing" : "disabled")
                }
            }
            ,
            e.prototype.handleTracksChange = function() {
              this.selected("showing" === this.track.mode)
            }
            ,
            e
      }(c["default"]);
      f["default"].registerComponent("TextTrackMenuItem", b),
          n["default"] = b
    }
      , {
        "../../component.js": 5,
        "../../menu/menu-item.js": 51,
        "../../utils/fn.js": 86,
        "global/document": 96,
        "global/window": 97
      }],
    35: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../../component.js")
          , u = r(l)
          , c = t("../../utils/dom.js")
          , p = o(c)
          , f = t("../../utils/format-time.js")
          , h = r(f)
          , d = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.on(n, "timeupdate", r.updateContent),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              var e = t.prototype.createEl.call(this, "div", {
                className: "vjs-current-time vjs-time-control vjs-control"
              });
              return this.contentEl_ = p.createEl("div", {
                className: "vjs-current-time-display",
                innerHTML: '<span class="vjs-control-text">Current Time </span>0:00'
              }, {
                "aria-live": "off"
              }),
                  e.appendChild(this.contentEl_),
                  e
            }
            ,
            e.prototype.updateContent = function() {
              var t = this.player_.scrubbing() ? this.player_.getCache().currentTime : this.player_.currentTime()
                  , e = this.localize("Current Time")
                  , n = h["default"](t, this.player_.duration());
              n !== this.formattedTime_ && (this.formattedTime_ = n,
                  this.contentEl_.innerHTML = '<span class="vjs-control-text">' + e + "</span> " + n)
            }
            ,
            e
      }(u["default"]);
      u["default"].registerComponent("CurrentTimeDisplay", d),
          n["default"] = d
    }
      , {
        "../../component.js": 5,
        "../../utils/dom.js": 84,
        "../../utils/format-time.js": 87
      }],
    36: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../../component.js")
          , u = r(l)
          , c = t("../../utils/dom.js")
          , p = o(c)
          , f = t("../../utils/format-time.js")
          , h = r(f)
          , d = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.on(n, "durationchange", r.updateContent),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              var e = t.prototype.createEl.call(this, "div", {
                className: "vjs-duration vjs-time-control vjs-control"
              });
              return this.contentEl_ = p.createEl("div", {
                className: "vjs-duration-display",
                innerHTML: '<span class="vjs-control-text">' + this.localize("Duration Time") + "</span> 0:00"
              }, {
                "aria-live": "off"
              }),
                  e.appendChild(this.contentEl_),
                  e
            }
            ,
            e.prototype.updateContent = function() {
              var t = this.player_.duration();
              if (t && this.duration_ !== t) {
                this.duration_ = t;
                var e = this.localize("Duration Time")
                    , n = h["default"](t);
                this.contentEl_.innerHTML = '<span class="vjs-control-text">' + e + "</span> " + n
              }
            }
            ,
            e
      }(u["default"]);
      u["default"].registerComponent("DurationDisplay", d),
          n["default"] = d
    }
      , {
        "../../component.js": 5,
        "../../utils/dom.js": 84,
        "../../utils/format-time.js": 87
      }],
    37: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../../component.js")
          , u = r(l)
          , c = t("../../utils/dom.js")
          , p = o(c)
          , f = t("../../utils/format-time.js")
          , h = r(f)
          , d = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.on(n, "timeupdate", r.updateContent),
              r.on(n, "durationchange", r.updateContent),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              var e = t.prototype.createEl.call(this, "div", {
                className: "vjs-remaining-time vjs-time-control vjs-control"
              });
              return this.contentEl_ = p.createEl("div", {
                className: "vjs-remaining-time-display",
                innerHTML: '<span class="vjs-control-text">' + this.localize("Remaining Time") + "</span> -0:00"
              }, {
                "aria-live": "off"
              }),
                  e.appendChild(this.contentEl_),
                  e
            }
            ,
            e.prototype.updateContent = function() {
              if (this.player_.duration()) {
                var t = this.localize("Remaining Time")
                    , e = h["default"](this.player_.remainingTime());
                e !== this.formattedTime_ && (this.formattedTime_ = e,
                    this.contentEl_.innerHTML = '<span class="vjs-control-text">' + t + "</span> -" + e)
              }
            }
            ,
            e
      }(u["default"]);
      u["default"].registerComponent("RemainingTimeDisplay", d),
          n["default"] = d
    }
      , {
        "../../component.js": 5,
        "../../utils/dom.js": 84,
        "../../utils/format-time.js": 87
      }],
    38: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../../component.js")
          , l = o(a)
          , u = function(t) {
        function e() {
          return r(this, e),
              i(this, t.apply(this, arguments))
        }
        return s(e, t),
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: "vjs-time-control vjs-time-divider",
                innerHTML: "<div><span>/</span></div>"
              })
            }
            ,
            e
      }(l["default"]);
      l["default"].registerComponent("TimeDivider", u),
          n["default"] = u
    }
      , {
        "../../component.js": 5
      }],
    39: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../menu/menu-button.js")
          , u = r(l)
          , c = t("../component.js")
          , p = r(c)
          , f = t("../utils/fn.js")
          , h = o(f)
          , d = function(t) {
        function e(n, o) {
          i(this, e);
          var r = o.tracks
              , a = s(this, t.call(this, n, o));
          if (a.items.length <= 1 && a.hide(),
              !r)
            return s(a);
          var l = h.bind(a, a.update);
          return r.addEventListener("removetrack", l),
              r.addEventListener("addtrack", l),
              a.player_.on("dispose", function() {
                r.removeEventListener("removetrack", l),
                    r.removeEventListener("addtrack", l)
              }),
              a
        }
        return a(e, t),
            e
      }(u["default"]);
      p["default"].registerComponent("TrackButton", d),
          n["default"] = d
    }
      , {
        "../component.js": 5,
        "../menu/menu-button.js": 50,
        "../utils/fn.js": 86
      }],
    40: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../../slider/slider.js")
          , u = r(l)
          , c = t("../../component.js")
          , p = r(c)
          , f = t("../../utils/fn.js")
          , h = o(f);
      t("./volume-level.js");
      var d = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.on(n, "volumechange", r.updateARIAAttributes),
              n.ready(h.bind(r, r.updateARIAAttributes)),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: "vjs-volume-bar vjs-slider-bar"
              }, {
                "aria-label": "volume level"
              })
            }
            ,
            e.prototype.handleMouseMove = function(t) {
              this.checkMuted(),
                  this.player_.volume(this.calculateDistance(t))
            }
            ,
            e.prototype.checkMuted = function() {
              this.player_.muted() && this.player_.muted(!1)
            }
            ,
            e.prototype.getPercent = function() {
              return this.player_.muted() ? 0 : this.player_.volume()
            }
            ,
            e.prototype.stepForward = function() {
              this.checkMuted(),
                  this.player_.volume(this.player_.volume() + .1)
            }
            ,
            e.prototype.stepBack = function() {
              this.checkMuted(),
                  this.player_.volume(this.player_.volume() - .1)
            }
            ,
            e.prototype.updateARIAAttributes = function() {
              var t = Math.round(100 * this.player_.volume());
              this.el_.setAttribute("aria-valuenow", t),
                  this.el_.setAttribute("aria-valuetext", t + "%")
            }
            ,
            e
      }(u["default"]);
      d.prototype.options_ = {
        children: ["volumeLevel"],
        barName: "volumeLevel"
      },
          d.prototype.playerEvent = "volumechange",
          p["default"].registerComponent("VolumeBar", d),
          n["default"] = d
    }
      , {
        "../../component.js": 5,
        "../../slider/slider.js": 60,
        "../../utils/fn.js": 86,
        "./volume-level.js": 42
      }],
    41: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../../component.js")
          , l = o(a);
      t("./volume-bar.js");
      var u = function(t) {
        function e(n, o) {
          r(this, e);
          var s = i(this, t.call(this, n, o));
          return n.tech_ && n.tech_.featuresVolumeControl === !1 && s.addClass("vjs-hidden"),
              s.on(n, "loadstart", function() {
                n.tech_.featuresVolumeControl === !1 ? this.addClass("vjs-hidden") : this.removeClass("vjs-hidden")
              }),
              s
        }
        return s(e, t),
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: "vjs-volume-control vjs-control"
              })
            }
            ,
            e
      }(l["default"]);
      u.prototype.options_ = {
        children: ["volumeBar"]
      },
          l["default"].registerComponent("VolumeControl", u),
          n["default"] = u
    }
      , {
        "../../component.js": 5,
        "./volume-bar.js": 40
      }],
    42: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../../component.js")
          , l = o(a)
          , u = function(t) {
        function e() {
          return r(this, e),
              i(this, t.apply(this, arguments))
        }
        return s(e, t),
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: "vjs-volume-level",
                innerHTML: '<span class="vjs-control-text"></span>'
              })
            }
            ,
            e
      }(l["default"]);
      l["default"].registerComponent("VolumeLevel", u),
          n["default"] = u
    }
      , {
        "../../component.js": 5
      }],
    43: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../utils/fn.js")
          , u = r(l)
          , c = t("../component.js")
          , p = o(c)
          , f = t("../popup/popup.js")
          , h = o(f)
          , d = t("../popup/popup-button.js")
          , y = o(d)
          , v = t("./mute-toggle.js")
          , g = o(v)
          , m = t("./volume-control/volume-bar.js")
          , b = o(m)
          , _ = function(t) {
        function e(n) {
          function o() {
            n.tech_ && n.tech_.featuresVolumeControl === !1 ? this.addClass("vjs-hidden") : this.removeClass("vjs-hidden")
          }
          var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          i(this, e),
          void 0 === r.inline && (r.inline = !0),
          void 0 === r.vertical && (r.vertical = r.inline ? !1 : !0),
              r.volumeBar = r.volumeBar || {},
              r.volumeBar.vertical = !!r.vertical;
          var a = s(this, t.call(this, n, r));
          return a.on(n, "volumechange", a.volumeUpdate),
              a.on(n, "loadstart", a.volumeUpdate),
              o.call(a),
              a.on(n, "loadstart", o),
              a.on(a.volumeBar, ["slideractive", "focus"], function() {
                this.addClass("vjs-slider-active")
              }),
              a.on(a.volumeBar, ["sliderinactive", "blur"], function() {
                this.removeClass("vjs-slider-active")
              }),
              a.on(a.volumeBar, ["focus"], function() {
                this.addClass("vjs-lock-showing")
              }),
              a.on(a.volumeBar, ["blur"], function() {
                this.removeClass("vjs-lock-showing")
              }),
              a
        }
        return a(e, t),
            e.prototype.buildCSSClass = function() {
              var e = "";
              return e = this.options_.vertical ? "vjs-volume-menu-button-vertical" : "vjs-volume-menu-button-horizontal",
              "vjs-volume-menu-button " + t.prototype.buildCSSClass.call(this) + " " + e
            }
            ,
            e.prototype.createPopup = function() {
              var t = new h["default"](this.player_,{
                contentElType: "div"
              })
                  , e = new b["default"](this.player_,this.options_.volumeBar);
              return t.addChild(e),
                  this.menuContent = t,
                  this.volumeBar = e,
                  this.attachVolumeBarEvents(),
                  t
            }
            ,
            e.prototype.handleClick = function() {
              g["default"].prototype.handleClick.call(this),
                  t.prototype.handleClick.call(this)
            }
            ,
            e.prototype.attachVolumeBarEvents = function() {
              this.menuContent.on(["mousedown", "touchdown"], u.bind(this, this.handleMouseDown))
            }
            ,
            e.prototype.handleMouseDown = function() {
              this.on(["mousemove", "touchmove"], u.bind(this.volumeBar, this.volumeBar.handleMouseMove)),
                  this.on(this.el_.ownerDocument, ["mouseup", "touchend"], this.handleMouseUp)
            }
            ,
            e.prototype.handleMouseUp = function() {
              this.off(["mousemove", "touchmove"], u.bind(this.volumeBar, this.volumeBar.handleMouseMove))
            }
            ,
            e
      }(y["default"]);
      _.prototype.volumeUpdate = g["default"].prototype.update,
          _.prototype.controlText_ = "Mute",
          p["default"].registerComponent("VolumeMenuButton", _),
          n["default"] = _
    }
      , {
        "../component.js": 5,
        "../popup/popup-button.js": 56,
        "../popup/popup.js": 57,
        "../utils/fn.js": 86,
        "./mute-toggle.js": 11,
        "./volume-control/volume-bar.js": 40
      }],
    44: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("./component")
          , l = o(a)
          , u = t("./modal-dialog")
          , c = o(u)
          , p = t("./utils/merge-options")
          , f = o(p)
          , h = function(t) {
        function e(n, o) {
          r(this, e);
          var s = i(this, t.call(this, n, o));
          return s.on(n, "error", s.open),
              s
        }
        return s(e, t),
            e.prototype.buildCSSClass = function() {
              return "vjs-error-display " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.content = function() {
              var t = this.player().error();
              return t ? this.localize(t.message) : ""
            }
            ,
            e
      }(c["default"]);
      h.prototype.options_ = f["default"](c["default"].prototype.options_, {
        fillAlways: !0,
        temporary: !1,
        uncloseable: !0
      }),
          l["default"].registerComponent("ErrorDisplay", h),
          n["default"] = h
    }
      , {
        "./component": 5,
        "./modal-dialog": 53,
        "./utils/merge-options": 90
      }],
    45: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      n.__esModule = !0;
      var r = t("./utils/events.js")
          , i = o(r)
          , s = function() {};
      s.prototype.allowedEvents_ = {},
          s.prototype.on = function(t, e) {
            var n = this.addEventListener;
            this.addEventListener = function() {}
                ,
                i.on(this, t, e),
                this.addEventListener = n
          }
          ,
          s.prototype.addEventListener = s.prototype.on,
          s.prototype.off = function(t, e) {
            i.off(this, t, e)
          }
          ,
          s.prototype.removeEventListener = s.prototype.off,
          s.prototype.one = function(t, e) {
            var n = this.addEventListener;
            this.addEventListener = function() {}
                ,
                i.one(this, t, e),
                this.addEventListener = n
          }
          ,
          s.prototype.trigger = function(t) {
            var e = t.type || t;
            "string" == typeof t && (t = {
              type: e
            }),
                t = i.fixEvent(t),
            this.allowedEvents_[e] && this["on" + e] && this["on" + e](t),
                i.trigger(this, t)
          }
          ,
          s.prototype.dispatchEvent = s.prototype.trigger,
          n["default"] = s
    }
      , {
        "./utils/events.js": 85
      }],
    46: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      n.__esModule = !0;
      var r = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
          }
          : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
          }
          , i = t("./utils/log")
          , s = o(i)
          , a = function(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + ("undefined" == typeof e ? "undefined" : r(e)));
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (t.super_ = e)
      }
          , l = function(t) {
        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
            , n = function() {
          t.apply(this, arguments)
        }
            , o = {};
        "object" === ("undefined" == typeof e ? "undefined" : r(e)) ? ("function" == typeof e.init && (s["default"].warn("Constructor logic via init() is deprecated; please use constructor() instead."),
            e.constructor = e.init),
        e.constructor !== Object.prototype.constructor && (n = e.constructor),
            o = e) : "function" == typeof e && (n = e),
            a(n, t);
        for (var i in o)
          o.hasOwnProperty(i) && (n.prototype[i] = o[i]);
        return n
      };
      n["default"] = l
    }
      , {
        "./utils/log": 89
      }],
    47: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      n.__esModule = !0;
      for (var r = t("global/document"), i = o(r), s = {}, a = [["requestFullscreen", "exitFullscreen", "fullscreenElement", "fullscreenEnabled", "fullscreenchange", "fullscreenerror"], ["webkitRequestFullscreen", "webkitExitFullscreen", "webkitFullscreenElement", "webkitFullscreenEnabled", "webkitfullscreenchange", "webkitfullscreenerror"], ["webkitRequestFullScreen", "webkitCancelFullScreen", "webkitCurrentFullScreenElement", "webkitCancelFullScreen", "webkitfullscreenchange", "webkitfullscreenerror"], ["mozRequestFullScreen", "mozCancelFullScreen", "mozFullScreenElement", "mozFullScreenEnabled", "mozfullscreenchange", "mozfullscreenerror"], ["msRequestFullscreen", "msExitFullscreen", "msFullscreenElement", "msFullscreenEnabled", "MSFullscreenChange", "MSFullscreenError"]], l = a[0], u = void 0, c = 0; c < a.length; c++)
        if (a[c][1]in i["default"]) {
          u = a[c];
          break
        }
      if (u)
        for (var p = 0; p < u.length; p++)
          s[l[p]] = u[p];
      n["default"] = s
    }
      , {
        "global/document": 96
      }],
    48: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("./component")
          , l = o(a)
          , u = function(t) {
        function e() {
          return r(this, e),
              i(this, t.apply(this, arguments))
        }
        return s(e, t),
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: "vjs-loading-spinner",
                dir: "ltr"
              })
            }
            ,
            e
      }(l["default"]);
      l["default"].registerComponent("LoadingSpinner", u),
          n["default"] = u
    }
      , {
        "./component": 5
      }],
    49: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t) {
        return t instanceof r ? t : ("number" == typeof t ? this.code = t : "string" == typeof t ? this.message = t : "object" === ("undefined" == typeof t ? "undefined" : i(t)) && ("number" == typeof t.code && (this.code = t.code),
            a["default"](this, t)),
            void (this.message || (this.message = r.defaultMessages[this.code] || "")))
      }
      n.__esModule = !0;
      var i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
          }
          : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
          }
          , s = t("object.assign")
          , a = o(s);
      r.prototype.code = 0,
          r.prototype.message = "",
          r.prototype.status = null,
          r.errorTypes = ["MEDIA_ERR_CUSTOM", "MEDIA_ERR_ABORTED", "MEDIA_ERR_NETWORK", "MEDIA_ERR_DECODE", "MEDIA_ERR_SRC_NOT_SUPPORTED", "MEDIA_ERR_ENCRYPTED"],
          r.defaultMessages = {
            1: "You aborted the media playback",
            2: "A network error caused the media download to fail part-way.",
            3: "The media playback was aborted due to a corruption problem or because the media used features your browser did not support.",
            4: "The media could not be loaded, either because the server or network failed or because the format is not supported.",
            5: "The media is encrypted and we do not have the keys to decrypt it."
          };
      for (var l = 0; l < r.errorTypes.length; l++)
        r[r.errorTypes[l]] = l,
            r.prototype[r.errorTypes[l]] = l;
      n["default"] = r
    }
      , {
        "object.assign": 140
      }],
    50: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../clickable-component.js")
          , u = r(l)
          , c = t("../component.js")
          , p = r(c)
          , f = t("./menu.js")
          , h = r(f)
          , d = t("../utils/dom.js")
          , y = o(d)
          , v = t("../utils/fn.js")
          , g = o(v)
          , m = t("../utils/to-title-case.js")
          , b = r(m)
          , _ = function(t) {
        function e(n) {
          var o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.update(),
              r.enabled_ = !0,
              r.el_.setAttribute("aria-haspopup", "true"),
              r.el_.setAttribute("role", "menuitem"),
              r.on("keydown", r.handleSubmenuKeyPress),
              r
        }
        return a(e, t),
            e.prototype.update = function() {
              var t = this.createMenu();
              this.menu && this.removeChild(this.menu),
                  this.menu = t,
                  this.addChild(t),
                  this.buttonPressed_ = !1,
                  this.el_.setAttribute("aria-expanded", "false"),
                  this.items && 0 === this.items.length ? this.hide() : this.items && this.items.length > 1 && this.show()
            }
            ,
            e.prototype.createMenu = function() {
              var t = new h["default"](this.player_);
              if (this.options_.title) {
                var e = y.createEl("li", {
                  className: "vjs-menu-title",
                  innerHTML: b["default"](this.options_.title),
                  tabIndex: -1
                });
                t.children_.unshift(e),
                    y.insertElFirst(e, t.contentEl())
              }
              if (this.items = this.createItems(),
                  this.items)
                for (var n = 0; n < this.items.length; n++)
                  t.addItem(this.items[n]);
              return t
            }
            ,
            e.prototype.createItems = function() {}
            ,
            e.prototype.createEl = function() {
              var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "div"
                  , n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {
                className: this.buildCSSClass()
              };
              return t.prototype.createEl.call(this, e, n)
            }
            ,
            e.prototype.buildCSSClass = function() {
              var e = "vjs-menu-button";
              return e += this.options_.inline === !0 ? "-inline" : "-popup",
              "vjs-menu-button " + e + " " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.handleClick = function() {
              this.one(this.menu.contentEl(), "mouseleave", g.bind(this, function() {
                this.unpressButton(),
                    this.el_.blur()
              })),
                  this.buttonPressed_ ? this.unpressButton() : this.pressButton()
            }
            ,
            e.prototype.handleKeyPress = function(e) {
              27 === e.which || 9 === e.which ? (this.buttonPressed_ && this.unpressButton(),
              9 !== e.which && e.preventDefault()) : 38 === e.which || 40 === e.which ? this.buttonPressed_ || (this.pressButton(),
                  e.preventDefault()) : t.prototype.handleKeyPress.call(this, e)
            }
            ,
            e.prototype.handleSubmenuKeyPress = function(t) {
              (27 === t.which || 9 === t.which) && (this.buttonPressed_ && this.unpressButton(),
              9 !== t.which && t.preventDefault())
            }
            ,
            e.prototype.pressButton = function() {
              this.enabled_ && (this.buttonPressed_ = !0,
                  this.menu.lockShowing(),
                  this.el_.setAttribute("aria-expanded", "true"),
                  this.menu.focus())
            }
            ,
            e.prototype.unpressButton = function() {
              this.enabled_ && (this.buttonPressed_ = !1,
                  this.menu.unlockShowing(),
                  this.el_.setAttribute("aria-expanded", "false"),
                  this.el_.focus())
            }
            ,
            e.prototype.disable = function() {
              return this.buttonPressed_ = !1,
                  this.menu.unlockShowing(),
                  this.el_.setAttribute("aria-expanded", "false"),
                  this.enabled_ = !1,
                  t.prototype.disable.call(this)
            }
            ,
            e.prototype.enable = function() {
              return this.enabled_ = !0,
                  t.prototype.enable.call(this)
            }
            ,
            e
      }(u["default"]);
      p["default"].registerComponent("MenuButton", _),
          n["default"] = _
    }
      , {
        "../clickable-component.js": 3,
        "../component.js": 5,
        "../utils/dom.js": 84,
        "../utils/fn.js": 86,
        "../utils/to-title-case.js": 93,
        "./menu.js": 52
      }],
    51: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../clickable-component.js")
          , l = o(a)
          , u = t("../component.js")
          , c = o(u)
          , p = t("object.assign")
          , f = o(p)
          , h = function(t) {
        function e(n, o) {
          r(this, e);
          var s = i(this, t.call(this, n, o));
          return s.selectable = o.selectable,
              s.selected(o.selected),
              s.selectable ? s.el_.setAttribute("role", "menuitemcheckbox") : s.el_.setAttribute("role", "menuitem"),
              s
        }
        return s(e, t),
            e.prototype.createEl = function(e, n, o) {
              return t.prototype.createEl.call(this, "li", f["default"]({
                className: "vjs-menu-item",
                innerHTML: this.localize(this.options_.label),
                tabIndex: -1
              }, n), o)
            }
            ,
            e.prototype.handleClick = function() {
              this.selected(!0)
            }
            ,
            e.prototype.selected = function(t) {
              this.selectable && (t ? (this.addClass("vjs-selected"),
                  this.el_.setAttribute("aria-checked", "true"),
                  this.controlText("selected")) : (this.removeClass("vjs-selected"),
                  this.el_.setAttribute("aria-checked", "false"),
                  this.controlText("")))
            }
            ,
            e
      }(l["default"]);
      c["default"].registerComponent("MenuItem", h),
          n["default"] = h
    }
      , {
        "../clickable-component.js": 3,
        "../component.js": 5,
        "object.assign": 140
      }],
    52: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../component.js")
          , u = r(l)
          , c = t("../utils/dom.js")
          , p = o(c)
          , f = t("../utils/fn.js")
          , h = o(f)
          , d = t("../utils/events.js")
          , y = o(d)
          , v = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.focusedChild_ = -1,
              r.on("keydown", r.handleKeyPress),
              r
        }
        return a(e, t),
            e.prototype.addItem = function(t) {
              this.addChild(t),
                  t.on("click", h.bind(this, function() {
                    this.unlockShowing()
                  }))
            }
            ,
            e.prototype.createEl = function() {
              var e = this.options_.contentElType || "ul";
              this.contentEl_ = p.createEl(e, {
                className: "vjs-menu-content"
              }),
                  this.contentEl_.setAttribute("role", "menu");
              var n = t.prototype.createEl.call(this, "div", {
                append: this.contentEl_,
                className: "vjs-menu"
              });
              return n.setAttribute("role", "presentation"),
                  n.appendChild(this.contentEl_),
                  y.on(n, "click", function(t) {
                    t.preventDefault(),
                        t.stopImmediatePropagation()
                  }),
                  n
            }
            ,
            e.prototype.handleKeyPress = function(t) {
              37 === t.which || 40 === t.which ? (t.preventDefault(),
                  this.stepForward()) : (38 === t.which || 39 === t.which) && (t.preventDefault(),
                  this.stepBack())
            }
            ,
            e.prototype.stepForward = function() {
              var t = 0;
              void 0 !== this.focusedChild_ && (t = this.focusedChild_ + 1),
                  this.focus(t)
            }
            ,
            e.prototype.stepBack = function() {
              var t = 0;
              void 0 !== this.focusedChild_ && (t = this.focusedChild_ - 1),
                  this.focus(t)
            }
            ,
            e.prototype.focus = function() {
              var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
                  , e = this.children().slice()
                  , n = e.length && e[0].className && /vjs-menu-title/.test(e[0].className);
              n && e.shift(),
              e.length > 0 && (0 > t ? t = 0 : t >= e.length && (t = e.length - 1),
                  this.focusedChild_ = t,
                  e[t].el_.focus())
            }
            ,
            e
      }(u["default"]);
      u["default"].registerComponent("Menu", v),
          n["default"] = v
    }
      , {
        "../component.js": 5,
        "../utils/dom.js": 84,
        "../utils/events.js": 85,
        "../utils/fn.js": 86
      }],
    53: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("./utils/dom")
          , u = r(l)
          , c = t("./utils/fn")
          , p = r(c)
          , f = t("./component")
          , h = o(f)
          , d = "vjs-modal-dialog"
          , y = 27
          , v = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.opened_ = r.hasBeenOpened_ = r.hasBeenFilled_ = !1,
              r.closeable(!r.options_.uncloseable),
              r.content(r.options_.content),
              r.contentEl_ = u.createEl("div", {
                className: d + "-content"
              }, {
                role: "document"
              }),
              r.descEl_ = u.createEl("p", {
                className: d + "-description vjs-offscreen",
                id: r.el().getAttribute("aria-describedby")
              }),
              u.textContent(r.descEl_, r.description()),
              r.el_.appendChild(r.descEl_),
              r.el_.appendChild(r.contentEl_),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: this.buildCSSClass(),
                tabIndex: -1
              }, {
                "aria-describedby": this.id() + "_description",
                "aria-hidden": "true",
                "aria-label": this.label(),
                role: "dialog"
              })
            }
            ,
            e.prototype.buildCSSClass = function() {
              return d + " vjs-hidden " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e.prototype.handleKeyPress = function(t) {
              t.which === y && this.closeable() && this.close()
            }
            ,
            e.prototype.label = function() {
              return this.options_.label || this.localize("Modal Window")
            }
            ,
            e.prototype.description = function() {
              var t = this.options_.description || this.localize("This is a modal window.");
              return this.closeable() && (t += " " + this.localize("This modal can be closed by pressing the Escape key or activating the close button.")),
                  t
            }
            ,
            e.prototype.open = function() {
              if (!this.opened_) {
                var t = this.player();
                this.trigger("beforemodalopen"),
                    this.opened_ = !0,
                (this.options_.fillAlways || !this.hasBeenOpened_ && !this.hasBeenFilled_) && this.fill(),
                    this.wasPlaying_ = !t.paused(),
                this.wasPlaying_ && t.pause(),
                this.closeable() && this.on(this.el_.ownerDocument, "keydown", p.bind(this, this.handleKeyPress)),
                    t.controls(!1),
                    this.show(),
                    this.el().setAttribute("aria-hidden", "false"),
                    this.trigger("modalopen"),
                    this.hasBeenOpened_ = !0
              }
              return this
            }
            ,
            e.prototype.opened = function(t) {
              return "boolean" == typeof t && this[t ? "open" : "close"](),
                  this.opened_
            }
            ,
            e.prototype.close = function() {
              if (this.opened_) {
                var t = this.player();
                this.trigger("beforemodalclose"),
                    this.opened_ = !1,
                this.wasPlaying_ && t.play(),
                this.closeable() && this.off(this.el_.ownerDocument, "keydown", p.bind(this, this.handleKeyPress)),
                    t.controls(!0),
                    this.hide(),
                    this.el().setAttribute("aria-hidden", "true"),
                    this.trigger("modalclose"),
                this.options_.temporary && this.dispose()
              }
              return this
            }
            ,
            e.prototype.closeable = function n(t) {
              if ("boolean" == typeof t) {
                var n = this.closeable_ = !!t
                    , e = this.getChild("closeButton");
                if (n && !e) {
                  var o = this.contentEl_;
                  this.contentEl_ = this.el_,
                      e = this.addChild("closeButton", {
                        controlText: "Close Modal Dialog"
                      }),
                      this.contentEl_ = o,
                      this.on(e, "close", this.close)
                }
                !n && e && (this.off(e, "close", this.close),
                    this.removeChild(e),
                    e.dispose())
              }
              return this.closeable_
            }
            ,
            e.prototype.fill = function() {
              return this.fillWith(this.content())
            }
            ,
            e.prototype.fillWith = function(t) {
              var e = this.contentEl()
                  , n = e.parentNode
                  , o = e.nextSibling;
              return this.trigger("beforemodalfill"),
                  this.hasBeenFilled_ = !0,
                  n.removeChild(e),
                  this.empty(),
                  u.insertContent(e, t),
                  this.trigger("modalfill"),
                  o ? n.insertBefore(e, o) : n.appendChild(e),
                  this
            }
            ,
            e.prototype.empty = function() {
              return this.trigger("beforemodalempty"),
                  u.emptyEl(this.contentEl()),
                  this.trigger("modalempty"),
                  this
            }
            ,
            e.prototype.content = function(t) {
              return "undefined" != typeof t && (this.content_ = t),
                  this.content_
            }
            ,
            e
      }(h["default"]);
      v.prototype.options_ = {
        temporary: !0
      },
          h["default"].registerComponent("ModalDialog", v),
          n["default"] = v
    }
      , {
        "./component": 5,
        "./utils/dom": 84,
        "./utils/fn": 86
      }],
    54: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("./component.js")
          , u = r(l)
          , c = t("global/document")
          , p = r(c)
          , f = t("global/window")
          , h = r(f)
          , d = t("./utils/events.js")
          , y = o(d)
          , v = t("./utils/dom.js")
          , g = o(v)
          , m = t("./utils/fn.js")
          , b = o(m)
          , _ = t("./utils/guid.js")
          , j = o(_)
          , w = t("./utils/browser.js")
          , T = o(w)
          , k = t("./utils/log.js")
          , E = r(k)
          , C = t("./utils/to-title-case.js")
          , O = r(C)
          , S = t("./utils/time-ranges.js")
          , x = t("./utils/buffer.js")
          , P = t("./utils/stylesheet.js")
          , M = o(P)
          , A = t("./fullscreen-api.js")
          , I = r(A)
          , D = t("./media-error.js")
          , R = r(D)
          , L = t("safe-json-parse/tuple")
          , N = r(L)
          , F = t("object.assign")
          , B = r(F)
          , H = t("./utils/merge-options.js")
          , V = r(H)
          , $ = t("./tracks/text-track-list-converter.js")
          , z = r($)
          , U = t("./modal-dialog")
          , W = r(U)
          , G = t("./tech/tech.js")
          , X = r(G)
          , q = t("./tracks/audio-track-list.js")
          , K = r(q)
          , Y = t("./tracks/video-track-list.js")
          , J = r(Y);
      t("./tech/loader.js"),
          t("./tech/flash.js"),
          t("./poster-image.js"),
          t("./tracks/text-track-display.js"),
          t("./loading-spinner.js"),
          t("./big-play-button.js"),
          t("./close-button.js"),
          t("./control-bar/control-bar.js"),
          t("./error-display.js"),
          t("./tracks/text-track-settings.js"),
          t("./tracks/simple-text-track-settings.js"),
          t("./tech/html5.js");
      var Q = function(t) {
        function e(n, o, r) {
          if (i(this, e),
              n.id = n.id || "vjs_video_" + j.newGUID(),
              o = B["default"](e.getTagSettings(n), o),
              o.initChildren = !1,
              o.createEl = !1,
              o.reportTouchActivity = !1,
              !o.language)
            if ("function" == typeof n.closest) {
              var a = n.closest("[lang]");
              a && (o.language = a.getAttribute("lang"))
            } else
              for (var l = n; l && 1 === l.nodeType; ) {
                if (g.getElAttributes(l).hasOwnProperty("lang")) {
                  o.language = l.getAttribute("lang");
                  break
                }
                l = l.parentNode
              }
          var u = s(this, t.call(this, null, o, r));
          if (!u.options_ || !u.options_.techOrder || !u.options_.techOrder.length)
            throw new Error("No techOrder specified. Did you overwrite videojs.options instead of just changing the properties you want to override?");
          u.tag = n,
              u.tagAttributes = n && g.getElAttributes(n),
              u.language(u.options_.language),
              o.languages ? !function() {
                var t = {};
                Object.getOwnPropertyNames(o.languages).forEach(function(e) {
                  t[e.toLowerCase()] = o.languages[e]
                }),
                    u.languages_ = t
              }() : u.languages_ = e.prototype.options_.languages,
              u.cache_ = {},
              u.poster_ = o.poster || "",
              u.controls_ = !!o.controls,
              u.hideLoadingSpinner_ = !!o.hideLoadingSpinner,
              u.forceActiveComponents = [],
              n.controls = !1,
              u.scrubbing_ = !1,
              u.el_ = u.createEl();
          var c = V["default"](u.options_);
          return o.plugins && !function() {
            var t = o.plugins;
            Object.getOwnPropertyNames(t).forEach(function(e) {
              "function" == typeof this[e] ? this[e](t[e]) : E["default"].error("Unable to find plugin:", e)
            }, u)
          }(),
              u.options_.playerOptions = c,
              u.initChildren(),
              u.isAudio("audio" === n.nodeName.toLowerCase()),
              u.addClass(u.controls() ? "vjs-controls-enabled" : "vjs-controls-disabled"),
          u.hideLoadingSpinner_ && u.addClass("vjs-hide-loading-spinner"),
              u.el_.setAttribute("role", "region"),
              u.isAudio() ? u.el_.setAttribute("aria-label", "audio player") : u.el_.setAttribute("aria-label", "video player"),
          u.isAudio() && u.addClass("vjs-audio"),
          u.flexNotSupported_() && u.addClass("vjs-no-flex"),
          T.IS_IOS || u.addClass("vjs-workinghover"),
              e.players[u.id_] = u,
              u.userActive(!0),
              u.reportUserActivity(),
              u.listenForUserActivity_(),
              u.on("fullscreenchange", u.handleFullscreenChange_),
              u.on("stageclick", u.handleStageClick_),
              u
        }
        return a(e, t),
            e.prototype.dispose = function() {
              this.trigger("dispose"),
                  this.off("dispose"),
              this.styleEl_ && this.styleEl_.parentNode && this.styleEl_.parentNode.removeChild(this.styleEl_),
                  e.players[this.id_] = null,
              this.tag && this.tag.player && (this.tag.player = null),
              this.el_ && this.el_.player && (this.el_.player = null),
              this.tech_ && this.tech_.dispose(),
                  t.prototype.dispose.call(this)
            }
            ,
            e.prototype.createEl = function() {
              var e = this.el_ = t.prototype.createEl.call(this, "div")
                  , n = this.tag;
              n.removeAttribute("width"),
                  n.removeAttribute("height");
              var o = g.getElAttributes(n);
              if (Object.getOwnPropertyNames(o).forEach(function(t) {
                "class" === t ? e.className = o[t] : e.setAttribute(t, o[t])
              }),
                  n.playerId = n.id,
                  n.id += "_html5_api",
                  n.className = "vjs-tech",
                  n.player = e.player = this,
                  this.addClass("vjs-paused"),
              h["default"].VIDEOJS_NO_DYNAMIC_STYLE !== !0) {
                this.styleEl_ = M.createStyleElement("vjs-styles-dimensions");
                var r = g.$(".vjs-styles-defaults")
                    , i = g.$("head");
                i.insertBefore(this.styleEl_, r ? r.nextSibling : i.firstChild)
              }
              this.width(this.options_.width),
                  this.height(this.options_.height),
                  this.fluid(this.options_.fluid),
                  this.aspectRatio(this.options_.aspectRatio);
              for (var s = n.getElementsByTagName("a"), a = 0; a < s.length; a++) {
                var l = s.item(a);
                g.addElClass(l, "vjs-hidden"),
                    l.setAttribute("hidden", "hidden")
              }
              return n.initNetworkState_ = n.networkState,
              n.parentNode && n.parentNode.insertBefore(e, n),
                  g.insertElFirst(n, e),
                  this.children_.unshift(n),
                  this.el_ = e,
                  e
            }
            ,
            e.prototype.width = function(t) {
              return this.dimension("width", t)
            }
            ,
            e.prototype.height = function(t) {
              return this.dimension("height", t)
            }
            ,
            e.prototype.dimension = function(t, e) {
              var n = t + "_";
              if (void 0 === e)
                return this[n] || 0;
              if ("" === e)
                this[n] = void 0;
              else {
                var o = parseFloat(e);
                if (isNaN(o))
                  return E["default"].error('Improper value "' + e + '" supplied for for ' + t),
                      this;
                this[n] = o
              }
              return this.updateStyleEl_(),
                  this
            }
            ,
            e.prototype.fluid = function(t) {
              return void 0 === t ? !!this.fluid_ : (this.fluid_ = !!t,
                  void (t ? this.addClass("vjs-fluid") : this.removeClass("vjs-fluid")))
            }
            ,
            e.prototype.aspectRatio = function(t) {
              if (void 0 === t)
                return this.aspectRatio_;
              if (!/^\d+\:\d+$/.test(t))
                throw new Error("Improper value supplied for aspect ratio. The format should be width:height, for example 16:9.");
              this.aspectRatio_ = t,
                  this.fluid(!0),
                  this.updateStyleEl_()
            }
            ,
            e.prototype.updateStyleEl_ = function() {
              if (h["default"].VIDEOJS_NO_DYNAMIC_STYLE === !0) {
                var t = "number" == typeof this.width_ ? this.width_ : this.options_.width
                    , e = "number" == typeof this.height_ ? this.height_ : this.options_.height
                    , n = this.tech_ && this.tech_.el();
                return void (n && (t >= 0 && (n.width = t),
                e >= 0 && (n.height = e)))
              }
              var o = void 0
                  , r = void 0
                  , i = void 0
                  , s = void 0;
              i = void 0 !== this.aspectRatio_ && "auto" !== this.aspectRatio_ ? this.aspectRatio_ : this.videoWidth() ? this.videoWidth() + ":" + this.videoHeight() : "16:9";
              var a = i.split(":")
                  , l = a[1] / a[0];
              o = void 0 !== this.width_ ? this.width_ : void 0 !== this.height_ ? this.height_ / l : this.videoWidth() || 300,
                  r = void 0 !== this.height_ ? this.height_ : o * l,
                  s = /^[^a-zA-Z]/.test(this.id()) ? "dimensions-" + this.id() : this.id() + "-dimensions",
                  this.addClass(s),
                  M.setTextContent(this.styleEl_, "\n      ." + s + " {\n        width: " + o + "px;\n        height: " + r + "px;\n      }\n\n      ." + s + ".vjs-fluid {\n        padding-top: " + 100 * l + "%;\n      }\n    ")
            }
            ,
            e.prototype.loadTech_ = function(t, e) {
              this.tech_ && this.unloadTech_(),
              "Html5" !== t && this.tag && (X["default"].getTech("Html5").disposeMediaElement(this.tag),
                  this.tag.player = null,
                  this.tag = null),
                  this.techName_ = t,
                  this.isReady_ = !1;
              var n = B["default"]({
                source: e,
                nativeControlsForTouch: this.options_.nativeControlsForTouch,
                playerId: this.id(),
                techId: this.id() + "_" + t + "_api",
                videoTracks: this.videoTracks_,
                textTracks: this.textTracks_,
                audioTracks: this.audioTracks_,
                autoplay: this.options_.autoplay,
                preload: this.options_.preload,
                loop: this.options_.loop,
                muted: this.options_.muted,
                poster: this.poster(),
                language: this.language(),
                "vtt.js": this.options_["vtt.js"]
              }, this.options_[t.toLowerCase()]);
              this.tag && (n.tag = this.tag),
              e && (this.currentType_ = e.type,
              e.src === this.cache_.src && this.cache_.currentTime > 0 && (n.startTime = this.cache_.currentTime),
                  this.cache_.src = e.src);
              var o = X["default"].getTech(t);
              o || (o = u["default"].getComponent(t)),
                  this.tech_ = new o(n),
                  this.tech_.ready(b.bind(this, this.handleTechReady_), !0),
                  z["default"].jsonToTextTracks(this.textTracksJson_ || [], this.tech_),
                  this.on(this.tech_, "loadstart", this.handleTechLoadStart_),
                  this.on(this.tech_, "waitstart", this.handleTechWaitStart_),
                  this.on(this.tech_, "waiting", this.handleTechWaiting_),
                  this.on(this.tech_, "waitend", this.handleTechWaitEnd_),
                  this.on(this.tech_, "canplay", this.handleTechCanPlay_),
                  this.on(this.tech_, "canplaythrough", this.handleTechCanPlayThrough_),
                  this.on(this.tech_, "playing", this.handleTechPlaying_),
                  this.on(this.tech_, "ended", this.handleTechEnded_),
                  this.on(this.tech_, "seeking", this.handleTechSeeking_),
                  this.on(this.tech_, "seeked", this.handleTechSeeked_),
                  this.on(this.tech_, "play", this.handleTechPlay_),
                  this.on(this.tech_, "firstplay", this.handleTechFirstPlay_),
                  this.on(this.tech_, "pause", this.handleTechPause_),
                  this.on(this.tech_, "progress", this.handleTechProgress_),
                  this.on(this.tech_, "durationchange", this.handleTechDurationChange_),
                  this.on(this.tech_, "fullscreenchange", this.handleTechFullscreenChange_),
                  this.on(this.tech_, "error", this.handleTechError_),
                  this.on(this.tech_, "suspend", this.handleTechSuspend_),
                  this.on(this.tech_, "abort", this.handleTechAbort_),
                  this.on(this.tech_, "emptied", this.handleTechEmptied_),
                  this.on(this.tech_, "stalled", this.handleTechStalled_),
                  this.on(this.tech_, "loadedmetadata", this.handleTechLoadedMetaData_),
                  this.on(this.tech_, "loadeddata", this.handleTechLoadedData_),
                  this.on(this.tech_, "segmentloaderror", this.handleTechSegmentLoadError_),
                  this.on(this.tech_, "segmentloadsuccess", this.handleTechSegmentLoadSuccess_),
                  this.on(this.tech_, "timeupdate", this.handleTechTimeUpdate_),
                  this.on(this.tech_, "ratechange", this.handleTechRateChange_),
                  this.on(this.tech_, "volumechange", this.handleTechVolumeChange_),
                  this.on(this.tech_, "texttrackchange", this.handleTechTextTrackChange_),
                  this.on(this.tech_, "loadedmetadata", this.updateStyleEl_),
                  this.on(this.tech_, "posterchange", this.handleTechPosterChange_),
                  this.on(this.tech_, "textdata", this.handleTechTextData_),
                  this.usingNativeControls(this.techGet_("controls")),
              this.controls() && !this.usingNativeControls() && this.addTechControlsListeners_(),
              this.tech_.el().parentNode === this.el() || "Html5" === t && this.tag || g.insertElFirst(this.tech_.el(), this.el()),
              this.tag && (this.tag.player = null,
                  this.tag = null)
            }
            ,
            e.prototype.unloadTech_ = function() {
              this.videoTracks_ = this.videoTracks(),
                  this.textTracks_ = this.textTracks(),
                  this.audioTracks_ = this.audioTracks(),
                  this.textTracksJson_ = z["default"].textTracksToJson(this.tech_),
                  this.isReady_ = !1,
                  this.tech_.dispose(),
                  this.tech_ = !1
            }
            ,
            e.prototype.tech = function(t) {
              if (t && t.IWillNotUseThisInPlugins)
                return this.tech_;
              var e = "\n      Please make sure that you are not using this inside of a plugin.\n      To disable this alert and error, please pass in an object with\n      `IWillNotUseThisInPlugins` to the `tech` method. See\n      https://github.com/videojs/video.js/issues/2617 for more info.\n    ";
              throw h["default"].alert(e),
                  new Error(e)
            }
            ,
            e.prototype.addTechControlsListeners_ = function() {
              this.removeTechControlsListeners_(),
                  this.on(this.tech_, "mousedown", this.handleTechClick_),
                  this.on(this.tech_, "dblclick", this.handleTechDblClick_),
                  this.on(this.tech_, "touchstart", this.handleTechTouchStart_),
                  this.on(this.tech_, "touchmove", this.handleTechTouchMove_),
                  this.on(this.tech_, "touchend", this.handleTechTouchEnd_),
                  this.on(this.tech_, "tap", this.handleTechTap_)
            }
            ,
            e.prototype.removeTechControlsListeners_ = function() {
              this.off(this.tech_, "tap", this.handleTechTap_),
                  this.off(this.tech_, "touchstart", this.handleTechTouchStart_),
                  this.off(this.tech_, "touchmove", this.handleTechTouchMove_),
                  this.off(this.tech_, "touchend", this.handleTechTouchEnd_),
                  this.off(this.tech_, "mousedown", this.handleTechClick_),
                  this.off(this.tech_, "dblclick", this.handleTechDblClick_)
            }
            ,
            e.prototype.handleTechReady_ = function() {
              if (this.triggerReady(),
              this.cache_.volume && this.techCall_("setVolume", this.cache_.volume),
                  this.handleTechPosterChange_(),
                  this.handleTechDurationChange_(),
              (this.src() || this.currentSrc()) && this.tag && this.options_.autoplay && this.paused()) {
                try {
                  delete this.tag.poster
                } catch (t) {
                  E["default"]("deleting tag.poster throws in some browsers", t)
                }
                this.play()
              }
            }
            ,
            e.prototype.handleTechLoadStart_ = function() {
              this.removeClass("vjs-ended"),
                  this.error(null),
                  this.paused() ? (this.hasStarted(!1),
                      this.trigger("loadstart")) : (this.trigger("loadstart"),
                      this.trigger("firstplay"))
            }
            ,
            e.prototype.hasStarted = function(t) {
              return void 0 !== t ? (this.hasStarted_ !== t && (this.hasStarted_ = t,
                  t ? (this.addClass("vjs-has-started"),
                      this.trigger("firstplay")) : this.removeClass("vjs-has-started")),
                  this) : !!this.hasStarted_
            }
            ,
            e.prototype.handleTechPlay_ = function() {
              this.removeClass("vjs-ended"),
                  this.removeClass("vjs-paused"),
                  this.addClass("vjs-playing"),
                  this.hasStarted(!0),
                  this.trigger("play")
            }
            ,
            e.prototype.handleTechWaitStart_ = function() {
              this.addClass("vjs-waiting"),
                  this.trigger("waitstart")
            }
            ,
            e.prototype.handleTechWaiting_ = function() {
              var t = this;
              this.addClass("vjs-waiting"),
                  this.trigger("waiting"),
                  this.one("timeupdate", function() {
                    "undefined" == typeof t.tech_.el_.waiting && t.removeClass("vjs-waiting")
                  })
            }
            ,
            e.prototype.handleTechWaitEnd_ = function() {
              this.removeClass("vjs-waiting"),
                  this.trigger("waitend")
            }
            ,
            e.prototype.handleTechCanPlay_ = function() {
              this.removeClass("vjs-waiting"),
                  this.trigger("canplay")
            }
            ,
            e.prototype.handleTechCanPlayThrough_ = function() {
              this.removeClass("vjs-waiting"),
                  this.trigger("canplaythrough")
            }
            ,
            e.prototype.handleTechPlaying_ = function() {
              this.removeClass("vjs-waiting"),
                  this.trigger("playing")
            }
            ,
            e.prototype.handleTechSeeking_ = function() {
              if (!this.options_.playerOptions.canSeek_) {
                var t = this.techGet_("currentTime") - this.cache_.supposedCurrentTime;
                Math.abs(t) > .01 && this.techCall_("setCurrentTime", this.cache_.supposedCurrentTime)
              }
              this.addClass("vjs-seeking"),
                  this.trigger("seeking")
            }
            ,
            e.prototype.handleTechSeeked_ = function() {
              this.removeClass("vjs-seeking"),
                  this.trigger("seeked")
            }
            ,
            e.prototype.handleTechFirstPlay_ = function() {
              this.options_.starttime && this.currentTime(this.options_.starttime),
                  this.addClass("vjs-has-started"),
                  this.trigger("firstplay")
            }
            ,
            e.prototype.handleTechPause_ = function() {
              this.removeClass("vjs-playing"),
                  this.addClass("vjs-paused"),
                  this.trigger("pause")
            }
            ,
            e.prototype.handleTechProgress_ = function() {
              this.trigger("progress")
            }
            ,
            e.prototype.handleTechEnded_ = function() {
              this.cache_.supposedCurrentTime = 0,
                  this.addClass("vjs-ended"),
                  this.options_.loop ? (this.currentTime(0),
                      this.play()) : this.paused() || this.pause(),
                  this.trigger("ended")
            }
            ,
            e.prototype.handleTechDurationChange_ = function() {
              this.duration(this.techGet_("duration"))
            }
            ,
            e.prototype.handleTechClick_ = function(t) {
              0 === t.button && this.controls() && (this.paused() ? this.play() : this.pause())
            }
            ,
            e.prototype.handleTechDblClick_ = function() {
              this.isFullscreen() ? this.exitFullscreen() : this.requestFullscreen()
            }
            ,
            e.prototype.handleTechTap_ = function() {
              this.userActive(!this.userActive())
            }
            ,
            e.prototype.handleTechTouchStart_ = function() {
              this.userWasActive = this.userActive()
            }
            ,
            e.prototype.handleTechTouchMove_ = function() {
              this.userWasActive && this.reportUserActivity()
            }
            ,
            e.prototype.handleTechTouchEnd_ = function(t) {
              t.preventDefault()
            }
            ,
            e.prototype.handleFullscreenChange_ = function() {
              this.isFullscreen() ? this.addClass("vjs-fullscreen") : this.removeClass("vjs-fullscreen")
            }
            ,
            e.prototype.handleStageClick_ = function() {
              this.reportUserActivity()
            }
            ,
            e.prototype.handleTechFullscreenChange_ = function(t, e) {
              e && this.isFullscreen(e.isFullscreen),
                  this.trigger("fullscreenchange")
            }
            ,
            e.prototype.handleTechError_ = function() {
              var t = this.tech_.error();
              this.error(t)
            }
            ,
            e.prototype.handleTechSuspend_ = function() {
              this.trigger("suspend")
            }
            ,
            e.prototype.handleTechAbort_ = function() {
              this.trigger("abort")
            }
            ,
            e.prototype.handleTechEmptied_ = function() {
              this.trigger("emptied")
            }
            ,
            e.prototype.handleTechStalled_ = function() {
              this.trigger("stalled")
            }
            ,
            e.prototype.handleTechLoadedMetaData_ = function() {
              this.trigger("loadedmetadata")
            }
            ,
            e.prototype.handleTechTextData_ = function() {
              var t = null;
              arguments.length > 1 && (t = arguments[1]),
                  this.trigger("textdata", t)
            }
            ,
            e.prototype.handleTechLoadedData_ = function() {
              this.trigger("loadeddata")
            }
            ,
            e.prototype.handleTechSegmentLoadError_ = function(t) {
              this.trigger("segmentloaderror", t.data)
            }
            ,
            e.prototype.handleTechSegmentLoadSuccess_ = function(t) {
              this.trigger("segmentloadsuccess", t.data)
            }
            ,
            e.prototype.handleTechTimeUpdate_ = function() {
              this.options_.playerOptions.canSeek_ || this.techGet_("seeking") || (this.cache_.supposedCurrentTime = this.techGet_("currentTime")),
                  this.trigger("timeupdate")
            }
            ,
            e.prototype.handleTechRateChange_ = function() {
              this.trigger("ratechange")
            }
            ,
            e.prototype.handleTechVolumeChange_ = function() {
              this.trigger("volumechange")
            }
            ,
            e.prototype.handleTechTextTrackChange_ = function() {
              this.trigger("texttrackchange")
            }
            ,
            e.prototype.getCache = function() {
              return this.cache_
            }
            ,
            e.prototype.techCall_ = function(t, e) {
              if (this.tech_ && !this.tech_.isReady_)
                this.tech_.ready(function() {
                  this[t](e)
                }, !0);
              else
                try {
                  this.tech_ && this.tech_[t](e)
                } catch (n) {
                  throw E["default"](n),
                      n
                }
            }
            ,
            e.prototype.techGet_ = function(t) {
              if (this.tech_ && this.tech_.isReady_)
                try {
                  return this.tech_[t]()
                } catch (e) {
                  throw void 0 === this.tech_[t] ? E["default"]("Video.js: " + t + " method not defined for " + this.techName_ + " playback technology.", e) : "TypeError" === e.name ? (E["default"]("Video.js: " + t + " unavailable on " + this.techName_ + " playback technology element.", e),
                      this.tech_.isReady_ = !1) : E["default"](e),
                      e
                }
            }
            ,
            e.prototype.play = function() {
              return this.src() || this.currentSrc() ? this.techCall_("play") : this.tech_.one("loadstart", function() {
                this.play()
              }),
                  this
            }
            ,
            e.prototype.pause = function() {
              return this.techCall_("pause"),
                  this
            }
            ,
            e.prototype.paused = function() {
              return this.techGet_("paused") === !1 ? !1 : !0
            }
            ,
            e.prototype.scrubbing = function(t) {
              return void 0 !== t ? (this.scrubbing_ = !!t,
                  t ? this.addClass("vjs-scrubbing") : this.removeClass("vjs-scrubbing"),
                  this) : this.scrubbing_
            }
            ,
            e.prototype.currentTime = function(t) {
              return void 0 !== t && this.options_.playerOptions.canSeek_ ? (this.techCall_("setCurrentTime", t),
                  this) : (this.cache_.currentTime = this.techGet_("currentTime") || 0,
                  this.cache_.currentTime)
            }
            ,
            e.prototype.duration = function(t) {
              return void 0 === t ? this.cache_.duration || 0 : (t = parseFloat(t) || 0,
              0 > t && (t = 1 / 0),
              t !== this.cache_.duration && (this.cache_.duration = t,
                  1 / 0 === t ? this.addClass("vjs-live") : this.removeClass("vjs-live"),
                  this.trigger("durationchange")),
                  this)
            }
            ,
            e.prototype.remainingTime = function() {
              return this.duration() - this.currentTime()
            }
            ,
            e.prototype.buffered = function n() {
              var n = this.techGet_("buffered");
              return n && n.length || (n = S.createTimeRange(0, 0)),
                  n
            }
            ,
            e.prototype.bufferedPercent = function() {
              return x.bufferedPercent(this.buffered(), this.duration())
            }
            ,
            e.prototype.bufferedEnd = function() {
              var t = this.buffered()
                  , e = this.duration()
                  , n = t.end(t.length - 1);
              return n > e && (n = e),
                  n
            }
            ,
            e.prototype.volume = function(t) {
              var e = void 0;
              return void 0 !== t ? (e = Math.max(0, Math.min(1, parseFloat(t))),
                  this.cache_.volume = e,
                  this.techCall_("setVolume", e),
                  this) : (e = parseFloat(this.techGet_("volume")),
                  isNaN(e) ? 1 : e)
            }
            ,
            e.prototype.muted = function(t) {
              return void 0 !== t ? (this.techCall_("setMuted", t),
                  this) : this.techGet_("muted") || !1
            }
            ,
            e.prototype.supportsFullScreen = function() {
              return this.techGet_("supportsFullScreen") || !1
            }
            ,
            e.prototype.isFullscreen = function(t) {
              return void 0 !== t ? (this.isFullscreen_ = !!t,
                  this) : !!this.isFullscreen_
            }
            ,
            e.prototype.requestFullscreen = function() {
              var t = I["default"];
              return this.isFullscreen(!0),
                  t.requestFullscreen ? (y.on(p["default"], t.fullscreenchange, b.bind(this, function e() {
                    this.isFullscreen(p["default"][t.fullscreenElement]),
                    this.isFullscreen() === !1 && y.off(p["default"], t.fullscreenchange, e),
                        this.trigger("fullscreenchange")
                  })),
                      this.el_[t.requestFullscreen]()) : this.tech_.supportsFullScreen() ? this.techCall_("enterFullScreen") : (this.enterFullWindow(),
                      this.trigger("fullscreenchange")),
                  this
            }
            ,
            e.prototype.exitFullscreen = function() {
              var t = I["default"];
              return this.isFullscreen(!1),
                  t.requestFullscreen ? p["default"][t.exitFullscreen]() : this.tech_.supportsFullScreen() ? this.techCall_("exitFullScreen") : (this.exitFullWindow(),
                      this.trigger("fullscreenchange")),
                  this
            }
            ,
            e.prototype.enterFullWindow = function() {
              this.isFullWindow = !0,
                  this.docOrigOverflow = p["default"].documentElement.style.overflow,
                  y.on(p["default"], "keydown", b.bind(this, this.fullWindowOnEscKey)),
                  p["default"].documentElement.style.overflow = "hidden",
                  g.addElClass(p["default"].body, "vjs-full-window"),
                  this.trigger("enterFullWindow")
            }
            ,
            e.prototype.fullWindowOnEscKey = function(t) {
              27 === t.keyCode && (this.isFullscreen() === !0 ? this.exitFullscreen() : this.exitFullWindow())
            }
            ,
            e.prototype.exitFullWindow = function() {
              this.isFullWindow = !1,
                  y.off(p["default"], "keydown", this.fullWindowOnEscKey),
                  p["default"].documentElement.style.overflow = this.docOrigOverflow,
                  g.removeElClass(p["default"].body, "vjs-full-window"),
                  this.trigger("exitFullWindow")
            }
            ,
            e.prototype.canPlayType = function(t) {
              for (var e = void 0, n = 0, o = this.options_.techOrder; n < o.length; n++) {
                var r = O["default"](o[n])
                    , i = X["default"].getTech(r);
                if (i || (i = u["default"].getComponent(r)),
                    i) {
                  if (i.isSupported() && (e = i.canPlayType(t)))
                    return e
                } else
                  E["default"].error('The "' + r + '" tech is undefined. Skipped browser support check for that tech.')
              }
              return ""
            }
            ,
            e.prototype.selectSource = function(t) {
              var e = this
                  , n = this.options_.techOrder.map(O["default"]).map(function(t) {
                return [t, X["default"].getTech(t) || u["default"].getComponent(t)]
              }).filter(function(t) {
                var e = t[0]
                    , n = t[1];
                return n ? n.isSupported() : (E["default"].error('The "' + e + '" tech is undefined. Skipped browser support check for that tech.'),
                    !1)
              })
                  , o = function(t, e, n) {
                var o = void 0;
                return t.some(function(t) {
                  return e.some(function(e) {
                    return o = n(t, e),
                        o ? !0 : void 0
                  })
                }),
                    o
              }
                  , r = void 0
                  , i = function(t) {
                return function(e, n) {
                  return t(n, e)
                }
              }
                  , s = function(t, n) {
                var o = t[0]
                    , r = t[1];
                return r.canPlaySource(n, e.options_[o.toLowerCase()]) ? {
                  source: n,
                  tech: o
                } : void 0
              };
              return r = this.options_.sourceOrder ? o(t, n, i(s)) : o(n, t, s),
              r || !1
            }
            ,
            e.prototype.src = function(t) {
              if (void 0 === t)
                return this.techGet_("src");
              var e = X["default"].getTech(this.techName_);
              return e || (e = u["default"].getComponent(this.techName_)),
                  Array.isArray(t) ? this.sourceList_(t) : "string" == typeof t ? this.src({
                    src: t
                  }) : t instanceof Object && (t.type && !e.canPlaySource(t, this.options_[this.techName_.toLowerCase()]) ? this.sourceList_([t]) : (this.cache_.src = t.src,
                      this.currentType_ = t.type || "",
                      this.ready(function() {
                        e.prototype.hasOwnProperty("setSource") ? this.techCall_("setSource", t) : this.techCall_("src", t.src),
                        "auto" === this.options_.preload && this.load(),
                        this.options_.autoplay && this.play()
                      }, !0))),
                  this
            }
            ,
            e.prototype.sourceList_ = function(t) {
              var e = this.selectSource(t);
              e ? e.tech === this.techName_ ? this.src(e.source) : this.loadTech_(e.tech, e.source) : (this.setTimeout(function() {
                this.error({
                  code: 4,
                  message: this.localize(this.options_.notSupportedMessage)
                })
              }, 0),
                  this.triggerReady())
            }
            ,
            e.prototype.load = function() {
              return this.techCall_("load"),
                  this
            }
            ,
            e.prototype.reset = function() {
              return this.loadTech_(O["default"](this.options_.techOrder[0]), null),
                  this.techCall_("reset"),
                  this
            }
            ,
            e.prototype.currentSrc = function() {
              return this.techGet_("currentSrc") || this.cache_.src || ""
            }
            ,
            e.prototype.currentType = function() {
              return this.currentType_ || ""
            }
            ,
            e.prototype.preload = function(t) {
              return void 0 !== t ? (this.techCall_("setPreload", t),
                  this.options_.preload = t,
                  this) : this.techGet_("preload")
            }
            ,
            e.prototype.autoplay = function(t) {
              return void 0 !== t ? (this.techCall_("setAutoplay", t),
                  this.options_.autoplay = t,
                  this) : this.techGet_("autoplay", t)
            }
            ,
            e.prototype.loop = function(t) {
              return void 0 !== t ? (this.techCall_("setLoop", t),
                  this.options_.loop = t,
                  this) : this.techGet_("loop")
            }
            ,
            e.prototype.poster = function(t) {
              return void 0 === t ? this.poster_ : (t || (t = ""),
                  this.poster_ = t,
                  this.techCall_("setPoster", t),
                  this.trigger("posterchange"),
                  this)
            }
            ,
            e.prototype.handleTechPosterChange_ = function() {
              !this.poster_ && this.tech_ && this.tech_.poster && (this.poster_ = this.tech_.poster() || "",
                  this.trigger("posterchange"))
            }
            ,
            e.prototype.controls = function(t) {
              return void 0 !== t ? (t = !!t,
              this.controls_ !== t && (this.controls_ = t,
              this.usingNativeControls() && this.techCall_("setControls", t),
                  t ? (this.removeClass("vjs-controls-disabled"),
                      this.addClass("vjs-controls-enabled"),
                      this.trigger("controlsenabled"),
                  this.usingNativeControls() || this.addTechControlsListeners_()) : (this.removeClass("vjs-controls-enabled"),
                      this.addClass("vjs-controls-disabled"),
                      this.trigger("controlsdisabled"),
                  this.usingNativeControls() || this.removeTechControlsListeners_())),
                  this) : !!this.controls_
            }
            ,
            e.prototype.usingNativeControls = function(t) {
              return void 0 !== t ? (t = !!t,
              this.usingNativeControls_ !== t && (this.usingNativeControls_ = t,
                  t ? (this.addClass("vjs-using-native-controls"),
                      this.trigger("usingnativecontrols")) : (this.removeClass("vjs-using-native-controls"),
                      this.trigger("usingcustomcontrols"))),
                  this) : !!this.usingNativeControls_
            }
            ,
            e.prototype.error = function(t) {
              return void 0 === t ? this.error_ || null : null === t ? (this.error_ = t,
                  this.removeClass("vjs-error"),
              this.errorDisplay && this.errorDisplay.close(),
                  this) : (this.error_ = new R["default"](t),
                  this.addClass("vjs-error"),
                  E["default"].error("(CODE:" + this.error_.code + " " + R["default"].errorTypes[this.error_.code] + ")", this.error_.message, this.error_),
                  this.trigger("error"),
                  this)
            }
            ,
            e.prototype.ended = function() {
              return this.techGet_("ended")
            }
            ,
            e.prototype.seeking = function() {
              return this.techGet_("seeking")
            }
            ,
            e.prototype.seekable = function() {
              return this.techGet_("seekable")
            }
            ,
            e.prototype.canSeek = function(t) {
              return void 0 === t ? this.options_.playerOptions.canSeek_ : void (this.options_.playerOptions.canSeek_ = !!t)
            }
            ,
            e.prototype.reportUserActivity = function() {
              this.userActivity_ = !0
            }
            ,
            e.prototype.userActive = function(t) {
              if (void 0 !== t) {
                if (t = !!t,
                    this.forceActiveComponents.length)
                  for (var e = 0; e < this.forceActiveComponents.length; e++)
                    if (!this.forceActiveComponents[e].isHide()) {
                      t = !0;
                      break
                    }
                return t !== this.userActive_ && (this.userActive_ = t,
                    t ? (this.userActivity_ = !0,
                        this.removeClass("vjs-user-inactive"),
                        this.addClass("vjs-user-active"),
                        this.trigger("useractive")) : (this.userActivity_ = !1,
                    this.tech_ && this.tech_.one("mousemove", function(t) {
                      t.stopPropagation(),
                          t.preventDefault()
                    }),
                        this.removeClass("vjs-user-active"),
                        this.addClass("vjs-user-inactive"),
                        this.trigger("userinactive"))),
                    this
              }
              return this.userActive_
            }
            ,
            e.prototype.listenForUserActivity_ = function() {
              var t = void 0
                  , e = void 0
                  , n = void 0
                  , o = b.bind(this, this.reportUserActivity)
                  , r = function(t) {
                (t.screenX !== e || t.screenY !== n) && (e = t.screenX,
                    n = t.screenY,
                    o())
              }
                  , i = function() {
                o(),
                    this.clearInterval(t),
                    t = this.setInterval(o, 250)
              }
                  , s = function() {
                o(),
                    this.clearInterval(t)
              };
              this.on("mousedown", i),
                  this.on("mousemove", r),
                  this.on("mouseup", s),
                  this.on("keydown", o),
                  this.on("keyup", o);
              var a = void 0;
              this.setInterval(function() {
                if (this.userActivity_) {
                  this.userActivity_ = !1,
                      this.userActive(!0),
                      this.clearTimeout(a);
                  var t = this.options_.inactivityTimeout;
                  t > 0 && (a = this.setTimeout(function() {
                    this.userActivity_ || this.userActive(!1)
                  }, t))
                }
              }, 250)
            }
            ,
            e.prototype.playbackRate = function(t) {
              return void 0 !== t ? (this.techCall_("setPlaybackRate", t),
                  this) : this.tech_ && this.tech_.featuresPlaybackRate ? this.techGet_("playbackRate") : 1
            }
            ,
            e.prototype.isAudio = function(t) {
              return void 0 !== t ? (this.isAudio_ = !!t,
                  this) : !!this.isAudio_
            }
            ,
            e.prototype.networkState = function() {
              return this.techGet_("networkState")
            }
            ,
            e.prototype.readyState = function() {
              return this.techGet_("readyState")
            }
            ,
            e.prototype.videoTracks = function() {
              return this.tech_ ? this.tech_.videoTracks() : (this.videoTracks_ = this.videoTracks_ || new J["default"],
                  this.videoTracks_)
            }
            ,
            e.prototype.audioTracks = function() {
              return this.tech_ ? this.tech_.audioTracks() : (this.audioTracks_ = this.audioTracks_ || new K["default"],
                  this.audioTracks_)
            }
            ,
            e.prototype.textTracks = function() {
              return this.tech_ ? this.tech_.textTracks() : void 0
            }
            ,
            e.prototype.remoteTextTracks = function() {
              return this.tech_ ? this.tech_.remoteTextTracks() : void 0
            }
            ,
            e.prototype.remoteTextTrackEls = function() {
              return this.tech_ ? this.tech_.remoteTextTrackEls() : void 0
            }
            ,
            e.prototype.addTextTrack = function(t, e, n) {
              return this.tech_ ? this.tech_.addTextTrack(t, e, n) : void 0
            }
            ,
            e.prototype.addRemoteTextTrack = function(t) {
              return this.tech_ ? this.tech_.addRemoteTextTrack(V["default"](t, {
                player: this
              })) : void 0
            }
            ,
            e.prototype.removeRemoteTextTrack = function() {
              var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
                  , e = t.track
                  , n = void 0 === e ? arguments[0] : e;
              return this.tech_ ? this.tech_.removeRemoteTextTrack(n) : void 0
            }
            ,
            e.prototype.videoWidth = function() {
              return this.tech_ && this.tech_.videoWidth && this.tech_.videoWidth() || 0
            }
            ,
            e.prototype.videoHeight = function() {
              return this.tech_ && this.tech_.videoHeight && this.tech_.videoHeight() || 0
            }
            ,
            e.prototype.language = function(t) {
              return void 0 === t ? this.language_ : (this.language_ = String(t).toLowerCase(),
                  this)
            }
            ,
            e.prototype.languages = function() {
              return V["default"](e.prototype.options_.languages, this.languages_)
            }
            ,
            e.prototype.toJSON = function() {
              var t = V["default"](this.options_)
                  , e = t.tracks;
              t.tracks = [];
              for (var n = 0; n < e.length; n++) {
                var o = e[n];
                o = V["default"](o),
                    o.player = void 0,
                    t.tracks[n] = o
              }
              return t
            }
            ,
            e.prototype.createModal = function(t, e) {
              var n = this;
              e = e || {},
                  e.content = t || "";
              var o = new W["default"](this,e);
              return this.addChild(o),
                  o.on("dispose", function() {
                    n.removeChild(o)
                  }),
                  o.open()
            }
            ,
            e.getTagSettings = function(t) {
              var e = {
                sources: [],
                tracks: []
              }
                  , n = g.getElAttributes(t)
                  , o = n["data-setup"];
              if (null !== o) {
                var r = N["default"](o || "{}")
                    , i = r[0]
                    , s = r[1];
                i && E["default"].error(i),
                    B["default"](n, s)
              }
              if (B["default"](e, n),
                  t.hasChildNodes())
                for (var a = t.childNodes, l = 0, u = a.length; u > l; l++) {
                  var c = a[l]
                      , p = c.nodeName.toLowerCase();
                  "source" === p ? e.sources.push(g.getElAttributes(c)) : "track" === p && e.tracks.push(g.getElAttributes(c))
                }
              return e
            }
            ,
            e
      }(u["default"]);
      Q.players = {};
      var Z = h["default"].navigator;
      Q.prototype.options_ = {
        techOrder: ["html5", "flash"],
        html5: {},
        flash: {},
        defaultVolume: 0,
        inactivityTimeout: 2e3,
        playbackRates: [],
        children: ["mediaLoader", "posterImage", "textTrackDisplay", "loadingSpinner", "bigPlayButton", "simpleTextTrackSettings", "controlBar", "errorDisplay", "textTrackSettings"],
        language: Z && (Z.languages && Z.languages[0] || Z.userLanguage || Z.language) || "en",
        languages: {},
        notSupportedMessage: "No compatible source was found for this media.",
        canSeek_: !0
      },
          Q.prototype.handleTechLoadStart_,
          Q.prototype.handleLoadedMetaData_,
          Q.prototype.handleTextData_,
          Q.prototype.handleLoadedData_,
          Q.prototype.handleUserActive_,
          Q.prototype.handleUserInactive_,
          Q.prototype.handleTimeUpdate_,
          Q.prototype.handleTechEnded_,
          Q.prototype.handleVolumeChange_,
          Q.prototype.handleError_,
          Q.prototype.flexNotSupported_ = function() {
            var t = p["default"].createElement("i");
            return !("flexBasis"in t.style || "webkitFlexBasis"in t.style || "mozFlexBasis"in t.style || "msFlexBasis"in t.style || "msFlexOrder"in t.style)
          }
          ,
          u["default"].registerComponent("Player", Q),
          n["default"] = Q
    }
      , {
        "./big-play-button.js": 1,
        "./close-button.js": 4,
        "./component.js": 5,
        "./control-bar/control-bar.js": 8,
        "./error-display.js": 44,
        "./fullscreen-api.js": 47,
        "./loading-spinner.js": 48,
        "./media-error.js": 49,
        "./modal-dialog": 53,
        "./poster-image.js": 58,
        "./tech/flash.js": 62,
        "./tech/html5.js": 63,
        "./tech/loader.js": 64,
        "./tech/tech.js": 65,
        "./tracks/audio-track-list.js": 66,
        "./tracks/simple-text-track-settings.js": 70,
        "./tracks/text-track-display.js": 72,
        "./tracks/text-track-list-converter.js": 73,
        "./tracks/text-track-settings.js": 75,
        "./tracks/video-track-list.js": 80,
        "./utils/browser.js": 82,
        "./utils/buffer.js": 83,
        "./utils/dom.js": 84,
        "./utils/events.js": 85,
        "./utils/fn.js": 86,
        "./utils/guid.js": 88,
        "./utils/log.js": 89,
        "./utils/merge-options.js": 90,
        "./utils/stylesheet.js": 91,
        "./utils/time-ranges.js": 92,
        "./utils/to-title-case.js": 93,
        "global/document": 96,
        "global/window": 97,
        "object.assign": 140,
        "safe-json-parse/tuple": 149
      }],
    55: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      n.__esModule = !0;
      var r = t("./player.js")
          , i = o(r)
          , s = function(t, e) {
        i["default"].prototype[t] = e
      };
      n["default"] = s
    }
      , {
        "./player.js": 54
      }],
    56: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../clickable-component.js")
          , l = o(a)
          , u = t("../component.js")
          , c = o(u)
          , p = function(t) {
        function e(n) {
          var o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          r(this, e);
          var s = i(this, t.call(this, n, o));
          return s.update(),
              s
        }
        return s(e, t),
            e.prototype.update = function() {
              var t = this.createPopup();
              this.popup && this.removeChild(this.popup),
                  this.popup = t,
                  this.addChild(t),
                  this.items && 0 === this.items.length ? this.hide() : this.items && this.items.length > 1 && this.show()
            }
            ,
            e.prototype.createPopup = function() {}
            ,
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: this.buildCSSClass()
              })
            }
            ,
            e.prototype.buildCSSClass = function() {
              var e = "vjs-menu-button";
              return e += this.options_.inline === !0 ? "-inline" : "-popup",
              "vjs-menu-button " + e + " " + t.prototype.buildCSSClass.call(this)
            }
            ,
            e
      }(l["default"]);
      c["default"].registerComponent("PopupButton", p),
          n["default"] = p
    }
      , {
        "../clickable-component.js": 3,
        "../component.js": 5
      }],
    57: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../component.js")
          , u = r(l)
          , c = t("../utils/dom.js")
          , p = o(c)
          , f = t("../utils/fn.js")
          , h = o(f)
          , d = t("../utils/events.js")
          , y = o(d)
          , v = function(t) {
        function e() {
          return i(this, e),
              s(this, t.apply(this, arguments))
        }
        return a(e, t),
            e.prototype.addItem = function(t) {
              this.addChild(t),
                  t.on("click", h.bind(this, function() {
                    this.unlockShowing()
                  }))
            }
            ,
            e.prototype.createEl = function() {
              var e = this.options_.contentElType || "ul";
              this.contentEl_ = p.createEl(e, {
                className: "vjs-menu-content"
              });
              var n = t.prototype.createEl.call(this, "div", {
                append: this.contentEl_,
                className: "vjs-menu"
              });
              return n.appendChild(this.contentEl_),
                  y.on(n, "click", function(t) {
                    t.preventDefault(),
                        t.stopImmediatePropagation()
                  }),
                  n
            }
            ,
            e
      }(u["default"]);
      u["default"].registerComponent("Popup", v),
          n["default"] = v
    }
      , {
        "../component.js": 5,
        "../utils/dom.js": 84,
        "../utils/events.js": 85,
        "../utils/fn.js": 86
      }],
    58: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("./clickable-component.js")
          , u = r(l)
          , c = t("./component.js")
          , p = r(c)
          , f = t("./utils/fn.js")
          , h = o(f)
          , d = t("./utils/dom.js")
          , y = o(d)
          , v = t("./utils/browser.js")
          , g = o(v)
          , m = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.update(),
              n.on("posterchange", h.bind(r, r.update)),
              r
        }
        return a(e, t),
            e.prototype.dispose = function() {
              this.player().off("posterchange", this.update),
                  t.prototype.dispose.call(this)
            }
            ,
            e.prototype.createEl = function() {
              var t = y.createEl("div", {
                className: "vjs-poster",
                tabIndex: -1
              });
              return g.BACKGROUND_SIZE_SUPPORTED || (this.fallbackImg_ = y.createEl("img"),
                  t.appendChild(this.fallbackImg_)),
                  t
            }
            ,
            e.prototype.update = function() {
              var t = this.player().poster();
              this.setSrc(t),
                  t ? this.show() : this.hide()
            }
            ,
            e.prototype.setSrc = function(t) {
              if (this.fallbackImg_)
                this.fallbackImg_.src = t;
              else {
                var e = "";
                t && (e = 'url("' + t + '")'),
                    this.el_.style.backgroundImage = e
              }
            }
            ,
            e.prototype.handleClick = function() {
              this.player_.paused() ? this.player_.play() : this.player_.pause()
            }
            ,
            e
      }(u["default"]);
      p["default"].registerComponent("PosterImage", m),
          n["default"] = m
    }
      , {
        "./clickable-component.js": 3,
        "./component.js": 5,
        "./utils/browser.js": 82,
        "./utils/dom.js": 84,
        "./utils/fn.js": 86
      }],
    59: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function i(t, e) {
        e && (h = e),
            setTimeout(d, t)
      }
      n.__esModule = !0,
          n.hasLoaded = n.autoSetupTimeout = n.autoSetup = void 0;
      var s = t("./utils/events.js")
          , a = r(s)
          , l = t("global/document")
          , u = o(l)
          , c = t("global/window")
          , p = o(c)
          , f = !1
          , h = void 0
          , d = function() {
        var t = u["default"].getElementsByTagName("video")
            , e = u["default"].getElementsByTagName("audio")
            , n = [];
        if (t && t.length > 0)
          for (var o = 0, r = t.length; r > o; o++)
            n.push(t[o]);
        if (e && e.length > 0)
          for (var s = 0, a = e.length; a > s; s++)
            n.push(e[s]);
        if (n && n.length > 0)
          for (var l = 0, c = n.length; c > l; l++) {
            var p = n[l];
            if (!p || !p.getAttribute) {
              i(1);
              break
            }
            if (void 0 === p.player) {
              var d = p.getAttribute("data-setup");
              null !== d && h(p)
            }
          }
        else
          f || i(1)
      };
      "complete" === u["default"].readyState ? f = !0 : a.one(p["default"], "load", function() {
        f = !0
      });
      var y = function() {
        return f
      };
      n.autoSetup = d,
          n.autoSetupTimeout = i,
          n.hasLoaded = y
    }
      , {
        "./utils/events.js": 85,
        "global/document": 96,
        "global/window": 97
      }],
    60: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../component.js")
          , u = r(l)
          , c = t("../utils/dom.js")
          , p = o(c)
          , f = t("object.assign")
          , h = r(f)
          , d = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.bar = r.getChild(r.options_.barName),
              r.vertical(!!r.options_.vertical),
              r.on("mousedown", r.handleMouseDown),
              r.on("touchstart", r.handleMouseDown),
              r.on("focus", r.handleFocus),
              r.on("blur", r.handleBlur),
              r.on("click", r.handleClick),
              r.on(n, "controlsvisible", r.update),
              r.on(n, r.playerEvent, r.update),
              r
        }
        return a(e, t),
            e.prototype.createEl = function(e) {
              var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
                  , o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
              return n.className = n.className + " vjs-slider",
                  n = h["default"]({
                    tabIndex: 0
                  }, n),
                  o = h["default"]({
                    role: "slider",
                    "aria-valuenow": 0,
                    "aria-valuemin": 0,
                    "aria-valuemax": 100,
                    tabIndex: 0
                  }, o),
                  t.prototype.createEl.call(this, e, n, o)
            }
            ,
            e.prototype.handleMouseDown = function(t) {
              var e = this.bar.el_.ownerDocument;
              t.preventDefault(),
                  p.blockTextSelection(),
                  this.addClass("vjs-sliding"),
                  this.trigger("slideractive"),
                  this.on(e, "mousemove", this.handleMouseMove),
                  this.on(e, "mouseup", this.handleMouseUp),
                  this.on(e, "touchmove", this.handleMouseMove),
                  this.on(e, "touchend", this.handleMouseUp),
                  this.handleMouseMove(t)
            }
            ,
            e.prototype.handleMouseMove = function() {}
            ,
            e.prototype.handleMouseUp = function() {
              var t = this.bar.el_.ownerDocument;
              p.unblockTextSelection(),
                  this.removeClass("vjs-sliding"),
                  this.trigger("sliderinactive"),
                  this.off(t, "mousemove", this.handleMouseMove),
                  this.off(t, "mouseup", this.handleMouseUp),
                  this.off(t, "touchmove", this.handleMouseMove),
                  this.off(t, "touchend", this.handleMouseUp),
                  this.update()
            }
            ,
            e.prototype.update = function() {
              if (this.el_) {
                var t = this.getPercent()
                    , e = this.bar;
                if (e) {
                  ("number" != typeof t || t !== t || 0 > t || 1 / 0 === t) && (t = 0);
                  var n = (100 * t).toFixed(2) + "%";
                  this.vertical() ? e.el().style.height = n : e.el().style.width = n
                }
              }
            }
            ,
            e.prototype.calculateDistance = function(t) {
              var e = p.getPointerPosition(this.el_, t);
              return this.vertical() ? e.y : e.x
            }
            ,
            e.prototype.handleFocus = function() {
              this.on(this.bar.el_.ownerDocument, "keydown", this.handleKeyPress)
            }
            ,
            e.prototype.handleKeyPress = function(t) {
              37 === t.which || 40 === t.which ? (t.preventDefault(),
                  this.stepBack()) : (38 === t.which || 39 === t.which) && (t.preventDefault(),
                  this.stepForward())
            }
            ,
            e.prototype.handleBlur = function() {
              this.off(this.bar.el_.ownerDocument, "keydown", this.handleKeyPress)
            }
            ,
            e.prototype.handleClick = function(t) {
              t.stopImmediatePropagation(),
                  t.preventDefault()
            }
            ,
            e.prototype.vertical = function(t) {
              return void 0 === t ? this.vertical_ || !1 : (this.vertical_ = !!t,
                  this.addClass(this.vertical_ ? "vjs-slider-vertical" : "vjs-slider-horizontal"),
                  this)
            }
            ,
            e
      }(u["default"]);
      u["default"].registerComponent("Slider", d),
          n["default"] = d
    }
      , {
        "../component.js": 5,
        "../utils/dom.js": 84,
        "object.assign": 140
      }],
    61: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t.streamingFormats = {
          "rtmp/mp4": "MP4",
          "rtmp/flv": "FLV"
        },
            t.streamFromParts = function(t, e) {
              return t + "&" + e
            }
            ,
            t.streamToParts = function(t) {
              var e = {
                connection: "",
                stream: ""
              };
              if (!t)
                return e;
              var n = t.search(/&(?!\w+=)/)
                  , o = void 0;
              return -1 !== n ? o = n + 1 : (n = o = t.lastIndexOf("/") + 1,
              0 === n && (n = o = t.length)),
                  e.connection = t.substring(0, n),
                  e.stream = t.substring(o, t.length),
                  e
            }
            ,
            t.isStreamingType = function(e) {
              return e in t.streamingFormats
            }
            ,
            t.RTMP_RE = /^rtmp[set]?:\/\//i,
            t.isStreamingSrc = function(e) {
              return t.RTMP_RE.test(e)
            }
            ,
            t.rtmpSourceHandler = {},
            t.rtmpSourceHandler.canPlayType = function(e) {
              return t.isStreamingType(e) ? "maybe" : ""
            }
            ,
            t.rtmpSourceHandler.canHandleSource = function(e) {
              var n = t.rtmpSourceHandler.canPlayType(e.type);
              return n ? n : t.isStreamingSrc(e.src) ? "maybe" : ""
            }
            ,
            t.rtmpSourceHandler.handleSource = function(e, n) {
              var o = t.streamToParts(e.src);
              n.setRtmpConnection(o.connection),
                  n.setRtmpStream(o.stream)
            }
            ,
            t.registerSourceHandler(t.rtmpSourceHandler),
            t
      }
      n.__esModule = !0,
          n["default"] = o
    }
      , {}],
    62: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      function l(t) {
        var e = t.charAt(0).toUpperCase() + t.slice(1);
        O["set" + e] = function(e) {
          return this.el_.vjs_setProperty(t, e)
        }
      }
      function u(t) {
        O[t] = function() {
          return this.el_.vjs_getProperty(t)
        }
      }
      n.__esModule = !0;
      for (var c = t("./tech"), p = r(c), f = t("../utils/dom.js"), h = o(f), d = t("../utils/url.js"), y = o(d), v = t("../utils/time-ranges.js"), g = t("./flash-rtmp"), m = r(g), b = t("../component"), _ = r(b), j = t("global/window"), w = r(j), T = t("object.assign"), k = r(T), E = w["default"].navigator, C = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return n.source && r.ready(function() {
            this.setSource(n.source)
          }, !0),
          n.startTime && r.ready(function() {
            this.load(),
                this.play(),
                this.currentTime(n.startTime)
          }, !0),
              w["default"].videoPlayer = w["default"].videoPlayer || {},
              w["default"].videoPlayer.Flash = w["default"].videoPlayer.Flash || {},
              w["default"].videoPlayer.Flash.onReady = e.onReady,
              w["default"].videoPlayer.Flash.onEvent = e.onEvent,
              w["default"].videoPlayer.Flash.onError = e.onError,
              r.on("seeked", function() {
                this.lastSeekTarget_ = void 0
              }),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              var t = this.options_;
              if (!t.swf) {
                var n = "5.1.0";
                t.swf = "//vjs.zencdn.net/swf/" + n + "/video-js.swf"
              }
              var o = t.techId
                  , r = k["default"]({
                readyFunction: "videoPlayer.Flash.onReady",
                eventProxyFunction: "videoPlayer.Flash.onEvent",
                errorEventProxyFunction: "videoPlayer.Flash.onError",
                autoplay: t.autoplay,
                preload: t.preload,
                loop: t.loop,
                muted: t.muted
              }, t.flashVars)
                  , i = k["default"]({
                wmode: "opaque",
                bgcolor: "#000000"
              }, t.params)
                  , s = k["default"]({
                id: o,
                name: o,
                "class": "vjs-tech"
              }, t.attributes);
              return this.el_ = e.embed(t.swf, r, i, s),
                  this.el_.tech = this,
                  this.el_
            }
            ,
            e.prototype.play = function() {
              this.ended() && this.setCurrentTime(0),
                  this.el_.vjs_play()
            }
            ,
            e.prototype.pause = function() {
              this.el_.vjs_pause()
            }
            ,
            e.prototype.src = function(t) {
              return void 0 === t ? this.currentSrc() : this.setSrc(t)
            }
            ,
            e.prototype.setSrc = function(t) {
              var e = this;
              t = y.getAbsoluteURL(t),
                  this.el_.vjs_src(t),
              this.autoplay() && this.setTimeout(function() {
                return e.play()
              }, 0)
            }
            ,
            e.prototype.seeking = function() {
              return void 0 !== this.lastSeekTarget_
            }
            ,
            e.prototype.setCurrentTime = function(e) {
              var n = this.seekable();
              n.length && (e = e > n.start(0) ? e : n.start(0),
                  e = e < n.end(n.length - 1) ? e : n.end(n.length - 1),
                  this.lastSeekTarget_ = e,
                  this.trigger("seeking"),
                  this.el_.vjs_setProperty("currentTime", e),
                  t.prototype.setCurrentTime.call(this))
            }
            ,
            e.prototype.currentTime = function() {
              return this.seeking() ? this.lastSeekTarget_ || 0 : this.el_.vjs_getProperty("currentTime")
            }
            ,
            e.prototype.currentSrc = function() {
              return this.currentSource_ ? this.currentSource_.src : this.el_.vjs_getProperty("currentSrc")
            }
            ,
            e.prototype.duration = function n() {
              if (0 === this.readyState())
                return 0 / 0;
              var n = this.el_.vjs_getProperty("duration");
              return n >= 0 ? n : 1 / 0
            }
            ,
            e.prototype.load = function() {
              this.el_.vjs_load()
            }
            ,
            e.prototype.poster = function() {
              this.el_.vjs_getProperty("poster")
            }
            ,
            e.prototype.setPoster = function() {}
            ,
            e.prototype.seekable = function() {
              var t = this.duration();
              return 0 === t ? v.createTimeRange() : v.createTimeRange(0, t)
            }
            ,
            e.prototype.buffered = function() {
              var t = this.el_.vjs_getProperty("buffered");
              return 0 === t.length ? v.createTimeRange() : v.createTimeRange(t[0][0], t[0][1])
            }
            ,
            e.prototype.supportsFullScreen = function() {
              return !1
            }
            ,
            e.prototype.enterFullScreen = function() {
              return !1
            }
            ,
            e
      }(p["default"]), O = C.prototype, S = "rtmpConnection,rtmpStream,preload,defaultPlaybackRate,playbackRate,autoplay,loop,mediaGroup,controller,controls,volume,muted,defaultMuted".split(","), x = "networkState,readyState,initialTime,startOffsetTime,paused,ended,videoWidth,videoHeight".split(","), P = 0; P < S.length; P++)
        u(S[P]),
            l(S[P]);
      for (var M = 0; M < x.length; M++)
        u(x[M]);
      C.isSupported = function() {
        return C.version()[0] >= 10
      }
          ,
          p["default"].withSourceHandlers(C),
          C.nativeSourceHandler = {},
          C.nativeSourceHandler.canPlayType = function(t) {
            return t in C.formats ? "maybe" : ""
          }
          ,
          C.nativeSourceHandler.canHandleSource = function(t) {
            function e(t) {
              var e = y.getFileExtension(t);
              return e ? "video/" + e : ""
            }
            var n = void 0;
            return n = t.type ? t.type.replace(/;.*/, "").toLowerCase() : e(t.src),
                C.nativeSourceHandler.canPlayType(n)
          }
          ,
          C.nativeSourceHandler.handleSource = function(t, e) {
            e.setSrc(t.src)
          }
          ,
          C.nativeSourceHandler.dispose = function() {}
          ,
          C.registerSourceHandler(C.nativeSourceHandler),
          C.formats = {
            "video/flv": "FLV",
            "video/x-flv": "FLV",
            "video/mp4": "MP4",
            "video/m4v": "MP4"
          },
          C.onReady = function(t) {
            var e = h.getEl(t)
                , n = e && e.tech;
            n && n.el() && C.checkReady(n)
          }
          ,
          C.checkReady = function(t) {
            t.el() && (t.el().vjs_getProperty ? t.triggerReady() : this.setTimeout(function() {
              C.checkReady(t)
            }, 50))
          }
          ,
          C.onEvent = function(t, e) {
            var n = h.getEl(t).tech;
            n.trigger(e, Array.prototype.slice.call(arguments, 2))
          }
          ,
          C.onError = function(t, e) {
            var n = h.getEl(t).tech;
            return "srcnotfound" === e ? n.error(4) : void n.error("FLASH: " + e)
          }
          ,
          C.version = function() {
            var t = "0,0,0";
            try {
              t = new w["default"].ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version").replace(/\D+/g, ",").match(/^,?(.+),?$/)[1]
            } catch (e) {
              try {
                E.mimeTypes["application/x-shockwave-flash"].enabledPlugin && (t = (E.plugins["Shockwave Flash 2.0"] || E.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1])
              } catch (n) {}
            }
            return t.split(",")
          }
          ,
          C.embed = function(t, e, n, o) {
            var r = C.getEmbedCode(t, e, n, o)
                , i = h.createEl("div", {
              innerHTML: r
            }).childNodes[0];
            return i
          }
          ,
          C.getEmbedCode = function(t, e, n, o) {
            var r = '<object type="application/x-shockwave-flash" '
                , i = ""
                , s = ""
                , a = "";
            return e && Object.getOwnPropertyNames(e).forEach(function(t) {
              i += t + "=" + e[t] + "&amp;"
            }),
                n = k["default"]({
                  movie: t,
                  flashvars: i,
                  allowScriptAccess: "always",
                  allowNetworking: "all"
                }, n),
                Object.getOwnPropertyNames(n).forEach(function(t) {
                  s += '<param name="' + t + '" value="' + n[t] + '" />'
                }),
                o = k["default"]({
                  data: t,
                  width: "100%",
                  height: "100%"
                }, o),
                Object.getOwnPropertyNames(o).forEach(function(t) {
                  a += t + '="' + o[t] + '" '
                }),
            "" + r + a + ">" + s + "</object>"
          }
          ,
          m["default"](C),
          _["default"].registerComponent("Flash", C),
          p["default"].registerTech("Flash", C),
          n["default"] = C
    }
      , {
        "../component": 5,
        "../utils/dom.js": 84,
        "../utils/time-ranges.js": 92,
        "../utils/url.js": 94,
        "./flash-rtmp": 61,
        "./tech": 65,
        "global/window": 97,
        "object.assign": 140
      }],
    63: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        return t.raw = e,
            t
      }
      function s(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function a(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function l(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var u = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
          }
          : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
          }
          , c = i(["Text Tracks are being loaded from another origin but the crossorigin attribute isn't used.\n            This may prevent text tracks from loading."], ["Text Tracks are being loaded from another origin but the crossorigin attribute isn't used.\n            This may prevent text tracks from loading."])
          , p = t("./tech.js")
          , f = r(p)
          , h = t("../component")
          , d = r(h)
          , y = t("../utils/dom.js")
          , v = o(y)
          , g = t("../utils/url.js")
          , m = o(g)
          , b = t("../utils/fn.js")
          , _ = o(b)
          , j = t("../utils/log.js")
          , w = r(j)
          , T = t("tsml")
          , k = r(T)
          , E = t("../utils/browser.js")
          , C = o(E)
          , O = t("global/document")
          , S = r(O)
          , x = t("global/window")
          , P = r(x)
          , M = t("object.assign")
          , A = r(M)
          , I = t("../utils/merge-options.js")
          , D = r(I)
          , R = t("../utils/to-title-case.js")
          , L = r(R)
          , N = function(t) {
        function e(n, o) {
          s(this, e);
          var r = a(this, t.call(this, n, o))
              , i = n.source
              , l = !1;
          if (i && (r.el_.currentSrc !== i.src || n.tag && 3 === n.tag.initNetworkState_) ? r.setSource(i) : r.handleLateInit_(r.el_),
              r.el_.hasChildNodes()) {
            for (var u = r.el_.childNodes, p = u.length, f = []; p--; ) {
              var h = u[p]
                  , d = h.nodeName.toLowerCase();
              "track" === d && (r.featuresNativeTextTracks ? (r.remoteTextTrackEls().addTrackElement_(h),
                  r.remoteTextTracks().addTrack_(h.track),
              l || r.el_.hasAttribute("crossorigin") || !m.isCrossOrigin(h.src) || (l = !0)) : f.push(h))
            }
            for (var y = 0; y < f.length; y++)
              r.el_.removeChild(f[y])
          }
          var v = ["audio", "video"];
          return v.forEach(function(t) {
            var e = L["default"](t);
            if (r["featuresNative" + e + "Tracks"]) {
              var n = r.el()[t + "Tracks"];
              n && n.addEventListener && (n.addEventListener("change", _.bind(r, r["handle" + e + "TrackChange_"])),
                  n.addEventListener("addtrack", _.bind(r, r["handle" + e + "TrackAdd_"])),
                  n.addEventListener("removetrack", _.bind(r, r["handle" + e + "TrackRemove_"])),
                  r.on("loadstart", r["removeOld" + e + "Tracks_"]))
            }
          }),
          r.featuresNativeTextTracks && (l && w["default"].warn(k["default"](c)),
              r.handleTextTrackChange_ = _.bind(r, r.handleTextTrackChange),
              r.handleTextTrackAdd_ = _.bind(r, r.handleTextTrackAdd),
              r.handleTextTrackRemove_ = _.bind(r, r.handleTextTrackRemove),
              r.proxyNativeTextTracks_()),
          (C.TOUCH_ENABLED || C.IS_IPHONE || C.IS_NATIVE_ANDROID) && n.nativeControlsForTouch === !0 && r.setControls(!0),
              r.triggerReady(),
              r
        }
        return l(e, t),
            e.prototype.dispose = function() {
              var n = this;
              ["audio", "video", "text"].forEach(function(t) {
                var e = L["default"](t)
                    , o = n.el_[t + "Tracks"];
                o && o.removeEventListener && (o.removeEventListener("change", n["handle" + e + "TrackChange_"]),
                    o.removeEventListener("addtrack", n["handle" + e + "TrackAdd_"]),
                    o.removeEventListener("removetrack", n["handle" + e + "TrackRemove_"])),
                o && n.off("loadstart", n["removeOld" + e + "Tracks_"])
              }),
                  e.disposeMediaElement(this.el_),
                  t.prototype.dispose.call(this)
            }
            ,
            e.prototype.createEl = function() {
              var t = this.options_.tag;
              if (!t || this.movingMediaElementInDOM === !1)
                if (t) {
                  var n = t.cloneNode(!0);
                  t.parentNode.insertBefore(n, t),
                      e.disposeMediaElement(t),
                      t = n
                } else {
                  t = S["default"].createElement("video");
                  var o = this.options_.tag && v.getElAttributes(this.options_.tag)
                      , r = D["default"]({}, o);
                  C.TOUCH_ENABLED && this.options_.nativeControlsForTouch === !0 || delete r.controls,
                      v.setElAttributes(t, A["default"](r, {
                        id: this.options_.techId,
                        "class": "vjs-tech"
                      }))
                }
              for (var i = ["autoplay", "preload", "loop", "muted"], s = i.length - 1; s >= 0; s--) {
                var a = i[s]
                    , l = {};
                "undefined" != typeof this.options_[a] && (l[a] = this.options_[a]),
                    v.setElAttributes(t, l)
              }
              return t
            }
            ,
            e.prototype.handleLateInit_ = function(t) {
              var e = this;
              if (0 !== t.networkState && 3 !== t.networkState) {
                if (0 === t.readyState) {
                  var n = function() {
                    var t = !1
                        , n = function() {
                      t = !0
                    };
                    e.on("loadstart", n);
                    var o = function() {
                      t || this.trigger("loadstart")
                    };
                    return e.on("loadedmetadata", o),
                        e.ready(function() {
                          this.off("loadstart", n),
                              this.off("loadedmetadata", o),
                          t || this.trigger("loadstart")
                        }),
                        {
                          v: void 0
                        }
                  }();
                  if ("object" === ("undefined" == typeof n ? "undefined" : u(n)))
                    return n.v
                }
                var o = ["loadstart"];
                o.push("loadedmetadata"),
                t.readyState >= 2 && o.push("loadeddata"),
                t.readyState >= 3 && o.push("canplay"),
                t.readyState >= 4 && o.push("canplaythrough"),
                    this.ready(function() {
                      o.forEach(function(t) {
                        this.trigger(t)
                      }, this)
                    })
              }
            }
            ,
            e.prototype.proxyNativeTextTracks_ = function() {
              var t = this.el().textTracks;
              if (t) {
                for (var e = 0; e < t.length; e++)
                  this.textTracks().addTrack_(t[e]);
                t.addEventListener && (t.addEventListener("change", this.handleTextTrackChange_),
                    t.addEventListener("addtrack", this.handleTextTrackAdd_),
                    t.addEventListener("removetrack", this.handleTextTrackRemove_)),
                    this.on("loadstart", this.removeOldTextTracks_)
              }
            }
            ,
            e.prototype.handleTextTrackChange = function() {
              var t = this.textTracks();
              this.textTracks().trigger({
                type: "change",
                target: t,
                currentTarget: t,
                srcElement: t
              })
            }
            ,
            e.prototype.handleTextTrackAdd = function(t) {
              this.textTracks().addTrack_(t.track)
            }
            ,
            e.prototype.handleTextTrackRemove = function(t) {
              this.textTracks().removeTrack_(t.track)
            }
            ,
            e.prototype.handleVideoTrackChange_ = function() {
              var t = this.videoTracks();
              this.videoTracks().trigger({
                type: "change",
                target: t,
                currentTarget: t,
                srcElement: t
              })
            }
            ,
            e.prototype.handleVideoTrackAdd_ = function(t) {
              this.videoTracks().addTrack_(t.track)
            }
            ,
            e.prototype.handleVideoTrackRemove_ = function(t) {
              this.videoTracks().removeTrack_(t.track)
            }
            ,
            e.prototype.handleAudioTrackChange_ = function() {
              var t = this.audioTracks();
              this.audioTracks().trigger({
                type: "change",
                target: t,
                currentTarget: t,
                srcElement: t
              })
            }
            ,
            e.prototype.handleAudioTrackAdd_ = function(t) {
              this.audioTracks().addTrack_(t.track)
            }
            ,
            e.prototype.handleAudioTrackRemove_ = function(t) {
              this.audioTracks().removeTrack_(t.track)
            }
            ,
            e.prototype.removeOldTracks_ = function(t, e) {
              var n = [];
              if (e) {
                for (var o = 0; o < t.length; o++) {
                  for (var r = t[o], i = !1, s = 0; s < e.length; s++)
                    if (e[s] === r) {
                      i = !0;
                      break
                    }
                  i || n.push(r)
                }
                for (var a = 0; a < n.length; a++) {
                  var l = n[a];
                  t.removeTrack_(l)
                }
              }
            }
            ,
            e.prototype.removeOldTextTracks_ = function() {
              var t = this.textTracks()
                  , e = this.el().textTracks;
              this.removeOldTracks_(t, e)
            }
            ,
            e.prototype.removeOldAudioTracks_ = function() {
              var t = this.audioTracks()
                  , e = this.el().audioTracks;
              this.removeOldTracks_(t, e)
            }
            ,
            e.prototype.removeOldVideoTracks_ = function() {
              var t = this.videoTracks()
                  , e = this.el().videoTracks;
              this.removeOldTracks_(t, e)
            }
            ,
            e.prototype.play = function() {
              var t = this.el_.play();
              void 0 !== t && "function" == typeof t.then && t.then(null, function() {})
            }
            ,
            e.prototype.pause = function() {
              this.el_.pause()
            }
            ,
            e.prototype.paused = function() {
              return this.el_.paused
            }
            ,
            e.prototype.currentTime = function() {
              return this.el_.currentTime
            }
            ,
            e.prototype.setCurrentTime = function(t) {
              var e = this;
              try {
                e.el_.currentTime = t,
                    setTimeout(function() {
                      e.el_.currentTime = t
                    }, 0)
              } catch (n) {
                w["default"](n, "Video is not ready. (Video.js)")
              }
            }
            ,
            e.prototype.duration = function() {
              return this.el_.duration || 0
            }
            ,
            e.prototype.buffered = function() {
              return this.el_.buffered
            }
            ,
            e.prototype.volume = function() {
              return this.el_.volume
            }
            ,
            e.prototype.setVolume = function(t) {
              this.el_.volume = t
            }
            ,
            e.prototype.muted = function() {
              return this.el_.muted
            }
            ,
            e.prototype.setMuted = function(t) {
              this.el_.muted = t
            }
            ,
            e.prototype.width = function() {
              return this.el_.offsetWidth
            }
            ,
            e.prototype.height = function() {
              return this.el_.offsetHeight
            }
            ,
            e.prototype.supportsFullScreen = function() {
              if ("function" == typeof this.el_.webkitEnterFullScreen) {
                var t = P["default"].navigator && P["default"].navigator.userAgent || "";
                if (/Android/.test(t) || !/Chrome|Mac OS X 10.5/.test(t))
                  return !0
              }
              return !1
            }
            ,
            e.prototype.enterFullScreen = function() {
              var t = this.el_;
              "webkitDisplayingFullscreen"in t && this.one("webkitbeginfullscreen", function() {
                this.one("webkitendfullscreen", function() {
                  this.trigger("fullscreenchange", {
                    isFullscreen: !1
                  })
                }),
                    this.trigger("fullscreenchange", {
                      isFullscreen: !0
                    })
              }),
                  t.paused && t.networkState <= t.HAVE_METADATA ? (this.el_.play(),
                      this.setTimeout(function() {
                        t.pause(),
                            t.webkitEnterFullScreen()
                      }, 0)) : t.webkitEnterFullScreen()
            }
            ,
            e.prototype.exitFullScreen = function() {
              this.el_.webkitExitFullScreen()
            }
            ,
            e.prototype.src = function(t) {
              return void 0 === t ? this.el_.src : void this.setSrc(t)
            }
            ,
            e.prototype.setSrc = function(t) {
              this.el_.src = t
            }
            ,
            e.prototype.load = function() {
              this.el_.load()
            }
            ,
            e.prototype.reset = function() {
              e.resetMediaElement(this.el_)
            }
            ,
            e.prototype.currentSrc = function() {
              return this.currentSource_ ? this.currentSource_.src : this.el_.currentSrc
            }
            ,
            e.prototype.poster = function() {
              return this.el_.poster
            }
            ,
            e.prototype.setPoster = function(t) {
              this.el_.poster = t
            }
            ,
            e.prototype.preload = function() {
              return this.el_.preload
            }
            ,
            e.prototype.setPreload = function(t) {
              this.el_.preload = t
            }
            ,
            e.prototype.autoplay = function() {
              return this.el_.autoplay
            }
            ,
            e.prototype.setAutoplay = function(t) {
              this.el_.autoplay = t
            }
            ,
            e.prototype.controls = function() {
              return this.el_.controls
            }
            ,
            e.prototype.setControls = function(t) {
              this.el_.controls = !!t
            }
            ,
            e.prototype.loop = function() {
              return this.el_.loop
            }
            ,
            e.prototype.setLoop = function(t) {
              this.el_.loop = t
            }
            ,
            e.prototype.error = function() {
              return this.el_.error
            }
            ,
            e.prototype.seeking = function() {
              return this.el_.seeking
            }
            ,
            e.prototype.seekable = function() {
              return this.el_.seekable
            }
            ,
            e.prototype.ended = function() {
              return this.el_.ended
            }
            ,
            e.prototype.defaultMuted = function() {
              return this.el_.defaultMuted
            }
            ,
            e.prototype.playbackRate = function() {
              return this.el_.playbackRate
            }
            ,
            e.prototype.played = function() {
              return this.el_.played
            }
            ,
            e.prototype.setPlaybackRate = function(t) {
              this.el_.playbackRate = t
            }
            ,
            e.prototype.networkState = function() {
              return this.el_.networkState
            }
            ,
            e.prototype.readyState = function() {
              return this.el_.readyState
            }
            ,
            e.prototype.videoWidth = function() {
              return this.el_.videoWidth
            }
            ,
            e.prototype.videoHeight = function() {
              return this.el_.videoHeight
            }
            ,
            e.prototype.textTracks = function() {
              return t.prototype.textTracks.call(this)
            }
            ,
            e.prototype.addTextTrack = function(e, n, o) {
              return this.featuresNativeTextTracks ? this.el_.addTextTrack(e, n, o) : t.prototype.addTextTrack.call(this, e, n, o)
            }
            ,
            e.prototype.addRemoteTextTrack = function() {
              var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
              if (!this.featuresNativeTextTracks)
                return t.prototype.addRemoteTextTrack.call(this, e);
              var n = S["default"].createElement("track");
              return e.kind && (n.kind = e.kind),
              e.label && (n.label = e.label),
              (e.language || e.srclang) && (n.srclang = e.language || e.srclang),
              e["default"] && (n["default"] = e["default"]),
              e.id && (n.id = e.id),
              e.src && (n.src = e.src),
                  this.el().appendChild(n),
                  this.remoteTextTrackEls().addTrackElement_(n),
                  this.remoteTextTracks().addTrack_(n.track),
                  n
            }
            ,
            e.prototype.removeRemoteTextTrack = function(e) {
              if (!this.featuresNativeTextTracks)
                return t.prototype.removeRemoteTextTrack.call(this, e);
              var n = this.remoteTextTrackEls().getTrackElementByTrack_(e);
              this.remoteTextTrackEls().removeTrackElement_(n),
                  this.remoteTextTracks().removeTrack_(e);
              for (var o = this.$$("track"), r = o.length; r--; )
                (e === o[r] || e === o[r].track) && this.el().removeChild(o[r])
            }
            ,
            e
      }(f["default"]);
      N.TEST_VID = S["default"].createElement("video");
      var F = S["default"].createElement("track");
      F.kind = "captions",
          F.srclang = "en",
          F.label = "English",
          N.TEST_VID.appendChild(F),
          N.isSupported = function() {
            try {
              N.TEST_VID.volume = .5
            } catch (t) {
              return !1
            }
            return !!N.TEST_VID.canPlayType
          }
          ,
          f["default"].withSourceHandlers(N),
          N.nativeSourceHandler = {},
          N.nativeSourceHandler.canPlayType = function(t) {
            try {
              return N.TEST_VID.canPlayType(t)
            } catch (e) {
              return ""
            }
          }
          ,
          N.nativeSourceHandler.canHandleSource = function(t) {
            if (t.type)
              return N.nativeSourceHandler.canPlayType(t.type);
            if (t.src) {
              var e = m.getFileExtension(t.src);
              return N.nativeSourceHandler.canPlayType("video/" + e)
            }
            return ""
          }
          ,
          N.nativeSourceHandler.handleSource = function(t, e) {
            e.setSrc(t.src)
          }
          ,
          N.nativeSourceHandler.dispose = function() {}
          ,
          N.registerSourceHandler(N.nativeSourceHandler),
          N.canControlVolume = function() {
            try {
              var t = N.TEST_VID.volume;
              return N.TEST_VID.volume = t / 2 + .1,
              t !== N.TEST_VID.volume
            } catch (e) {
              return !1
            }
          }
          ,
          N.canControlPlaybackRate = function() {
            if (C.IS_ANDROID && C.IS_CHROME)
              return !1;
            try {
              var t = N.TEST_VID.playbackRate;
              return N.TEST_VID.playbackRate = t / 2 + .1,
              t !== N.TEST_VID.playbackRate
            } catch (e) {
              return !1
            }
          }
          ,
          N.supportsNativeTextTracks = function() {
            var t = void 0;
            return t = !!N.TEST_VID.textTracks,
            t && N.TEST_VID.textTracks.length > 0 && (t = "number" != typeof N.TEST_VID.textTracks[0].mode),
            t && C.IS_FIREFOX && (t = !1),
            !t || "onremovetrack"in N.TEST_VID.textTracks || (t = !1),
                t = !1
          }
          ,
          N.supportsNativeVideoTracks = function() {
            var t = !!N.TEST_VID.videoTracks;
            return t
          }
          ,
          N.supportsNativeAudioTracks = function() {
            var t = !!N.TEST_VID.audioTracks;
            return t
          }
          ,
          N.Events = ["loadstart", "suspend", "abort", "error", "emptied", "stalled", "loadedmetadata", "loadeddata", "canplay", "canplaythrough", "playing", "waiting", "seeking", "seeked", "ended", "durationchange", "timeupdate", "progress", "play", "pause", "ratechange", "volumechange"],
          N.prototype.featuresVolumeControl = N.canControlVolume(),
          N.prototype.featuresPlaybackRate = N.canControlPlaybackRate(),
          N.prototype.movingMediaElementInDOM = !C.IS_IOS,
          N.prototype.featuresFullscreenResize = !0,
          N.prototype.featuresProgressEvents = !0,
          N.prototype.featuresNativeTextTracks = N.supportsNativeTextTracks(),
          N.prototype.featuresNativeVideoTracks = N.supportsNativeVideoTracks(),
          N.prototype.featuresNativeAudioTracks = N.supportsNativeAudioTracks();
      var B = void 0
          , H = /^application\/(?:x-|vnd\.apple\.)mpegurl/i
          , V = /^video\/mp4/i;
      N.patchCanPlayType = function() {
        C.ANDROID_VERSION >= 4 && (B || (B = N.TEST_VID.constructor.prototype.canPlayType),
                N.TEST_VID.constructor.prototype.canPlayType = function(t) {
                  return t && H.test(t) ? "maybe" : B.call(this, t)
                }
        ),
        C.IS_OLD_ANDROID && (B || (B = N.TEST_VID.constructor.prototype.canPlayType),
                N.TEST_VID.constructor.prototype.canPlayType = function(t) {
                  return t && V.test(t) ? "maybe" : B.call(this, t)
                }
        )
      }
          ,
          N.unpatchCanPlayType = function() {
            var t = N.TEST_VID.constructor.prototype.canPlayType;
            return N.TEST_VID.constructor.prototype.canPlayType = B,
                B = null,
                t
          }
          ,
          N.patchCanPlayType(),
          N.disposeMediaElement = function(t) {
            if (t) {
              for (t.parentNode && t.parentNode.removeChild(t); t.hasChildNodes(); )
                t.removeChild(t.firstChild);
              t.removeAttribute("src"),
              "function" == typeof t.load && !function() {
                try {
                  t.load()
                } catch (e) {}
              }()
            }
          }
          ,
          N.resetMediaElement = function(t) {
            if (t) {
              for (var e = t.querySelectorAll("source"), n = e.length; n--; )
                t.removeChild(e[n]);
              t.removeAttribute("src"),
              "function" == typeof t.load && !function() {
                try {
                  t.load()
                } catch (e) {}
              }()
            }
          }
          ,
          d["default"].registerComponent("Html5", N),
          f["default"].registerTech("Html5", N),
          n["default"] = N
    }
      , {
        "../component": 5,
        "../utils/browser.js": 82,
        "../utils/dom.js": 84,
        "../utils/fn.js": 86,
        "../utils/log.js": 89,
        "../utils/merge-options.js": 90,
        "../utils/to-title-case.js": 93,
        "../utils/url.js": 94,
        "./tech.js": 65,
        "global/document": 96,
        "global/window": 97,
        "object.assign": 140,
        tsml: 150
      }],
    64: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function i(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function s(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var a = t("../component.js")
          , l = o(a)
          , u = t("./tech.js")
          , c = o(u)
          , p = t("../utils/to-title-case.js")
          , f = o(p)
          , h = function(t) {
        function e(n, o, s) {
          r(this, e);
          var a = i(this, t.call(this, n, o, s));
          if (o.playerOptions.sources && 0 !== o.playerOptions.sources.length)
            n.src(o.playerOptions.sources);
          else
            for (var u = 0, p = o.playerOptions.techOrder; u < p.length; u++) {
              var h = f["default"](p[u])
                  , d = c["default"].getTech(h);
              if (h || (d = l["default"].getComponent(h)),
              d && d.isSupported()) {
                n.loadTech_(h);
                break
              }
            }
          return a
        }
        return s(e, t),
            e
      }(l["default"]);
      l["default"].registerComponent("MediaLoader", h),
          n["default"] = h
    }
      , {
        "../component.js": 5,
        "../utils/to-title-case.js": 93,
        "./tech.js": 65
      }],
    65: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      function l(t, e, n, o) {
        var r = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : {}
            , i = t.textTracks();
        r.kind = e,
        n && (r.label = n),
        o && (r.language = o),
            r.tech = t;
        var s = new m["default"](r);
        return i.addTrack_(s),
            s
      }
      n.__esModule = !0;
      var u = t("../component")
          , c = r(u)
          , p = t("../tracks/html-track-element")
          , f = r(p)
          , h = t("../tracks/html-track-element-list")
          , d = r(h)
          , y = t("../utils/merge-options.js")
          , v = r(y)
          , g = t("../tracks/text-track")
          , m = r(g)
          , b = t("../tracks/text-track-list")
          , _ = r(b)
          , j = t("../tracks/video-track-list")
          , w = r(j)
          , T = t("../tracks/audio-track-list")
          , k = r(T)
          , E = t("../utils/fn.js")
          , C = o(E)
          , O = t("../utils/log.js")
          , S = r(O)
          , x = t("../utils/time-ranges.js")
          , P = t("../utils/buffer.js")
          , M = t("../media-error.js")
          , A = r(M)
          , I = t("global/window")
          , D = r(I)
          , R = t("global/document")
          , L = r(R)
          , N = function(t) {
        function e() {
          var n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
              , o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : function() {}
          ;
          i(this, e),
              n.reportTouchActivity = !1;
          var r = s(this, t.call(this, null, n, o));
          return r.hasStarted_ = !1,
              r.on("playing", function() {
                this.hasStarted_ = !0
              }),
              r.on("loadstart", function() {
                this.hasStarted_ = !1
              }),
              r.textTracks_ = n.textTracks,
              r.videoTracks_ = n.videoTracks,
              r.audioTracks_ = n.audioTracks,
          r.featuresProgressEvents || r.manualProgressOn(),
          r.featuresTimeupdateEvents || r.manualTimeUpdatesOn(),
          (n.nativeCaptions === !1 || n.nativeTextTracks === !1) && (r.featuresNativeTextTracks = !1),
          r.featuresNativeTextTracks || r.on("ready", r.emulateTextTracks),
              r.initTextTrackListeners(),
              r.initTrackListeners(),
              r.emitTapEvents(),
              r
        }
        return a(e, t),
            e.prototype.manualProgressOn = function() {
              this.on("durationchange", this.onDurationChange),
                  this.manualProgress = !0,
                  this.one("ready", this.trackProgress)
            }
            ,
            e.prototype.manualProgressOff = function() {
              this.manualProgress = !1,
                  this.stopTrackingProgress(),
                  this.off("durationchange", this.onDurationChange)
            }
            ,
            e.prototype.trackProgress = function() {
              this.stopTrackingProgress(),
                  this.progressInterval = this.setInterval(C.bind(this, function() {
                    var t = this.bufferedPercent();
                    this.bufferedPercent_ !== t && this.trigger("progress"),
                        this.bufferedPercent_ = t,
                    1 === t && this.stopTrackingProgress()
                  }), 500)
            }
            ,
            e.prototype.onDurationChange = function() {
              this.duration_ = this.duration()
            }
            ,
            e.prototype.buffered = function() {
              return x.createTimeRange(0, 0)
            }
            ,
            e.prototype.bufferedPercent = function() {
              return P.bufferedPercent(this.buffered(), this.duration_)
            }
            ,
            e.prototype.stopTrackingProgress = function() {
              this.clearInterval(this.progressInterval)
            }
            ,
            e.prototype.manualTimeUpdatesOn = function() {
              this.manualTimeUpdates = !0,
                  this.on("play", this.trackCurrentTime),
                  this.on("pause", this.stopTrackingCurrentTime)
            }
            ,
            e.prototype.manualTimeUpdatesOff = function() {
              this.manualTimeUpdates = !1,
                  this.stopTrackingCurrentTime(),
                  this.off("play", this.trackCurrentTime),
                  this.off("pause", this.stopTrackingCurrentTime)
            }
            ,
            e.prototype.trackCurrentTime = function() {
              this.currentTimeInterval && this.stopTrackingCurrentTime(),
                  this.currentTimeInterval = this.setInterval(function() {
                    this.trigger({
                      type: "timeupdate",
                      target: this,
                      manuallyTriggered: !0
                    })
                  }, 250)
            }
            ,
            e.prototype.stopTrackingCurrentTime = function() {
              this.clearInterval(this.currentTimeInterval),
                  this.trigger({
                    type: "timeupdate",
                    target: this,
                    manuallyTriggered: !0
                  })
            }
            ,
            e.prototype.dispose = function() {
              this.clearTracks(["audio", "video", "text"]),
              this.manualProgress && this.manualProgressOff(),
              this.manualTimeUpdates && this.manualTimeUpdatesOff(),
                  t.prototype.dispose.call(this)
            }
            ,
            e.prototype.clearTracks = function(t) {
              var e = this;
              t = [].concat(t),
                  t.forEach(function(t) {
                    for (var n = e[t + "Tracks"]() || [], o = n.length; o--; ) {
                      var r = n[o];
                      "text" === t && e.removeRemoteTextTrack(r),
                          n.removeTrack_(r)
                    }
                  })
            }
            ,
            e.prototype.reset = function() {}
            ,
            e.prototype.error = function(t) {
              return void 0 !== t && (this.error_ = new A["default"](t),
                  this.trigger("error")),
                  this.error_
            }
            ,
            e.prototype.played = function() {
              return this.hasStarted_ ? x.createTimeRange(0, 0) : x.createTimeRange()
            }
            ,
            e.prototype.setCurrentTime = function() {
              this.manualTimeUpdates && this.trigger({
                type: "timeupdate",
                target: this,
                manuallyTriggered: !0
              })
            }
            ,
            e.prototype.initTextTrackListeners = function() {
              var t = C.bind(this, function() {
                this.trigger("texttrackchange")
              })
                  , e = this.textTracks();
              e && (e.addEventListener("removetrack", t),
                  e.addEventListener("addtrack", t),
                  this.on("dispose", C.bind(this, function() {
                    e.removeEventListener("removetrack", t),
                        e.removeEventListener("addtrack", t)
                  })))
            }
            ,
            e.prototype.initTrackListeners = function() {
              var t = this
                  , e = ["video", "audio"];
              e.forEach(function(e) {
                var n = function() {
                  t.trigger(e + "trackchange")
                }
                    , o = t[e + "Tracks"]();
                o.addEventListener("removetrack", n),
                    o.addEventListener("addtrack", n),
                    t.on("dispose", function() {
                      o.removeEventListener("removetrack", n),
                          o.removeEventListener("addtrack", n)
                    })
              })
            }
            ,
            e.prototype.emulateTextTracks = function() {
              var t = this
                  , e = this.textTracks();
              if (e) {
                D["default"].WebVTT || null === this.el().parentNode || void 0 === this.el().parentNode || !function() {
                  var e = L["default"].createElement("script");
                  e.src = t.options_["vtt.js"] || "https://cdn.rawgit.com/gkatsev/vtt.js/vjs-v0.12.1/dist/vtt.min.js",
                      e.onload = function() {
                        t.trigger("vttjsloaded")
                      }
                      ,
                      e.onerror = function() {
                        t.trigger("vttjserror")
                      }
                      ,
                      t.on("dispose", function() {
                        e.onload = null,
                            e.onerror = null
                      }),
                      D["default"].WebVTT = !0,
                      t.el().parentNode.appendChild(e)
                }();
                var n = function() {
                  return t.trigger("texttrackchange")
                }
                    , o = function() {
                  n();
                  for (var t = 0; t < e.length; t++) {
                    var o = e[t];
                    o.removeEventListener("cuechange", n),
                    "showing" === o.mode && o.addEventListener("cuechange", n)
                  }
                };
                o(),
                    e.addEventListener("change", o),
                    this.on("dispose", function() {
                      e.removeEventListener("change", o)
                    })
              }
            }
            ,
            e.prototype.videoTracks = function() {
              return this.videoTracks_ = this.videoTracks_ || new w["default"],
                  this.videoTracks_
            }
            ,
            e.prototype.audioTracks = function() {
              return this.audioTracks_ = this.audioTracks_ || new k["default"],
                  this.audioTracks_
            }
            ,
            e.prototype.textTracks = function() {
              return this.textTracks_ = this.textTracks_ || new _["default"],
                  this.textTracks_
            }
            ,
            e.prototype.remoteTextTracks = function() {
              return this.remoteTextTracks_ = this.remoteTextTracks_ || new _["default"],
                  this.remoteTextTracks_
            }
            ,
            e.prototype.remoteTextTrackEls = function() {
              return this.remoteTextTrackEls_ = this.remoteTextTrackEls_ || new d["default"],
                  this.remoteTextTrackEls_
            }
            ,
            e.prototype.addTextTrack = function(t, e, n) {
              if (!t)
                throw new Error("TextTrack kind is required but was not provided");
              return l(this, t, e, n)
            }
            ,
            e.prototype.addRemoteTextTrack = function(t) {
              var e = v["default"](t, {
                tech: this
              })
                  , n = new f["default"](e);
              return this.remoteTextTrackEls().addTrackElement_(n),
                  this.remoteTextTracks().addTrack_(n.track),
                  this.textTracks().addTrack_(n.track),
                  n
            }
            ,
            e.prototype.removeRemoteTextTrack = function(t) {
              this.textTracks().removeTrack_(t);
              var e = this.remoteTextTrackEls().getTrackElementByTrack_(t);
              this.remoteTextTrackEls().removeTrackElement_(e),
                  this.remoteTextTracks().removeTrack_(t)
            }
            ,
            e.prototype.setPoster = function() {}
            ,
            e.prototype.canPlayType = function() {
              return ""
            }
            ,
            e.isTech = function(t) {
              return t.prototype instanceof e || t instanceof e || t === e
            }
            ,
            e.registerTech = function(t, n) {
              if (e.techs_ || (e.techs_ = {}),
                  !e.isTech(n))
                throw new Error("Tech " + t + " must be a Tech");
              return e.techs_[t] = n,
                  n
            }
            ,
            e.getTech = function(t) {
              return e.techs_ && e.techs_[t] ? e.techs_[t] : D["default"] && D["default"].videoPlayer && D["default"].videoPlayer[t] ? (S["default"].warn("The " + t + " tech was added to the videojs object when it should be registered using videojs.registerTech(name, tech)"),
                  D["default"].videoPlayer[t]) : void 0
            }
            ,
            e
      }(c["default"]);
      N.prototype.textTracks_,
          N.prototype.audioTracks_,
          N.prototype.videoTracks_,
          N.prototype.featuresVolumeControl = !0,
          N.prototype.featuresFullscreenResize = !1,
          N.prototype.featuresPlaybackRate = !1,
          N.prototype.featuresProgressEvents = !1,
          N.prototype.featuresTimeupdateEvents = !1,
          N.prototype.featuresNativeTextTracks = !1,
          N.withSourceHandlers = function(t) {
            t.registerSourceHandler = function(e, n) {
              var o = t.sourceHandlers;
              o || (o = t.sourceHandlers = []),
              void 0 === n && (n = o.length),
                  o.splice(n, 0, e)
            }
                ,
                t.canPlayType = function(e) {
                  for (var n = t.sourceHandlers || [], o = void 0, r = 0; r < n.length; r++)
                    if (o = n[r].canPlayType(e))
                      return o;
                  return ""
                }
                ,
                t.selectSourceHandler = function(e, n) {
                  for (var o = t.sourceHandlers || [], r = void 0, i = 0; i < o.length; i++)
                    if (r = o[i].canHandleSource(e, n))
                      return o[i];
                  return null
                }
                ,
                t.canPlaySource = function(e, n) {
                  var o = t.selectSourceHandler(e, n);
                  return o ? o.canHandleSource(e, n) : ""
                }
            ;
            var e = ["seekable", "duration"];
            e.forEach(function(t) {
              var e = this[t];
              "function" == typeof e && (this[t] = function() {
                    return this.sourceHandler_ && this.sourceHandler_[t] ? this.sourceHandler_[t].apply(this.sourceHandler_, arguments) : e.apply(this, arguments)
                  }
              )
            }, t.prototype),
                t.prototype.setSource = function(e) {
                  var n = t.selectSourceHandler(e, this.options_);
                  return n || (t.nativeSourceHandler ? n = t.nativeSourceHandler : S["default"].error("No source hander found for the current source.")),
                      this.disposeSourceHandler(),
                      this.off("dispose", this.disposeSourceHandler),
                  this.currentSource_ && (this.clearTracks(["audio", "video"]),
                      this.currentSource_ = null),
                  n !== t.nativeSourceHandler && (this.currentSource_ = e,
                      this.off(this.el_, "loadstart", t.prototype.firstLoadStartListener_),
                      this.off(this.el_, "loadstart", t.prototype.successiveLoadStartListener_),
                      this.one(this.el_, "loadstart", t.prototype.firstLoadStartListener_)),
                      this.sourceHandler_ = n.handleSource(e, this, this.options_),
                      this.on("dispose", this.disposeSourceHandler),
                      this
                }
                ,
                t.prototype.firstLoadStartListener_ = function() {
                  this.one(this.el_, "loadstart", t.prototype.successiveLoadStartListener_)
                }
                ,
                t.prototype.successiveLoadStartListener_ = function() {
                  this.currentSource_ = null,
                      this.disposeSourceHandler(),
                      this.one(this.el_, "loadstart", t.prototype.successiveLoadStartListener_)
                }
                ,
                t.prototype.disposeSourceHandler = function() {
                  this.sourceHandler_ && this.sourceHandler_.dispose && (this.off(this.el_, "loadstart", t.prototype.firstLoadStartListener_),
                      this.off(this.el_, "loadstart", t.prototype.successiveLoadStartListener_),
                      this.sourceHandler_.dispose(),
                      this.sourceHandler_ = null)
                }
          }
          ,
          c["default"].registerComponent("Tech", N),
          c["default"].registerComponent("MediaTechController", N),
          N.registerTech("Tech", N),
          n["default"] = N
    }
      , {
        "../component": 5,
        "../media-error.js": 49,
        "../tracks/audio-track-list": 66,
        "../tracks/html-track-element": 69,
        "../tracks/html-track-element-list": 68,
        "../tracks/text-track": 76,
        "../tracks/text-track-list": 74,
        "../tracks/video-track-list": 80,
        "../utils/buffer.js": 83,
        "../utils/fn.js": 86,
        "../utils/log.js": 89,
        "../utils/merge-options.js": 90,
        "../utils/time-ranges.js": 92,
        "global/document": 96,
        "global/window": 97
      }],
    66: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("./track-list")
          , u = r(l)
          , c = t("../utils/browser.js")
          , p = o(c)
          , f = t("global/document")
          , h = r(f)
          , d = function(t, e) {
        for (var n = 0; n < t.length; n++)
          e.id !== t[n].id && (t[n].enabled = !1)
      }
          , y = function(t) {
        function e() {
          var n, o, r = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
          i(this, e);
          for (var a = void 0, l = r.length - 1; l >= 0; l--)
            if (r[l].enabled) {
              d(r, r[l]);
              break
            }
          if (p.IS_IE8) {
            a = h["default"].createElement("custom");
            for (var c in u["default"].prototype)
              "constructor" !== c && (a[c] = u["default"].prototype[c]);
            for (var f in e.prototype)
              "constructor" !== f && (a[f] = e.prototype[f])
          }
          return a = n = s(this, t.call(this, r, a)),
              a.changing_ = !1,
              o = a,
              s(n, o)
        }
        return a(e, t),
            e.prototype.addTrack_ = function(e) {
              var n = this;
              e.enabled && d(this, e),
                  t.prototype.addTrack_.call(this, e),
              e.addEventListener && e.addEventListener("enabledchange", function() {
                n.changing_ || (n.changing_ = !0,
                    d(n, e),
                    n.changing_ = !1,
                    n.trigger("change"))
              })
            }
            ,
            e.prototype.addTrack = function(t) {
              this.addTrack_(t)
            }
            ,
            e.prototype.removeTrack = function(e) {
              t.prototype.removeTrack_.call(this, e)
            }
            ,
            e
      }(u["default"]);
      n["default"] = y
    }
      , {
        "../utils/browser.js": 82,
        "./track-list": 78,
        "global/document": 96
      }],
    67: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("./track-enums")
          , u = t("./track")
          , c = r(u)
          , p = t("../utils/merge-options")
          , f = r(p)
          , h = t("../utils/browser.js")
          , d = o(h)
          , y = function(t) {
        function e() {
          var n, o, r = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          i(this, e);
          var a = f["default"](r, {
            kind: l.AudioTrackKind[r.kind] || ""
          })
              , u = n = s(this, t.call(this, a))
              , c = !1;
          if (d.IS_IE8)
            for (var p in e.prototype)
              "constructor" !== p && (u[p] = e.prototype[p]);
          return Object.defineProperty(u, "enabled", {
            get: function() {
              return c
            },
            set: function(t) {
              "boolean" == typeof t && t !== c && (c = t,
                  this.trigger("enabledchange"))
            }
          }),
          a.enabled && (u.enabled = a.enabled),
              u.loaded_ = !0,
              o = u,
              s(n, o)
        }
        return a(e, t),
            e
      }(c["default"]);
      n["default"] = y
    }
      , {
        "../utils/browser.js": 82,
        "../utils/merge-options": 90,
        "./track": 79,
        "./track-enums": 77
      }],
    68: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      n.__esModule = !0;
      var s = t("../utils/browser.js")
          , a = r(s)
          , l = t("global/document")
          , u = o(l)
          , c = function() {
        function t() {
          var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
          i(this, t);
          var n = this;
          if (a.IS_IE8) {
            n = u["default"].createElement("custom");
            for (var o in t.prototype)
              "constructor" !== o && (n[o] = t.prototype[o])
          }
          n.trackElements_ = [],
              Object.defineProperty(n, "length", {
                get: function() {
                  return this.trackElements_.length
                }
              });
          for (var r = 0, s = e.length; s > r; r++)
            n.addTrackElement_(e[r]);
          return a.IS_IE8 ? n : void 0
        }
        return t.prototype.addTrackElement_ = function(t) {
          this.trackElements_.push(t)
        }
            ,
            t.prototype.getTrackElementByTrack_ = function(t) {
              for (var e = void 0, n = 0, o = this.trackElements_.length; o > n; n++)
                if (t === this.trackElements_[n].track) {
                  e = this.trackElements_[n];
                  break
                }
              return e
            }
            ,
            t.prototype.removeTrackElement_ = function(t) {
              for (var e = 0, n = this.trackElements_.length; n > e; e++)
                if (t === this.trackElements_[e]) {
                  this.trackElements_.splice(e, 1);
                  break
                }
            }
            ,
            t
      }();
      n["default"] = c
    }
      , {
        "../utils/browser.js": 82,
        "global/document": 96
      }],
    69: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../utils/browser.js")
          , u = r(l)
          , c = t("global/document")
          , p = o(c)
          , f = t("../event-target")
          , h = o(f)
          , d = t("../tracks/text-track")
          , y = o(d)
          , v = 0
          , g = 1
          , m = 2
          , b = 3
          , _ = function(t) {
        function e() {
          var n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          i(this, e);
          var o = s(this, t.call(this))
              , r = void 0
              , a = o;
          if (u.IS_IE8) {
            a = p["default"].createElement("custom");
            for (var l in e.prototype)
              "constructor" !== l && (a[l] = e.prototype[l])
          }
          var c = new y["default"](n);
          if (a.kind = c.kind,
              a.src = c.src,
              a.srclang = c.language,
              a.label = c.label,
              a["default"] = c["default"],
              Object.defineProperty(a, "readyState", {
                get: function() {
                  return r
                }
              }),
              Object.defineProperty(a, "track", {
                get: function() {
                  return c
                }
              }),
              r = v,
              c.addEventListener("loadeddata", function() {
                r = m,
                    a.trigger({
                      type: "load",
                      target: a
                    })
              }),
              u.IS_IE8) {
            var f;
            return f = a,
                s(o, f)
          }
          return o
        }
        return a(e, t),
            e
      }(h["default"]);
      _.prototype.allowedEvents_ = {
        load: "load"
      },
          _.NONE = v,
          _.LOADING = g,
          _.LOADED = m,
          _.ERROR = b,
          n["default"] = _
    }
      , {
        "../event-target": 45,
        "../tracks/text-track": 76,
        "../utils/browser.js": 82,
        "global/document": 96
      }],
    70: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      function l(t, e, n) {
        var o = '\n    <div role="document">\n      <div role="heading" aria-level="1" id="' + e + '" class="vjs-control-text">Captions Settings Dialog</div>\n      <div id="' + n + '" class="vjs-control-text">Beginning of dialog window. Escape will cancel and close the window.</div>\n      <div class="vjs-simpletracksettings">\n        <div class="vjs-settings-item">\n          <label class="vjs-label" for="track-select-' + t + '">' + this.localize("Current Text Track") + '</label>\n          <div id="track-select-' + t + '" class="vjs-track-select vjs-setting-box">\n            <div class="current-track vjs-icon-dropdown">' + this.localize("No Track") + '</div>\n            <div class="tracks-pop-list-box">\n              <!-- track-list -->\n            </div>\n          </div>\n        </div>\n        <div class="vjs-settings-item time-adjust-settings-item">\n          <label class="vjs-label" for="captions-time-adjust-' + t + '">' + this.localize("Time Ajust") + '</label>\n          <div id="captions-time-adjust-' + t + '" class="vjs-captions-time-adjust vjs-setting-box">\n            <div class="backward-box">\n              <button class="backward vjs-icon-remove"></button>\n              <div class="backward-tip">' + this.localize("Track backward") + '</div>\n            </div>\n            <div class="current-time-adjust-box"><span class="current-time-adjust">0</span>' + this.localize("seconds") + '</div>\n            <div class="forward-box">\n              <button class="forward vjs-icon-add"></button>\n              <div class="forward-tip">' + this.localize("Track forward") + '</div>\n            </div>\n          </div>\n        </div>\n        <div class="vjs-settings-item font-size-settings-item">\n          <label class="vjs-label" for="captions-font-size-' + t + '">' + this.localize("Font Size") + '</label>\n          <div id="captions-font-size-' + t + '" class="vjs-captions-font-size vjs-setting-box">\n            <div class="line"></div>\n            <ul class="size-list">\n              <li class="size-item small">\n                <div class="circle" index=0></div>\n                <div class="size-intro">小</div>\n              </li>\n              <li class="size-item middle default">\n                <div class="circle" index=1></div>\n                <div class="size-intro">中</div>\n              </li>\n              <li class="size-item big">\n                <div class="circle" index=2></div>\n                <div class="size-intro">大</div>\n              </li>\n              <li class="size-item super-big">\n                <div class="circle" index=3></div>\n                <div class="size-intro">超大</div>\n              </li>\n            </ul>\n            <div class="drag-button"></div>\n          </div>\n        </div>\n        <div class="vjs-settings-item vjs-default-button-box">\n          <div class="vjs-default-button">' + this.localize("Back Defaults") + '</div>\n        </div>\n      </div> <!-- vjs-simpletracksettings -->\n    </div> <!--  role="document" -->\n  ';
        return o
      }
      n.__esModule = !0;
      var u = t("../component")
          , c = r(u)
          , p = t("../utils/events.js")
          , f = o(p)
          , h = t("../utils/fn.js")
          , d = o(h)
          , y = t("../utils/dom.js")
          , v = o(y)
          , g = t("../utils/log.js")
          , m = r(g)
          , b = t("safe-json-parse/tuple")
          , _ = r(b)
          , j = t("global/window")
          , w = r(j)
          , T = t("global/document")
          , k = r(T)
          , E = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.hide(),
          void 0 === o.persistTextTrackSettings && (r.options_.persistTextTrackSettings = r.options_.playerOptions.persistTextTrackSettings),
              f.on(r.contentEl(), "mouseleave", d.bind(r, function() {
                this.hide()
              })),
              f.on(k["default"], "click", d.bind(r, function() {
                this.player().getChild("controlBar").getChild("simpleCaptionsButton")
              })),
              r.trackSelectBox = r.$(".vjs-track-select"),
              r.currTrack = r.$(".vjs-track-select .current-track"),
              r.tracksList = r.$(".vjs-track-select .tracks-pop-list-box"),
              r.currTimeAdjust = r.$(".vjs-captions-time-adjust .current-time-adjust"),
              r.backward = r.$(".vjs-captions-time-adjust .backward"),
              r.forward = r.$(".vjs-captions-time-adjust .forward"),
              r.fontSizeBox = r.$(".vjs-captions-font-size"),
              r.dragButton = r.$(".vjs-captions-font-size .drag-button"),
              r.fontSizeCircles = r.$$(".vjs-captions-font-size .circle"),
              r.introList = r.$$(".vjs-captions-font-size .size-item .size-intro"),
              r.defaultButton = r.$(".vjs-default-button"),
              r.player().forceActiveComponents.push(r),
              r
        }
        return a(e, t),
            e.prototype.eventBind = function() {
              if (!this.hasBind) {
                this.hasBind = !0,
                    f.on(this.trackSelectBox, "click", d.bind(this, this.trackSelectFn)),
                    f.on(this.currTrack, "mouseenter", d.bind(this, function() {
                      this.tracksListDisplay(!0)
                    })),
                    f.on(this.currTrack, "mouseleave", d.bind(this, function() {
                      this.tracksListDisplay(!1)
                    })),
                    f.on(this.tracksList, "mouseenter", d.bind(this, function() {
                      this.tracksListDisplay(!0)
                    })),
                    f.on(this.tracksList, "mouseleave", d.bind(this, function() {
                      this.tracksListDisplay(!1)
                    })),
                    f.on(this.backward, "click", d.bind(this, this.timeBackwardFn)),
                    f.on(this.forward, "click", d.bind(this, this.timeForwardFn)),
                    f.on(this.dragButton, "mousedown", d.bind(this, this.dragButtonDown)),
                    f.on(this.dragButton, "mouseup", d.bind(this, this.dragButtonUp)),
                    f.on(this.fontSizeBox, "mouseleave", d.bind(this, this.fontSizeBoxLeave));
                for (var t = 0; t < this.fontSizeCircles.length; t++)
                  f.on(this.fontSizeCircles[t], "click", d.bind(this, this.clickFontButton));
                f.on(this.defaultButton, "click", d.bind(this, this.resetDefault))
              }
            }
            ,
            e.prototype.eventUnbind = function() {
              if (this.hasBind) {
                this.hasBind = !1,
                    f.off(this.trackSelectBox, "click"),
                    f.off(this.backward, "click"),
                    f.off(this.forward, "click"),
                    f.off(this.dragButton, "mousedown"),
                    f.off(this.dragButton, "mouseup"),
                    f.off(this.fontSizeBox, "mouseleave");
                for (var t = 0; t < this.fontSizeCircles.length; t++)
                  f.off(this.fontSizeCircles[t], "click");
                f.off(this.defaultButton, "click")
              }
            }
            ,
            e.prototype.trackSelectFn = function(t) {
              var e = this
                  , n = t.target;
              this.tracks.forEach(function(t) {
                if (t.contentEl() === n) {
                  for (var o = e.localize(t.options_.label), r = 0, i = 0; i < o.length; i++)
                    if (o.charCodeAt(i) < 128 ? r++ : r += 2,
                    r > 16) {
                      o = o.substring(0, i) + "...srt";
                      break
                    }
                  v.insertContent(e.currTrack, o),
                      e.tracksListDisplay(!1)
                }
              })
            }
            ,
            e.prototype.timeBackwardFn = function() {
              var t = parseFloat(v.textContentGet(this.currTimeAdjust));
              v.textContent(this.currTimeAdjust, t - .5),
                  this.updateDisplay()
            }
            ,
            e.prototype.timeForwardFn = function() {
              var t = parseFloat(v.textContentGet(this.currTimeAdjust));
              v.textContent(this.currTimeAdjust, t + .5),
                  this.updateDisplay()
            }
            ,
            e.prototype.dragButtonDown = function() {
              this.fontPercentDrag || (this.fontPercentDrag = !0,
                  f.on(this.fontSizeBox, "mousemove", d.bind(this, this.dragButtonMove)))
            }
            ,
            e.prototype.dragButtonUp = function() {
              if (this.fontPercentDrag) {
                this.fontPercentDrag = !1,
                    f.off(this.fontSizeBox, "mousemove", d.bind(this, this.dragButtonMove));
                var t = parseInt(this.dragButton.style.left, 10);
                this.selectFontSize(t)
              }
            }
            ,
            e.prototype.dragButtonMove = function(t) {
              if (this.fontPercentDrag) {
                v.removeElClass(this.dragButton, "ani");
                var e = v.getPointerPosition(this.fontSizeBox, t);
                this.dragButton.style.left = parseInt(w["default"].getComputedStyle(this.fontSizeBox).width, 10) * e.x + "px"
              }
            }
            ,
            e.prototype.clickFontButton = function(t) {
              var e = v.getPointerPosition(this.fontSizeBox, t)
                  , n = parseInt(w["default"].getComputedStyle(this.fontSizeBox).width, 10) * e.x;
              this.selectFontSize(n)
            }
            ,
            e.prototype.fontSizeBoxLeave = function() {
              if (this.fontPercentDrag) {
                this.fontPercentDrag = !1,
                    f.off(this.fontSizeBox, "mousemove", d.bind(this, this.dragButtonMove));
                var t = parseInt(this.dragButton.style.left, 10);
                this.selectFontSize(t)
              }
            }
            ,
            e.prototype.selectFontSize = function(t) {
              v.addElClass(this.dragButton, "ani");
              for (var e = 0; e < this.ranges.length; e++)
                t >= this.ranges[e].lowmit && t < this.ranges[e].upmit ? (this.dragButton.style.left = this.ranges[e].pos + "px",
                    v.setElData(this.dragButton, "value", this.ranges[e].value),
                    this.updateDisplay(),
                    this.introList[e].style.color = "#2e85ff") : this.introList[e].style.color = "#bbb"
            }
            ,
            e.prototype.resetDefault = function() {
              this.selectFontSize(this.ranges[1].pos),
                  v.textContent(this.currTimeAdjust, 0),
                  this.updateDisplay()
            }
            ,
            e.prototype.calculateRanges = function() {
              this.ranges || (this.range = parseInt(w["default"].getComputedStyle(this.fontSizeBox).width, 10) / 6,
                  this.ranges = [{
                    lowmit: 0,
                    upmit: this.range,
                    pos: 0,
                    value: .75
                  }, {
                    lowmit: this.range,
                    upmit: 3 * this.range,
                    pos: 64,
                    value: 1
                  }, {
                    lowmit: 3 * this.range,
                    upmit: 5 * this.range,
                    pos: 124,
                    value: 1.5
                  }, {
                    lowmit: 5 * this.range,
                    upmit: 6 * this.range,
                    pos: 184,
                    value: 2
                  }],
                  this.restoreSettings())
            }
            ,
            e.prototype.createEl = function() {
              var e = this.id_
                  , n = "TTsettingsDialogLabel-" + e
                  , o = "TTsettingsDialogDescription-" + e;
              return t.prototype.createEl.call(this, "div", {
                className: "vjs-simple-caption-settings vjs-modal-overlay",
                innerHTML: l.call(this, e, n, o),
                tabIndex: -1
              }, {
                role: "dialog",
                "aria-labelledby": n,
                "aria-describedby": o
              })
            }
            ,
            e.prototype.getValues = function() {
              var t = w["default"].parseFloat(v.getElData(this.dragButton).value)
                  , e = w["default"].parseFloat(v.textContentGet(this.currTimeAdjust))
                  , n = {
                fontPercent: t,
                timeAjust: e
              };
              for (var o in n)
                ("" === n[o] || "none" === n[o] || "fontPercent" === o && 1 === n[o]) && delete n[o];
              return n
            }
            ,
            e.prototype.setValues = function(t) {
              for (var e = t.fontPercent, n = 0; n < this.ranges.length; n++)
                if (this.ranges[n].value === e) {
                  this.selectFontSize(this.ranges[n].pos);
                  break
                }
              var o = t.timeAjust;
              o && (o = o.toFixed(1)),
                  v.textContent(this.currTimeAdjust, o)
            }
            ,
            e.prototype.restoreSettings = function() {
              var t = void 0
                  , e = void 0;
              try {
                var n = _["default"](w["default"].localStorage.getItem("vjs-simple-text-track-settings"));
                t = n[0],
                    e = n[1],
                t && m["default"].error(t)
              } catch (o) {
                m["default"].warn(o)
              }
              e && this.setValues(e)
            }
            ,
            e.prototype.saveSettings = function() {
              if (this.options_.persistTextTrackSettings) {
                var t = this.getValues();
                try {
                  Object.getOwnPropertyNames(t).length > 0 ? w["default"].localStorage.setItem("vjs-simple-text-track-settings", JSON.stringify(t)) : w["default"].localStorage.removeItem("vjs-simple-text-track-settings")
                } catch (e) {
                  m["default"].warn(e)
                }
              }
            }
            ,
            e.prototype.updateDisplay = function() {
              var t = this.player_.getChild("textTrackDisplay");
              t && t.updateDisplay(),
                  this.saveSettings()
            }
            ,
            e.prototype.updateTracks = function(t, e) {
              var n = 1;
              this.tracks = e,
                  this.tracks && this.tracks.length > n ? (this.removeClass("havent-tracks"),
                      v.insertContent(this.$(".vjs-track-select .current-track"), this.localize("No Track")),
                      v.insertContent(this.$(".tracks-pop-list-box"), t.contentEl()),
                      v.addElClass(this.currTrack, "vjs-icon-dropdown"),
                      this.calculateRanges(),
                      this.eventBind()) : (this.addClass("havent-tracks"),
                      v.insertContent(this.$(".vjs-track-select .current-track"), this.localize("Have not Track")),
                      v.removeElClass(this.currTrack, "vjs-icon-dropdown"),
                      v.removeElClass(this.currTrack, "vjs-icon-dropup"),
                      this.eventUnbind())
            }
            ,
            e.prototype.tracksListDisplay = function(t) {
              t ? (v.addElClass(this.currTrack, "vjs-icon-dropup"),
                  v.removeElClass(this.currTrack, "vjs-icon-dropdown"),
                  this.tracksList.style.display = "block") : (v.addElClass(this.currTrack, "vjs-icon-dropdown"),
                  v.removeElClass(this.currTrack, "vjs-icon-dropup"),
                  this.tracksList.style.display = "none")
            }
            ,
            e
      }(c["default"]);
      c["default"].registerComponent("SimpleTextTrackSettings", E),
          n["default"] = E
    }
      , {
        "../component": 5,
        "../utils/dom.js": 84,
        "../utils/events.js": 85,
        "../utils/fn.js": 86,
        "../utils/log.js": 89,
        "global/document": 96,
        "global/window": 97,
        "safe-json-parse/tuple": 149
      }],
    71: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      n.__esModule = !0;
      var s = t("../utils/browser.js")
          , a = r(s)
          , l = t("global/document")
          , u = o(l)
          , c = function() {
        function t(e) {
          i(this, t);
          var n = this;
          if (a.IS_IE8) {
            n = u["default"].createElement("custom");
            for (var o in t.prototype)
              "constructor" !== o && (n[o] = t.prototype[o])
          }
          return t.prototype.setCues_.call(n, e),
              Object.defineProperty(n, "length", {
                get: function() {
                  return this.length_
                }
              }),
              a.IS_IE8 ? n : void 0
        }
        return t.prototype.setCues_ = function(t) {
          var e = this.length || 0
              , n = 0
              , o = t.length;
          this.cues_ = t,
              this.length_ = t.length;
          var r = function(t) {
            "" + t in this || Object.defineProperty(this, "" + t, {
              get: function() {
                return this.cues_[t]
              }
            })
          };
          if (o > e)
            for (n = e; o > n; n++)
              r.call(this, n)
        }
            ,
            t.prototype.getCueById = function(t) {
              for (var e = null, n = 0, o = this.length; o > n; n++) {
                var r = this[n];
                if (r.id === t) {
                  e = r;
                  break
                }
              }
              return e
            }
            ,
            t
      }();
      n["default"] = c
    }
      , {
        "../utils/browser.js": 82,
        "global/document": 96
      }],
    72: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      function l(t, e) {
        return "rgba(" + parseInt(t[1] + t[1], 16) + "," + parseInt(t[2] + t[2], 16) + "," + parseInt(t[3] + t[3], 16) + "," + e + ")"
      }
      function u(t, e, n) {
        try {
          t.style[e] = n
        } catch (o) {
          return
        }
      }
      n.__esModule = !0;
      var c = t("../component")
          , p = r(c)
          , f = t("../utils/fn.js")
          , h = o(f)
          , d = t("global/window")
          , y = r(d)
          , v = t("../utils/merge-options.js")
          , g = r(v)
          , m = "#222"
          , b = "#ccc"
          , _ = {
        monospace: "monospace",
        sansSerif: "sans-serif",
        serif: "serif",
        monospaceSansSerif: '"Andale Mono", "Lucida Console", monospace',
        monospaceSerif: '"Courier New", monospace',
        proportionalSansSerif: "sans-serif",
        proportionalSerif: "serif",
        casual: '"Comic Sans MS", Impact, fantasy',
        script: '"Monotype Corsiva", cursive',
        smallcaps: '"Andale Mono", "Lucida Console", monospace, sans-serif'
      }
          , j = function(t) {
        function e(n, o, r) {
          i(this, e);
          var a = s(this, t.call(this, n, o, r));
          return n.on("loadstart", h.bind(a, a.toggleDisplay)),
              n.on("texttrackchange", h.bind(a, a.updateDisplay)),
              n.ready(h.bind(a, function() {
                if (n.tech_ && n.tech_.featuresNativeTextTracks)
                  return void this.hide();
                n.on("fullscreenchange", h.bind(this, this.updateDisplay));
                for (var t = this.options_.playerOptions.tracks || [], e = 0; e < t.length; e++)
                  this.player_.addRemoteTextTrack(t[e]);
                var o = {
                  captions: 1,
                  subtitles: 1
                }
                    , r = this.player_.textTracks()
                    , i = void 0
                    , s = void 0;
                if (r) {
                  for (var a = 0; a < r.length; a++) {
                    var l = r[a];
                    l["default"] && ("descriptions" !== l.kind || i ? l.kind in o && !s && (s = l) : i = l)
                  }
                  s ? s.mode = "showing" : i && (i.mode = "showing")
                }
              })),
              a
        }
        return a(e, t),
            e.prototype.toggleDisplay = function() {
              this.player_.tech_ && this.player_.tech_.featuresNativeTextTracks ? this.hide() : this.show()
            }
            ,
            e.prototype.createEl = function() {
              return t.prototype.createEl.call(this, "div", {
                className: "vjs-text-track-display"
              }, {
                "aria-live": "assertive",
                "aria-atomic": "true"
              })
            }
            ,
            e.prototype.clearDisplay = function() {
              "function" == typeof y["default"].WebVTT && y["default"].WebVTT.processCues(y["default"], [], this.el_)
            }
            ,
            e.prototype.updateDisplay = function() {
              var t = this.player_.textTracks();
              if (this.clearDisplay(),
                  t) {
                for (var e = null, n = null, o = t.length; o--; ) {
                  var r = t[o];
                  "showing" === r.mode && ("descriptions" === r.kind ? e = r : n = r)
                }
                n ? this.updateForTrack(n) : e && this.updateForTrack(e)
              }
            }
            ,
            e.prototype.updateForTrack = function(t) {
              if ("function" == typeof y["default"].WebVTT && t.activeCues) {
                var e = this.player_.textTrackSettings.getValues()
                    , n = this.player_.getChild("simpleTextTrackSettings").getValues();
                e = g["default"](e, n),
                    this.player_.textTrackSettings.setValues(e);
                for (var o = [], r = 0; r < t.activeCues.length; r++)
                  o.push(t.activeCues[r]);
                y["default"].WebVTT.processCues(y["default"], o, this.el_);
                for (var i = o.length; i--; ) {
                  var s = o[i];
                  if (s) {
                    var a = s.displayState;
                    if (e.color && (a.firstChild.style.color = e.color),
                    e.textOpacity && u(a.firstChild, "color", l(e.color || "#fff", e.textOpacity)),
                    e.backgroundColor && (a.firstChild.style.backgroundColor = e.backgroundColor),
                    e.backgroundOpacity && u(a.firstChild, "backgroundColor", l(e.backgroundColor || "#000", e.backgroundOpacity)),
                    e.windowColor && (e.windowOpacity ? u(a, "backgroundColor", l(e.windowColor, e.windowOpacity)) : a.style.backgroundColor = e.windowColor),
                    e.edgeStyle && ("dropshadow" === e.edgeStyle ? a.firstChild.style.textShadow = "2px 2px 3px " + m + ", 2px 2px 4px " + m + ", 2px 2px 5px " + m : "raised" === e.edgeStyle ? a.firstChild.style.textShadow = "1px 1px " + m + ", 2px 2px " + m + ", 3px 3px " + m : "depressed" === e.edgeStyle ? a.firstChild.style.textShadow = "1px 1px " + b + ", 0 1px " + b + ", -1px -1px " + m + ", 0 -1px " + m : "uniform" === e.edgeStyle && (a.firstChild.style.textShadow = "0 0 4px " + m + ", 0 0 4px " + m + ", 0 0 4px " + m + ", 0 0 4px " + m)),
                    e.fontPercent && 1 !== e.fontPercent) {
                      var c = y["default"].parseFloat(a.style.fontSize);
                      a.style.fontSize = c * e.fontPercent + "px",
                          a.style.height = "auto",
                          a.style.top = "auto",
                          a.style.bottom = "2px"
                    }
                    e.fontFamily && "default" !== e.fontFamily && ("small-caps" === e.fontFamily ? a.firstChild.style.fontVariant = "small-caps" : a.firstChild.style.fontFamily = _[e.fontFamily])
                  }
                }
              }
            }
            ,
            e
      }(p["default"]);
      p["default"].registerComponent("TextTrackDisplay", j),
          n["default"] = j
    }
      , {
        "../component": 5,
        "../utils/fn.js": 86,
        "../utils/merge-options.js": 90,
        "global/window": 97
      }],
    73: [function(t, e, n) {
      "use strict";
      n.__esModule = !0;
      var o = function(t) {
        var e = ["kind", "label", "language", "id", "inBandMetadataTrackDispatchType", "mode", "src"].reduce(function(e, n) {
          return t[n] && (e[n] = t[n]),
              e
        }, {
          cues: t.cues && Array.prototype.map.call(t.cues, function(t) {
            return {
              startTime: t.startTime,
              endTime: t.endTime,
              text: t.text,
              id: t.id
            }
          })
        });
        return e
      }
          , r = function(t) {
        var e = t.$$("track")
            , n = Array.prototype.map.call(e, function(t) {
          return t.track
        })
            , r = Array.prototype.map.call(e, function(t) {
          var e = o(t.track);
          return t.src && (e.src = t.src),
              e
        });
        return r.concat(Array.prototype.filter.call(t.textTracks(), function(t) {
          return -1 === n.indexOf(t)
        }).map(o))
      }
          , i = function(t, e) {
        return t.forEach(function(t) {
          var n = e.addRemoteTextTrack(t).track;
          !t.src && t.cues && t.cues.forEach(function(t) {
            return n.addCue(t)
          })
        }),
            e.textTracks()
      };
      n["default"] = {
        textTracksToJson: r,
        jsonToTextTracks: i,
        trackToJson_: o
      }
    }
      , {}],
    74: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("./track-list")
          , u = r(l)
          , c = t("../utils/fn.js")
          , p = o(c)
          , f = t("../utils/browser.js")
          , h = o(f)
          , d = t("global/document")
          , y = r(d)
          , v = function(t) {
        function e() {
          var n, o, r = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
          i(this, e);
          var a = void 0;
          if (h.IS_IE8) {
            a = y["default"].createElement("custom");
            for (var l in u["default"].prototype)
              "constructor" !== l && (a[l] = u["default"].prototype[l]);
            for (var c in e.prototype)
              "constructor" !== c && (a[c] = e.prototype[c])
          }
          return a = n = s(this, t.call(this, r, a)),
              o = a,
              s(n, o)
        }
        return a(e, t),
            e.prototype.addTrack_ = function(e) {
              t.prototype.addTrack_.call(this, e),
                  e.addEventListener("modechange", p.bind(this, function() {
                    this.trigger("change")
                  }))
            }
            ,
            e.prototype.removeTrack_ = function(t) {
              for (var e = void 0, n = 0, o = this.length; o > n; n++)
                if (this[n] === t) {
                  e = this[n],
                  e.off && e.off(),
                      this.tracks_.splice(n, 1);
                  break
                }
              e && this.trigger({
                track: e,
                type: "removetrack"
              })
            }
            ,
            e.prototype.getTrackById = function(t) {
              for (var e = null, n = 0, o = this.length; o > n; n++) {
                var r = this[n];
                if (r.id === t) {
                  e = r;
                  break
                }
              }
              return e
            }
            ,
            e
      }(u["default"]);
      n["default"] = v
    }
      , {
        "../utils/browser.js": 82,
        "../utils/fn.js": 86,
        "./track-list": 78,
        "global/document": 96
      }],
    75: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      function l(t, e, n) {
        var o = '\n    <div role="document">\n      <div role="heading" aria-level="1" id="' + e + '" class="vjs-control-text">Captions Settings Dialog</div>\n      <div id="' + n + '" class="vjs-control-text">Beginning of dialog window. Escape will cancel and close the window.</div>\n      <div class="vjs-tracksettings">\n        <div class="vjs-tracksettings-colors">\n          <fieldset class="vjs-fg-color vjs-tracksetting">\n            <legend>' + this.localize("Text") + '</legend>\n            <label class="vjs-label" for="captions-foreground-color-' + t + '">' + this.localize("Color") + '</label>\n            <select id="captions-foreground-color-' + t + '">\n              <option value="#FFF" selected>White</option>\n              <option value="#000">Black</option>\n              <option value="#F00">Red</option>\n              <option value="#0F0">Green</option>\n              <option value="#00F">Blue</option>\n              <option value="#FF0">Yellow</option>\n              <option value="#F0F">Magenta</option>\n              <option value="#0FF">Cyan</option>\n            </select>\n            <span class="vjs-text-opacity vjs-opacity">\n              <label class="vjs-label" for="captions-foreground-opacity-' + t + '">' + this.localize("Transparency") + '</label>\n              <select id="captions-foreground-opacity-' + t + '">\n                <option value="1" selected>Opaque</option>\n                <option value="0.5">Semi-Transparent</option>\n              </select>\n            </span>\n          </fieldset>\n          <fieldset class="vjs-bg-color vjs-tracksetting">\n            <legend>' + this.localize("Background") + '</legend>\n            <label class="vjs-label" for="captions-background-color-' + t + '">' + this.localize("Color") + '</label>\n            <select id="captions-background-color-' + t + '">\n              <option value="#000" selected>Black</option>\n              <option value="#FFF">White</option>\n              <option value="#F00">Red</option>\n              <option value="#0F0">Green</option>\n              <option value="#00F">Blue</option>\n              <option value="#FF0">Yellow</option>\n              <option value="#F0F">Magenta</option>\n              <option value="#0FF">Cyan</option>\n            </select>\n            <span class="vjs-bg-opacity vjs-opacity">\n              <label class="vjs-label" for="captions-background-opacity-' + t + '">' + this.localize("Transparency") + '</label>\n              <select id="captions-background-opacity-' + t + '">\n                <option value="0.5" selected>Semi-Transparent</option>\n                <option value="1">Opaque</option>\n                <option value="0">Transparent</option>\n              </select>\n            </span>\n          </fieldset>\n          <fieldset class="window-color vjs-tracksetting">\n            <legend>' + this.localize("Window") + '</legend>\n            <label class="vjs-label" for="captions-window-color-' + t + '">' + this.localize("Color") + '</label>\n            <select id="captions-window-color-' + t + '">\n              <option value="#000" selected>Black</option>\n              <option value="#FFF">White</option>\n              <option value="#F00">Red</option>\n              <option value="#0F0">Green</option>\n              <option value="#00F">Blue</option>\n              <option value="#FF0">Yellow</option>\n              <option value="#F0F">Magenta</option>\n              <option value="#0FF">Cyan</option>\n            </select>\n            <span class="vjs-window-opacity vjs-opacity">\n              <label class="vjs-label" for="captions-window-opacity-' + t + '">' + this.localize("Transparency") + '</label>\n              <select id="captions-window-opacity-' + t + '">\n                <option value="0" selected>Transparent</option>\n                <option value="0.5">Semi-Transparent</option>\n                <option value="1">Opaque</option>\n              </select>\n            </span>\n          </fieldset>\n        </div> <!-- vjs-tracksettings-colors -->\n        <div class="vjs-tracksettings-font">\n          <div class="vjs-font-percent vjs-tracksetting">\n            <label class="vjs-label" for="captions-font-size-' + t + '">' + this.localize("Font Size") + '</label>\n            <select id="captions-font-size-' + t + '">\n              <option value="0.50">50%</option>\n              <option value="0.75">75%</option>\n              <option value="1.00" selected>100%</option>\n              <option value="1.25">125%</option>\n              <option value="1.50">150%</option>\n              <option value="1.75">175%</option>\n              <option value="2.00">200%</option>\n              <option value="3.00">300%</option>\n              <option value="4.00">400%</option>\n            </select>\n          </div>\n          <div class="vjs-edge-style vjs-tracksetting">\n            <label class="vjs-label" for="captions-edge-style-' + t + '">' + this.localize("Text Edge Style") + '</label>\n            <select id="captions-edge-style-' + t + '">\n              <option value="none" selected>None</option>\n              <option value="raised">Raised</option>\n              <option value="depressed">Depressed</option>\n              <option value="uniform">Uniform</option>\n              <option value="dropshadow">Dropshadow</option>\n            </select>\n          </div>\n          <div class="vjs-font-family vjs-tracksetting">\n            <label class="vjs-label" for="captions-font-family-' + t + '">' + this.localize("Font Family") + '</label>\n            <select id="captions-font-family-' + t + '">\n              <option value="proportionalSansSerif" selected>Proportional Sans-Serif</option>\n              <option value="monospaceSansSerif">Monospace Sans-Serif</option>\n              <option value="proportionalSerif">Proportional Serif</option>\n              <option value="monospaceSerif">Monospace Serif</option>\n              <option value="casual">Casual</option>\n              <option value="script">Script</option>\n              <option value="small-caps">Small Caps</option>\n            </select>\n          </div>\n        </div> <!-- vjs-tracksettings-time -->\n        <div class="vjs-tracksettings-time">\n          <div class="vjs-time-ajust vjs-tracksetting">\n            <label class="vjs-label" for="captions-time-adjust-' + t + '">' + this.localize("Time Ajust") + '</label>\n            <input type="number" id="captions-time-adjust-' + t + '" step="0.5" value="0" />&nbsp;' + this.localize("seconds") + '\n          </div>\n        </div> <!-- vjs-tracksettings-font -->\n        <div class="vjs-tracksettings-controls">\n          <button class="vjs-default-button">' + this.localize("Defaults") + '</button>\n          <button class="vjs-done-button">' + this.localize("Done") + '</button>\n        </div>\n      </div> <!-- vjs-tracksettings -->\n    </div> <!--  role="document" -->\n  ';
        return o
      }
      function u(t) {
        var e = void 0;
        return t.selectedOptions ? e = t.selectedOptions[0] : t.options && (e = t.options[t.options.selectedIndex]),
            e.value
      }
      function c(t, e) {
        if (e) {
          var n = void 0;
          for (n = 0; n < t.options.length; n++) {
            var o = t.options[n];
            if (o.value === e)
              break
          }
          t.selectedIndex = n
        }
      }
      n.__esModule = !0;
      var p = t("../component")
          , f = r(p)
          , h = t("../utils/events.js")
          , d = o(h)
          , y = t("../utils/fn.js")
          , v = o(y)
          , g = t("../utils/log.js")
          , m = r(g)
          , b = t("safe-json-parse/tuple")
          , _ = r(b)
          , j = t("global/window")
          , w = r(j)
          , T = function(t) {
        function e(n, o) {
          i(this, e);
          var r = s(this, t.call(this, n, o));
          return r.hide(),
          void 0 === o.persistTextTrackSettings && (r.options_.persistTextTrackSettings = r.options_.playerOptions.persistTextTrackSettings),
              d.on(r.$(".vjs-done-button"), "click", v.bind(r, function() {
                this.saveSettings(),
                    this.hide()
              })),
              d.on(r.$(".vjs-default-button"), "click", v.bind(r, function() {
                this.$(".vjs-fg-color > select").selectedIndex = 0,
                    this.$(".vjs-bg-color > select").selectedIndex = 0,
                    this.$(".window-color > select").selectedIndex = 0,
                    this.$(".vjs-text-opacity > select").selectedIndex = 0,
                    this.$(".vjs-bg-opacity > select").selectedIndex = 0,
                    this.$(".vjs-window-opacity > select").selectedIndex = 0,
                    this.$(".vjs-edge-style select").selectedIndex = 0,
                    this.$(".vjs-font-family select").selectedIndex = 0,
                    this.$(".vjs-font-percent select").selectedIndex = 2,
                    this.$(".vjs-time-ajust input").value = 0,
                    this.updateDisplay()
              })),
              d.on(r.$(".vjs-fg-color > select"), "change", v.bind(r, r.updateDisplay)),
              d.on(r.$(".vjs-bg-color > select"), "change", v.bind(r, r.updateDisplay)),
              d.on(r.$(".window-color > select"), "change", v.bind(r, r.updateDisplay)),
              d.on(r.$(".vjs-text-opacity > select"), "change", v.bind(r, r.updateDisplay)),
              d.on(r.$(".vjs-bg-opacity > select"), "change", v.bind(r, r.updateDisplay)),
              d.on(r.$(".vjs-window-opacity > select"), "change", v.bind(r, r.updateDisplay)),
              d.on(r.$(".vjs-font-percent select"), "change", v.bind(r, r.updateDisplay)),
              d.on(r.$(".vjs-edge-style select"), "change", v.bind(r, r.updateDisplay)),
              d.on(r.$(".vjs-font-family select"), "change", v.bind(r, r.updateDisplay)),
              d.on(r.$(".vjs-time-ajust input"), "change", v.bind(r, r.updateDisplay)),
          r.options_.persistTextTrackSettings && r.restoreSettings(),
              r
        }
        return a(e, t),
            e.prototype.createEl = function() {
              var e = this.id_
                  , n = "TTsettingsDialogLabel-" + e
                  , o = "TTsettingsDialogDescription-" + e;
              return t.prototype.createEl.call(this, "div", {
                className: "vjs-caption-settings vjs-modal-overlay",
                innerHTML: l.call(this, e, n, o),
                tabIndex: -1
              }, {
                role: "dialog",
                "aria-labelledby": n,
                "aria-describedby": o
              })
            }
            ,
            e.prototype.getValues = function() {
              var t = u(this.$(".vjs-edge-style select"))
                  , e = u(this.$(".vjs-font-family select"))
                  , n = u(this.$(".vjs-fg-color > select"))
                  , o = u(this.$(".vjs-text-opacity > select"))
                  , r = u(this.$(".vjs-bg-color > select"))
                  , i = u(this.$(".vjs-bg-opacity > select"))
                  , s = u(this.$(".window-color > select"))
                  , a = u(this.$(".vjs-window-opacity > select"))
                  , l = w["default"].parseFloat(u(this.$(".vjs-font-percent > select")))
                  , c = w["default"].parseFloat(this.$(".vjs-time-ajust > input").value)
                  , p = {
                fontPercent: l,
                timeAjust: c,
                fontFamily: e,
                textOpacity: o,
                windowColor: s,
                windowOpacity: a,
                backgroundOpacity: i,
                edgeStyle: t,
                color: n,
                backgroundColor: r
              };
              for (var f in p)
                ("" === p[f] || "none" === p[f] || "fontPercent" === f && 1 === p[f]) && delete p[f];
              return p
            }
            ,
            e.prototype.getTimeAjust = function() {
              var t = w["default"].parseFloat(this.$(".vjs-time-ajust > input").value);
              return t
            }
            ,
            e.prototype.setValues = function(t) {
              c(this.$(".vjs-edge-style select"), t.edgeStyle),
                  c(this.$(".vjs-font-family select"), t.fontFamily),
                  c(this.$(".vjs-fg-color > select"), t.color),
                  c(this.$(".vjs-text-opacity > select"), t.textOpacity),
                  c(this.$(".vjs-bg-color > select"), t.backgroundColor),
                  c(this.$(".vjs-bg-opacity > select"), t.backgroundOpacity),
                  c(this.$(".window-color > select"), t.windowColor),
                  c(this.$(".vjs-window-opacity > select"), t.windowOpacity);
              var e = t.fontPercent;
              e && (e = e.toFixed(2)),
                  c(this.$(".vjs-font-percent > select"), e);
              var n = t.timeAjust;
              n && (n = n.toFixed(1)),
                  this.$(".vjs-time-ajust > input").value = n
            }
            ,
            e.prototype.restoreSettings = function() {
              var t = void 0
                  , e = void 0;
              try {
                var n = _["default"](w["default"].localStorage.getItem("vjs-text-track-settings"));
                t = n[0],
                    e = n[1],
                t && m["default"].error(t)
              } catch (o) {
                m["default"].warn(o)
              }
              e && this.setValues(e)
            }
            ,
            e.prototype.saveSettings = function() {
              if (this.options_.persistTextTrackSettings) {
                var t = this.getValues();
                try {
                  Object.getOwnPropertyNames(t).length > 0 ? w["default"].localStorage.setItem("vjs-text-track-settings", JSON.stringify(t)) : w["default"].localStorage.removeItem("vjs-text-track-settings")
                } catch (e) {
                  m["default"].warn(e)
                }
              }
            }
            ,
            e.prototype.updateDisplay = function() {
              var t = this.player_.getChild("textTrackDisplay");
              t && t.updateDisplay()
            }
            ,
            e
      }(f["default"]);
      f["default"].registerComponent("TextTrackSettings", T),
          n["default"] = T
    }
      , {
        "../component": 5,
        "../utils/events.js": 85,
        "../utils/fn.js": 86,
        "../utils/log.js": 89,
        "global/window": 97,
        "safe-json-parse/tuple": 149
      }],
    76: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("./text-track-cue-list")
          , u = r(l)
          , c = t("../utils/fn.js")
          , p = o(c)
          , f = t("./track-enums")
          , h = t("../utils/log.js")
          , d = r(h)
          , y = t("global/window")
          , v = r(y)
          , g = t("./track.js")
          , m = r(g)
          , b = t("../utils/url.js")
          , _ = t("xhr")
          , j = r(_)
          , w = t("../utils/merge-options")
          , T = r(w)
          , k = t("../utils/browser.js")
          , E = o(k)
          , C = function(t, e) {
        var n = new v["default"].WebVTT.Parser(v["default"],v["default"].vttjs,v["default"].WebVTT.StringDecoder())
            , o = [];
        n.oncue = function(t) {
          e.addCue(t)
        }
            ,
            n.onparsingerror = function(t) {
              o.push(t)
            }
            ,
            n.onflush = function() {
              e.trigger({
                type: "loadeddata",
                target: e
              })
            }
            ,
            n.parse(t),
        o.length > 0 && (v["default"].console && v["default"].console.groupCollapsed && v["default"].console.groupCollapsed("Text Track parsing errors for " + e.src),
            o.forEach(function(t) {
              return d["default"].error(t)
            }),
        v["default"].console && v["default"].console.groupEnd && v["default"].console.groupEnd()),
            n.flush()
      }
          , O = function(t) {
        var e = /^(?:\s)*((?:\d{2}:)+\d{2}),(\d{3})(?:\s)*-->(?:\s)*((?:\d{2}:)+\d{2}),(\d{3})(?:\s)*$/gim;
        return -1 === t.indexOf("WEBVTT") && (t = t.replace(e, "$1.$2 --> $3.$4"),
            t = "WEBVTT\r\n\r\n" + t),
            t
      }
          , S = function(t, e) {
        var n = {
          uri: t
        }
            , o = b.isCrossOrigin(t);
        o && (n.cors = o),
            j["default"](n, p.bind(this, function(t, n, o) {
              return t ? d["default"].error(t, n) : (o = O(o),
                  e.loaded_ = !0,
                  void ("function" != typeof v["default"].WebVTT ? e.tech_ && !function() {
                    var t = function() {
                      return C(o, e)
                    };
                    e.tech_.on("vttjsloaded", t),
                        e.tech_.on("vttjserror", function() {
                          d["default"].error("vttjs failed to load, stopping trying to process " + e.src),
                              e.tech_.off("vttjsloaded", t)
                        })
                  }() : C(o, e)))
            }))
      }
          , x = function(t) {
        function e() {
          var n, o, r = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          if (i(this, e),
              !r.tech)
            throw new Error("A tech was not provided.");
          var a = T["default"](r, {
            kind: f.TextTrackKind[r.kind] || "subtitles",
            language: r.language || r.srclang || ""
          })
              , l = f.TextTrackMode[a.mode] || "disabled"
              , c = a["default"];
          ("metadata" === a.kind || "chapters" === a.kind) && (l = "hidden");
          var h = n = s(this, t.call(this, a));
          if (h.tech_ = a.tech,
              h.player_ = a.player,
              E.IS_IE8)
            for (var d in e.prototype)
              "constructor" !== d && (h[d] = e.prototype[d]);
          h.cues_ = [],
              h.activeCues_ = [];
          var y = new u["default"](h.cues_)
              , v = new u["default"](h.activeCues_)
              , g = !1
              , m = p.bind(h, function() {
            this.activeCues,
            g && (this.trigger("cuechange"),
                g = !1)
          });
          return "disabled" !== l && h.tech_.on("timeupdate", m),
              Object.defineProperty(h, "default", {
                get: function() {
                  return c
                },
                set: function() {}
              }),
              Object.defineProperty(h, "mode", {
                get: function() {
                  return l
                },
                set: function(t) {
                  f.TextTrackMode[t] && (l = t,
                  "showing" === l && this.tech_.on("timeupdate", m),
                      this.trigger("modechange"))
                }
              }),
              Object.defineProperty(h, "cues", {
                get: function() {
                  return this.loaded_ ? y : null
                },
                set: function() {}
              }),
              Object.defineProperty(h, "activeCues", {
                get: function() {
                  if (!this.loaded_)
                    return null;
                  if (0 === this.cues.length)
                    return v;
                  var t = this.tech_.currentTime()
                      , e = this.player_.textTrackSettings.getTimeAjust() || 0
                      , n = [];
                  t += e;
                  for (var o = 0, r = this.cues.length; r > o; o++) {
                    var i = this.cues[o];
                    i.startTime <= t && i.endTime >= t ? n.push(i) : i.startTime === i.endTime && i.startTime <= t && i.startTime + .5 >= t && n.push(i)
                  }
                  if (g = !1,
                  n.length !== this.activeCues_.length)
                    g = !0;
                  else
                    for (var s = 0; s < n.length; s++)
                      -1 === this.activeCues_.indexOf(n[s]) && (g = !0);
                  return this.activeCues_ = n,
                      v.setCues_(this.activeCues_),
                      v
                },
                set: function() {}
              }),
              a.src ? (h.src = a.src,
                  S(a.src, h)) : h.loaded_ = !0,
              o = h,
              s(n, o)
        }
        return a(e, t),
            e.prototype.addCue = function(t) {
              var e = this.tech_.textTracks();
              if (e)
                for (var n = 0; n < e.length; n++)
                  e[n] !== this && e[n].removeCue(t);
              this.cues_.push(t),
                  this.cues.setCues_(this.cues_)
            }
            ,
            e.prototype.removeCue = function(t) {
              for (var e = !1, n = 0, o = this.cues_.length; o > n; n++) {
                var r = this.cues_[n];
                r === t && (this.cues_.splice(n, 1),
                    e = !0)
              }
              e && this.cues.setCues_(this.cues_)
            }
            ,
            e
      }(m["default"]);
      x.prototype.allowedEvents_ = {
        cuechange: "cuechange"
      },
          n["default"] = x
    }
      , {
        "../utils/browser.js": 82,
        "../utils/fn.js": 86,
        "../utils/log.js": 89,
        "../utils/merge-options": 90,
        "../utils/url.js": 94,
        "./text-track-cue-list": 71,
        "./track-enums": 77,
        "./track.js": 79,
        "global/window": 97,
        xhr: 151
      }],
    77: [function(t, e, n) {
      "use strict";
      n.__esModule = !0;
      n.VideoTrackKind = {
        alternative: "alternative",
        captions: "captions",
        main: "main",
        sign: "sign",
        subtitles: "subtitles",
        commentary: "commentary"
      },
          n.AudioTrackKind = {
            alternative: "alternative",
            descriptions: "descriptions",
            main: "main",
            "main-desc": "main-desc",
            translation: "translation",
            commentary: "commentary"
          },
          n.TextTrackKind = {
            subtitles: "subtitles",
            captions: "captions",
            descriptions: "descriptions",
            chapters: "chapters",
            metadata: "metadata"
          },
          n.TextTrackMode = {
            disabled: "disabled",
            hidden: "hidden",
            showing: "showing"
          }
    }
      , {}],
    78: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../event-target")
          , u = r(l)
          , c = t("../utils/browser.js")
          , p = o(c)
          , f = t("global/document")
          , h = r(f)
          , d = function(t) {
        function e() {
          var n, o = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
          i(this, e);
          var a = s(this, t.call(this));
          if (!r && (r = a,
              p.IS_IE8)) {
            r = h["default"].createElement("custom");
            for (var l in e.prototype)
              "constructor" !== l && (r[l] = e.prototype[l])
          }
          r.tracks_ = [],
              Object.defineProperty(r, "length", {
                get: function() {
                  return this.tracks_.length
                }
              });
          for (var u = 0; u < o.length; u++)
            r.addTrack_(o[u]);
          return n = r,
              s(a, n)
        }
        return a(e, t),
            e.prototype.addTrack_ = function(t) {
              var e = this.tracks_.length;
              "" + e in this || Object.defineProperty(this, e, {
                get: function() {
                  return this.tracks_[e]
                }
              }),
              -1 === this.tracks_.indexOf(t) && (this.tracks_.push(t),
                  this.trigger({
                    track: t,
                    type: "addtrack"
                  }))
            }
            ,
            e.prototype.removeTrack_ = function(t) {
              for (var e = void 0, n = 0, o = this.length; o > n; n++)
                if (this[n] === t) {
                  e = this[n],
                  e.off && e.off(),
                      this.tracks_.splice(n, 1);
                  break
                }
              e && this.trigger({
                track: e,
                type: "removetrack"
              })
            }
            ,
            e.prototype.getTrackById = function(t) {
              for (var e = null, n = 0, o = this.length; o > n; n++) {
                var r = this[n];
                if (r.id === t) {
                  e = r;
                  break
                }
              }
              return e
            }
            ,
            e
      }(u["default"]);
      d.prototype.allowedEvents_ = {
        change: "change",
        addtrack: "addtrack",
        removetrack: "removetrack"
      };
      for (var y in d.prototype.allowedEvents_)
        d.prototype["on" + y] = null;
      n["default"] = d
    }
      , {
        "../event-target": 45,
        "../utils/browser.js": 82,
        "global/document": 96
      }],
    79: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("../utils/browser.js")
          , u = r(l)
          , c = t("global/document")
          , p = o(c)
          , f = t("../utils/guid.js")
          , h = r(f)
          , d = t("../event-target")
          , y = o(d)
          , v = function(t) {
        function e() {
          var n, o = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          i(this, e);
          var r = s(this, t.call(this))
              , a = r;
          if (u.IS_IE8) {
            a = p["default"].createElement("custom");
            for (var l in e.prototype)
              "constructor" !== l && (a[l] = e.prototype[l])
          }
          var c = {
            id: o.id || "vjs_track_" + h.newGUID(),
            kind: o.kind || "",
            label: o.label || "",
            language: o.language || ""
          }
              , f = function(t) {
            Object.defineProperty(a, t, {
              get: function() {
                return c[t]
              },
              set: function() {}
            })
          };
          for (var d in c)
            f(d);
          return n = a,
              s(r, n)
        }
        return a(e, t),
            e
      }(y["default"]);
      n["default"] = v
    }
      , {
        "../event-target": 45,
        "../utils/browser.js": 82,
        "../utils/guid.js": 88,
        "global/document": 96
      }],
    80: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("./track-list")
          , u = r(l)
          , c = t("../utils/browser.js")
          , p = o(c)
          , f = t("global/document")
          , h = r(f)
          , d = function(t, e) {
        for (var n = 0; n < t.length; n++)
          e.id !== t[n].id && (t[n].selected = !1)
      }
          , y = function(t) {
        function e() {
          var n, o, r = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
          i(this, e);
          for (var a = void 0, l = r.length - 1; l >= 0; l--)
            if (r[l].selected) {
              d(r, r[l]);
              break
            }
          if (p.IS_IE8) {
            a = h["default"].createElement("custom");
            for (var c in u["default"].prototype)
              "constructor" !== c && (a[c] = u["default"].prototype[c]);
            for (var f in e.prototype)
              "constructor" !== f && (a[f] = e.prototype[f])
          }
          return a = n = s(this, t.call(this, r, a)),
              a.changing_ = !1,
              Object.defineProperty(a, "selectedIndex", {
                get: function() {
                  for (var t = 0; t < this.length; t++)
                    if (this[t].selected)
                      return t;
                  return -1
                },
                set: function() {}
              }),
              o = a,
              s(n, o)
        }
        return a(e, t),
            e.prototype.addTrack_ = function(e) {
              var n = this;
              e.selected && d(this, e),
                  t.prototype.addTrack_.call(this, e),
              e.addEventListener && e.addEventListener("selectedchange", function() {
                n.changing_ || (n.changing_ = !0,
                    d(n, e),
                    n.changing_ = !1,
                    n.trigger("change"))
              })
            }
            ,
            e.prototype.addTrack = function(t) {
              this.addTrack_(t)
            }
            ,
            e.prototype.removeTrack = function(e) {
              t.prototype.removeTrack_.call(this, e)
            }
            ,
            e
      }(u["default"]);
      n["default"] = y
    }
      , {
        "../utils/browser.js": 82,
        "./track-list": 78,
        "global/document": 96
      }],
    81: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        if (!(t instanceof e))
          throw new TypeError("Cannot call a class as a function")
      }
      function s(t, e) {
        if (!t)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
      }
      function a(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
      }
      n.__esModule = !0;
      var l = t("./track-enums")
          , u = t("./track")
          , c = r(u)
          , p = t("../utils/merge-options")
          , f = r(p)
          , h = t("../utils/browser.js")
          , d = o(h)
          , y = function(t) {
        function e() {
          var n, o, r = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          i(this, e);
          var a = f["default"](r, {
            kind: l.VideoTrackKind[r.kind] || ""
          })
              , u = n = s(this, t.call(this, a))
              , c = !1;
          if (d.IS_IE8)
            for (var p in e.prototype)
              "constructor" !== p && (u[p] = e.prototype[p]);
          return Object.defineProperty(u, "selected", {
            get: function() {
              return c
            },
            set: function(t) {
              "boolean" == typeof t && t !== c && (c = t,
                  this.trigger("selectedchange"))
            }
          }),
          a.selected && (u.selected = a.selected),
              o = u,
              s(n, o)
        }
        return a(e, t),
            e
      }(c["default"]);
      n["default"] = y
    }
      , {
        "../utils/browser.js": 82,
        "../utils/merge-options": 90,
        "./track": 79,
        "./track-enums": 77
      }],
    82: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      n.__esModule = !0,
          n.BACKGROUND_SIZE_SUPPORTED = n.TOUCH_ENABLED = n.IE_VERSION = n.IS_IE8 = n.IS_CHROME = n.IS_EDGE = n.IS_FIREFOX = n.IS_NATIVE_ANDROID = n.IS_OLD_ANDROID = n.ANDROID_VERSION = n.IS_ANDROID = n.IOS_VERSION = n.IS_IOS = n.IS_IPOD = n.IS_IPHONE = n.IS_IPAD = void 0;
      {
        var r = t("global/document")
            , i = o(r)
            , s = t("global/window")
            , a = o(s)
            , l = a["default"].navigator && a["default"].navigator.userAgent || ""
            , u = /AppleWebKit\/([\d.]+)/i.exec(l)
            , c = u ? parseFloat(u.pop()) : null
            , p = n.IS_IPAD = /iPad/i.test(l)
            , f = n.IS_IPHONE = /iPhone/i.test(l) && !p
            , h = n.IS_IPOD = /iPod/i.test(l)
            , d = (n.IS_IOS = f || p || h,
            n.IOS_VERSION = function() {
              var t = l.match(/OS (\d+)_/i);
              return t && t[1] ? t[1] : null
            }(),
            n.IS_ANDROID = /Android/i.test(l))
            , y = n.ANDROID_VERSION = function() {
          var t = l.match(/Android (\d+)(?:\.(\d+))?(?:\.(\d+))*/i);
          if (!t)
            return null;
          var e = t[1] && parseFloat(t[1])
              , n = t[2] && parseFloat(t[2]);
          return e && n ? parseFloat(t[1] + "." + t[2]) : e ? e : null
        }()
            , v = (n.IS_OLD_ANDROID = d && /webkit/i.test(l) && 2.3 > y,
            n.IS_NATIVE_ANDROID = d && 5 > y && 537 > c,
            n.IS_FIREFOX = /Firefox/i.test(l),
            n.IS_EDGE = /Edge/i.test(l));
        n.IS_CHROME = !v && /Chrome/i.test(l),
            n.IS_IE8 = /MSIE\s8\.0/.test(l),
            n.IE_VERSION = function(t) {
              return t && parseFloat(t[1])
            }(/MSIE\s(\d+)\.\d/.exec(l)),
            n.TOUCH_ENABLED = !!("ontouchstart"in a["default"] || a["default"].DocumentTouch && i["default"]instanceof a["default"].DocumentTouch),
            n.BACKGROUND_SIZE_SUPPORTED = "backgroundSize"in i["default"].createElement("video").style
      }
    }
      , {
        "global/document": 96,
        "global/window": 97
      }],
    83: [function(t, e, n) {
      "use strict";
      function o(t, e) {
        var n = 0
            , o = void 0
            , i = void 0;
        if (!e)
          return 0;
        t && t.length || (t = r.createTimeRange(0, 0));
        for (var s = 0; s < t.length; s++)
          o = t.start(s),
              i = t.end(s),
          i > e && (i = e),
              n += i - o;
        return n / e
      }
      n.__esModule = !0,
          n.bufferedPercent = o;
      var r = t("./time-ranges.js")
    }
      , {
        "./time-ranges.js": 92
      }],
    84: [function(t, e, n) {
      "use strict";
      function o(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function r(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function i(t, e) {
        return t.raw = e,
            t
      }
      function s(t) {
        return "string" == typeof t && /\S/.test(t)
      }
      function a(t) {
        if (/\s/.test(t))
          throw new Error("class has illegal whitespace characters")
      }
      function l(t) {
        return new RegExp("(^|\\s)" + t + "($|\\s)")
      }
      function u(t) {
        return !!t && "object" === ("undefined" == typeof t ? "undefined" : L(t)) && 1 === t.nodeType
      }
      function c(t) {
        return function(e, n) {
          if (!s(e))
            return B["default"][t](null);
          s(n) && (n = B["default"].querySelector(n));
          var o = u(n) ? n : B["default"];
          return o[t] && o[t](e)
        }
      }
      function p(t) {
        return 0 === t.indexOf("#") && (t = t.slice(1)),
            B["default"].getElementById(t)
      }
      function f() {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "div"
            , e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
            , n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}
            , o = B["default"].createElement(t);
        return Object.getOwnPropertyNames(e).forEach(function(t) {
          var n = e[t];
          -1 !== t.indexOf("aria-") || "role" === t || "type" === t ? (W["default"].warn(X["default"](N, t, n)),
              o.setAttribute(t, n)) : o[t] = n
        }),
            Object.getOwnPropertyNames(n).forEach(function(t) {
              o.setAttribute(t, n[t])
            }),
            o
      }
      function h(t, e) {
        "undefined" == typeof t.textContent ? t.innerText = e : t.textContent = e
      }
      function d(t) {
        var e = void 0;
        return e = "undefined" == typeof t.textContent ? t.innerText : t.textContent
      }
      function y(t, e) {
        e.firstChild ? e.insertBefore(t, e.firstChild) : e.appendChild(t)
      }
      function v(t) {
        var e = t[K];
        return e || (e = t[K] = z.newGUID()),
        q[e] || (q[e] = {}),
            q[e]
      }
      function g(t, e, n) {
        var o = v(t);
        return o[e] = n,
            o
      }
      function m(t) {
        var e = t[K];
        return e ? !!Object.getOwnPropertyNames(q[e]).length : !1
      }
      function b(t) {
        var e = t[K];
        if (e) {
          delete q[e];
          try {
            delete t[K]
          } catch (n) {
            t.removeAttribute ? t.removeAttribute(K) : t[K] = null
          }
        }
      }
      function _(t, e) {
        return t.classList ? t.classList.contains(e) : (a(e),
            l(e).test(t.className))
      }
      function j(t, e) {
        return t.classList ? t.classList.add(e) : _(t, e) || (t.className = (t.className + " " + e).trim()),
            t
      }
      function w(t, e) {
        return t.classList ? t.classList.remove(e) : (a(e),
            t.className = t.className.split(/\s+/).filter(function(t) {
              return t !== e
            }).join(" ")),
            t
      }
      function T(t, e, n) {
        var o = _(t, e);
        return "function" == typeof n && (n = n(t, e)),
        "boolean" != typeof n && (n = !o),
            n !== o ? (n ? j(t, e) : w(t, e),
                t) : void 0
      }
      function k(t, e) {
        Object.getOwnPropertyNames(e).forEach(function(n) {
          var o = e[n];
          null === o || "undefined" == typeof o || o === !1 ? t.removeAttribute(n) : t.setAttribute(n, o === !0 ? "" : o)
        })
      }
      function E(t) {
        var e = {}
            , n = ",autoplay,controls,loop,muted,default,";
        if (t && t.attributes && t.attributes.length > 0)
          for (var o = t.attributes, r = o.length - 1; r >= 0; r--) {
            var i = o[r].name
                , s = o[r].value;
            ("boolean" == typeof t[i] || -1 !== n.indexOf("," + i + ",")) && (s = null !== s ? !0 : !1),
                e[i] = s
          }
        return e
      }
      function C() {
        B["default"].body.focus(),
            B["default"].onselectstart = function() {
              return !1
            }
      }
      function O() {
        B["default"].onselectstart = function() {
          return !0
        }
      }
      function S(t) {
        var e = void 0;
        if (t.getBoundingClientRect && t.parentNode && (e = t.getBoundingClientRect()),
            !e)
          return {
            left: 0,
            top: 0
          };
        var n = B["default"].documentElement
            , o = B["default"].body
            , r = n.clientLeft || o.clientLeft || 0
            , i = V["default"].pageXOffset || o.scrollLeft
            , s = e.left + i - r
            , a = n.clientTop || o.clientTop || 0
            , l = V["default"].pageYOffset || o.scrollTop
            , u = e.top + l - a;
        return {
          left: Math.round(s),
          top: Math.round(u)
        }
      }
      function x(t, e) {
        var n = {}
            , o = S(t)
            , r = t.offsetWidth
            , i = t.offsetHeight
            , s = o.top
            , a = o.left
            , l = e.pageY
            , u = e.pageX;
        return e.changedTouches && (u = e.changedTouches[0].pageX,
            l = e.changedTouches[0].pageY),
            n.y = Math.max(0, Math.min(1, (s - l + i) / i)),
            n.x = Math.max(0, Math.min(1, (u - a) / r)),
            n
      }
      function P(t) {
        return !!t && "object" === ("undefined" == typeof t ? "undefined" : L(t)) && 3 === t.nodeType
      }
      function M(t) {
        for (; t.firstChild; )
          t.removeChild(t.firstChild);
        return t
      }
      function A(t) {
        return "function" == typeof t && (t = t()),
            (Array.isArray(t) ? t : [t]).map(function(t) {
              return "function" == typeof t && (t = t()),
                  u(t) || P(t) ? t : "string" == typeof t && /\S/.test(t) ? B["default"].createTextNode(t) : void 0
            }).filter(function(t) {
              return t
            })
      }
      function I(t, e) {
        return A(e).forEach(function(e) {
          return t.appendChild(e)
        }),
            t
      }
      function D(t, e) {
        return I(M(t), e)
      }
      function R(t, e) {
        var n = B["default"].documentElement
            , o = void 0;
        return (o = /^[^{]+\{\s*\[native \w/.test(n.contains) || n.compareDocumentPosition ? function(t, e) {
                  var n = 9 === t.nodeType ? t.documentElement : t
                      , o = e && e.parentNode;
                  return t === o || !(!o || 1 !== o.nodeType || !(n.contains ? n.contains(o) : t.compareDocumentPosition && 16 & t.compareDocumentPosition(o)))
                }
                : function(t, e) {
                  if (e)
                    for (; e = e.parentNode; )
                      if (e === t)
                        return !0;
                  return !1
                }
        )(t, e)
      }
      n.__esModule = !0,
          n.$$ = n.$ = void 0;
      var L = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
          }
          : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
          }
          , N = i(["Setting attributes in the second argument of createEl()\n                has been deprecated. Use the third argument instead.\n                createEl(type, properties, attributes). Attempting to set ", " to ", "."], ["Setting attributes in the second argument of createEl()\n                has been deprecated. Use the third argument instead.\n                createEl(type, properties, attributes). Attempting to set ", " to ", "."]);
      n.isEl = u,
          n.getEl = p,
          n.createEl = f,
          n.textContent = h,
          n.textContentGet = d,
          n.insertElFirst = y,
          n.getElData = v,
          n.setElData = g,
          n.hasElData = m,
          n.removeElData = b,
          n.hasElClass = _,
          n.addElClass = j,
          n.removeElClass = w,
          n.toggleElClass = T,
          n.setElAttributes = k,
          n.getElAttributes = E,
          n.blockTextSelection = C,
          n.unblockTextSelection = O,
          n.findElPosition = S,
          n.getPointerPosition = x,
          n.isTextNode = P,
          n.emptyEl = M,
          n.normalizeContent = A,
          n.appendContent = I,
          n.insertContent = D,
          n.contains = R;
      {
        var F = t("global/document")
            , B = r(F)
            , H = t("global/window")
            , V = r(H)
            , $ = t("./guid.js")
            , z = o($)
            , U = t("./log.js")
            , W = r(U)
            , G = t("tsml")
            , X = r(G)
            , q = {}
            , K = "vdata" + (new Date).getTime();
        n.$ = c("querySelector"),
            n.$$ = c("querySelectorAll")
      }
    }
      , {
        "./guid.js": 88,
        "./log.js": 89,
        "global/document": 96,
        "global/window": 97,
        tsml: 150
      }],
    85: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function i(t, e) {
        var n = h.getElData(t);
        0 === n.handlers[e].length && (delete n.handlers[e],
            t.removeEventListener ? t.removeEventListener(e, n.dispatcher, !1) : t.detachEvent && t.detachEvent("on" + e, n.dispatcher)),
        Object.getOwnPropertyNames(n.handlers).length <= 0 && (delete n.handlers,
            delete n.dispatcher,
            delete n.disabled),
        0 === Object.getOwnPropertyNames(n).length && h.removeElData(t)
      }
      function s(t, e, n, o) {
        n.forEach(function(n) {
          t(e, n, o)
        })
      }
      function a(t) {
        function e() {
          return !0
        }
        function n() {
          return !1
        }
        return t && t.isPropagationStopped || !function() {
          var o = t || b["default"].event;
          t = {};
          for (var r in o)
            "layerX" !== r && "layerY" !== r && "keyLocation" !== r && "webkitMovementX" !== r && "webkitMovementY" !== r && ("returnValue" === r && o.preventDefault || (t[r] = o[r]));
          if (t.target || (t.target = t.srcElement || j["default"]),
          t.relatedTarget || (t.relatedTarget = t.fromElement === t.target ? t.toElement : t.fromElement),
              t.preventDefault = function() {
                o.preventDefault && o.preventDefault(),
                    t.returnValue = !1,
                    o.returnValue = !1,
                    t.defaultPrevented = !0
              }
              ,
              t.defaultPrevented = !1,
              t.stopPropagation = function() {
                o.stopPropagation && o.stopPropagation(),
                    t.cancelBubble = !0,
                    o.cancelBubble = !0,
                    t.isPropagationStopped = e
              }
              ,
              t.isPropagationStopped = n,
              t.stopImmediatePropagation = function() {
                o.stopImmediatePropagation && o.stopImmediatePropagation(),
                    t.isImmediatePropagationStopped = e,
                    t.stopPropagation()
              }
              ,
              t.isImmediatePropagationStopped = n,
          null !== t.clientX && void 0 !== t.clientX) {
            var i = j["default"].documentElement
                , s = j["default"].body;
            t.pageX = t.clientX + (i && i.scrollLeft || s && s.scrollLeft || 0) - (i && i.clientLeft || s && s.clientLeft || 0),
                t.pageY = t.clientY + (i && i.scrollTop || s && s.scrollTop || 0) - (i && i.clientTop || s && s.clientTop || 0)
          }
          t.which = t.charCode || t.keyCode,
          null !== t.button && void 0 !== t.button && (t.button = 1 & t.button ? 0 : 4 & t.button ? 1 : 2 & t.button ? 2 : 0)
        }(),
            t
      }
      function l(t, e, n) {
        if (Array.isArray(e))
          return s(l, t, e, n);
        var o = h.getElData(t);
        o.handlers || (o.handlers = {}),
        o.handlers[e] || (o.handlers[e] = []),
        n.guid || (n.guid = y.newGUID()),
            o.handlers[e].push(n),
        o.dispatcher || (o.disabled = !1,
                o.dispatcher = function(e, n) {
                  if (!o.disabled) {
                    e = a(e);
                    var r = o.handlers[e.type];
                    if (r)
                      for (var i = r.slice(0), s = 0, l = i.length; l > s && !e.isImmediatePropagationStopped(); s++)
                        try {
                          i[s].call(t, e, n)
                        } catch (u) {
                          g["default"].error(u)
                        }
                  }
                }
        ),
        1 === o.handlers[e].length && (t.addEventListener ? t.addEventListener(e, o.dispatcher, !1) : t.attachEvent && t.attachEvent("on" + e, o.dispatcher))
      }
      function u(t, e, n) {
        if (h.hasElData(t)) {
          var o = h.getElData(t);
          if (o.handlers) {
            if (Array.isArray(e))
              return s(u, t, e, n);
            var r = function(e) {
              o.handlers[e] = [],
                  i(t, e)
            };
            if (e) {
              var a = o.handlers[e];
              if (a) {
                if (!n)
                  return void r(e);
                if (n.guid)
                  for (var l = 0; l < a.length; l++)
                    a[l].guid === n.guid && a.splice(l--, 1);
                i(t, e)
              }
            } else
              for (var c in o.handlers)
                r(c)
          }
        }
      }
      function c(t, e, n) {
        var o = h.hasElData(t) ? h.getElData(t) : {}
            , r = t.parentNode || t.ownerDocument;
        if ("string" == typeof e && (e = {
          type: e,
          target: t
        }),
            e = a(e),
        o.dispatcher && o.dispatcher.call(t, e, n),
        r && !e.isPropagationStopped() && e.bubbles === !0)
          c.call(null, r, e, n);
        else if (!r && !e.defaultPrevented) {
          var i = h.getElData(e.target);
          e.target[e.type] && (i.disabled = !0,
          "function" == typeof e.target[e.type] && e.target[e.type](),
              i.disabled = !1)
        }
        return !e.defaultPrevented
      }
      function p(t, e, n) {
        if (Array.isArray(e))
          return s(p, t, e, n);
        var o = function r() {
          u(t, e, r),
              n.apply(this, arguments)
        };
        o.guid = n.guid = n.guid || y.newGUID(),
            l(t, e, o)
      }
      n.__esModule = !0,
          n.fixEvent = a,
          n.on = l,
          n.off = u,
          n.trigger = c,
          n.one = p;
      var f = t("./dom.js")
          , h = r(f)
          , d = t("./guid.js")
          , y = r(d)
          , v = t("./log.js")
          , g = o(v)
          , m = t("global/window")
          , b = o(m)
          , _ = t("global/document")
          , j = o(_)
    }
      , {
        "./dom.js": 84,
        "./guid.js": 88,
        "./log.js": 89,
        "global/document": 96,
        "global/window": 97
      }],
    86: [function(t, e, n) {
      "use strict";
      n.__esModule = !0,
          n.bind = void 0;
      {
        var o = t("./guid.js");
        n.bind = function(t, e, n) {
          e.guid || (e.guid = o.newGUID());
          var r = function() {
            return e.apply(t, arguments)
          };
          return r.guid = n ? n + "_" + e.guid : e.guid,
              r
        }
      }
    }
      , {
        "./guid.js": 88
      }],
    87: [function(t, e, n) {
      "use strict";
      function o(t) {
        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : t;
        t = 0 > t ? 0 : t;
        var n = Math.floor(t % 60)
            , o = Math.floor(t / 60 % 60)
            , r = Math.floor(t / 3600)
            , i = Math.floor(e / 60 % 60)
            , s = Math.floor(e / 3600);
        return (isNaN(t) || 1 / 0 === t) && (r = o = n = "-"),
            r = r > 0 || s > 0 ? r + ":" : "",
            o = ((r || i >= 10) && 10 > o ? "0" + o : o) + ":",
            n = 10 > n ? "0" + n : n,
        r + o + n
      }
      n.__esModule = !0,
          n["default"] = o
    }
      , {}],
    88: [function(t, e, n) {
      "use strict";
      function o() {
        return r++
      }
      n.__esModule = !0,
          n.newGUID = o;
      var r = 1
    }
      , {}],
    89: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      n.__esModule = !0,
          n.logByType = void 0;
      var r = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
          }
          : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
          }
          , i = t("global/window")
          , s = o(i)
          , a = t("./browser")
          , l = void 0
          , u = n.logByType = function(t, e) {
            var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : !!a.IE_VERSION && a.IE_VERSION < 11
                , o = s["default"].console && s["default"].console[t] || function() {}
            ;
            "log" !== t && e.unshift(t.toUpperCase() + ":"),
                l.history.push(e),
                e.unshift("VIDEOJS:"),
            n && (e = e.map(function(t) {
              if (t && "object" === ("undefined" == typeof t ? "undefined" : r(t)) || Array.isArray(t))
                try {
                  return JSON.stringify(t)
                } catch (e) {
                  return String(t)
                }
              return String(t)
            }).join(" ")),
                o.apply ? o[Array.isArray(e) ? "apply" : "call"](console, e) : o(e)
          }
      ;
      l = function() {
        for (var t = arguments.length, e = Array(t), n = 0; t > n; n++)
          e[n] = arguments[n];
        u("log", e)
      }
          ,
          l.history = [],
          l.error = function() {
            for (var t = arguments.length, e = Array(t), n = 0; t > n; n++)
              e[n] = arguments[n];
            return u("error", e)
          }
          ,
          l.warn = function() {
            for (var t = arguments.length, e = Array(t), n = 0; t > n; n++)
              e[n] = arguments[n];
            return u("warn", e)
          }
          ,
          n["default"] = l
    }
      , {
        "./browser": 82,
        "global/window": 97
      }],
    90: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t) {
        return !!t && "object" === ("undefined" == typeof t ? "undefined" : a(t)) && "[object Object]" === t.toString() && t.constructor === Object
      }
      function i(t, e) {
        return r(e) ? r(t) ? void 0 : s(e) : e
      }
      function s() {
        var t = Array.prototype.slice.call(arguments);
        return t.unshift({}),
            t.push(i),
            u["default"].apply(null, t),
            t[0]
      }
      n.__esModule = !0;
      var a = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
          }
          : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
          }
      ;
      n["default"] = s;
      var l = t("lodash-compat/object/merge")
          , u = o(l)
    }
      , {
        "lodash-compat/object/merge": 135
      }],
    91: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      n.__esModule = !0,
          n.setTextContent = n.createStyleElement = void 0;
      {
        var r = t("global/document")
            , i = o(r);
        n.createStyleElement = function(t) {
          var e = i["default"].createElement("style");
          return e.className = t,
              e
        }
            ,
            n.setTextContent = function(t, e) {
              t.styleSheet ? t.styleSheet.cssText = e : t.textContent = e
            }
      }
    }
      , {
        "global/document": 96
      }],
    92: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function r(t, e, n) {
        if (0 > e || e > n)
          throw new Error("Failed to execute '" + t + "' on 'TimeRanges': The index provided (" + e + ") is greater than or equal to the maximum bound (" + n + ").")
      }
      function i(t, e, n, o) {
        return void 0 === o && (u["default"].warn("DEPRECATED: Function '" + t + "' on 'TimeRanges' called without an index argument."),
            o = 0),
            r(t, o, n.length - 1),
            n[o][e]
      }
      function s(t) {
        return void 0 === t || 0 === t.length ? {
          length: 0,
          start: function() {
            throw new Error("This TimeRanges object is empty")
          },
          end: function() {
            throw new Error("This TimeRanges object is empty")
          }
        } : {
          length: t.length,
          start: i.bind(null, "start", 0, t),
          end: i.bind(null, "end", 1, t)
        }
      }
      function a(t, e) {
        return Array.isArray(t) ? s(t) : void 0 === t || void 0 === e ? s() : s([[t, e]])
      }
      n.__esModule = !0,
          n.createTimeRange = void 0,
          n.createTimeRanges = a;
      var l = t("./log.js")
          , u = o(l);
      n.createTimeRange = a
    }
      , {
        "./log.js": 89
      }],
    93: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t.charAt(0).toUpperCase() + t.slice(1)
      }
      n.__esModule = !0,
          n["default"] = o
    }
      , {}],
    94: [function(t, e, n) {
      "use strict";
      function o(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      n.__esModule = !0,
          n.isCrossOrigin = n.getFileExtension = n.getAbsoluteURL = n.parseUrl = void 0;
      {
        var r = t("global/document")
            , i = o(r)
            , s = t("global/window")
            , a = o(s)
            , l = n.parseUrl = function(t) {
              var e = ["protocol", "hostname", "port", "pathname", "search", "hash", "host"]
                  , n = i["default"].createElement("a");
              n.href = t;
              var o = "" === n.host && "file:" !== n.protocol
                  , r = void 0;
              o && (r = i["default"].createElement("div"),
                  r.innerHTML = '<a href="' + t + '"></a>',
                  n = r.firstChild,
                  r.setAttribute("style", "display:none; position:absolute;"),
                  i["default"].body.appendChild(r));
              for (var s = {}, a = 0; a < e.length; a++)
                s[e[a]] = n[e[a]];
              return "http:" === s.protocol && (s.host = s.host.replace(/:80$/, "")),
              "https:" === s.protocol && (s.host = s.host.replace(/:443$/, "")),
              o && i["default"].body.removeChild(r),
                  s
            }
        ;
        n.getAbsoluteURL = function(t) {
          if (!t.match(/^https?:\/\//)) {
            var e = i["default"].createElement("div");
            e.innerHTML = '<a href="' + t + '">x</a>',
                t = e.firstChild.href
          }
          return t
        }
            ,
            n.getFileExtension = function(t) {
              if ("string" == typeof t) {
                var e = /^(\/?)([\s\S]*?)((?:\.{1,2}|[^\/]+?)(\.([^\.\/\?]+)))(?:[\/]*|[\?].*)$/i
                    , n = e.exec(t);
                if (n)
                  return n.pop().toLowerCase()
              }
              return ""
            }
            ,
            n.isCrossOrigin = function(t) {
              var e = a["default"].location
                  , n = l(t)
                  , o = ":" === n.protocol ? e.protocol : n.protocol
                  , r = o + n.host !== e.protocol + e.host;
              return r
            }
      }
    }
      , {
        "global/document": 96,
        "global/window": 97
      }],
    95: [function(e, n, o) {
      "use strict";
      function r(t) {
        if (t && t.__esModule)
          return t;
        var e = {};
        if (null != t)
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        return e["default"] = t,
            e
      }
      function i(t) {
        return t && t.__esModule ? t : {
          "default": t
        }
      }
      function s(t, e, n) {
        var o = void 0;
        if ("string" == typeof t ? (0 === t.indexOf("#") && (t = t.slice(1)),
            o = $.getEl(t)) : o = t,
        !o || !o.nodeName)
          throw new TypeError("The element or ID supplied is not valid. (videojs)");
        return o.player || T["default"].players[o.playerId] || new T["default"](o,e,n)
      }
      o.__esModule = !0;
      var a = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
          }
          : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
          }
          , l = e("global/window")
          , u = i(l)
          , c = e("global/document")
          , p = i(c)
          , f = e("./setup")
          , h = r(f)
          , d = e("./utils/stylesheet.js")
          , y = r(d)
          , v = e("./component")
          , g = i(v)
          , m = e("./event-target")
          , b = i(m)
          , _ = e("./utils/events.js")
          , j = r(_)
          , w = e("./player")
          , T = i(w)
          , k = e("./plugins.js")
          , E = i(k)
          , C = e("./utils/merge-options.js")
          , O = i(C)
          , S = e("./utils/fn.js")
          , x = r(S)
          , P = e("./tracks/text-track.js")
          , M = i(P)
          , A = e("./tracks/audio-track.js")
          , I = i(A)
          , D = e("./tracks/video-track.js")
          , R = i(D)
          , L = e("./utils/time-ranges.js")
          , N = e("./utils/format-time.js")
          , F = i(N)
          , B = e("./utils/log.js")
          , H = i(B)
          , V = e("./utils/dom.js")
          , $ = r(V)
          , z = e("./utils/browser.js")
          , U = r(z)
          , W = e("./utils/url.js")
          , G = r(W)
          , X = e("./extend.js")
          , q = i(X)
          , K = e("lodash-compat/object/merge")
          , Y = i(K)
          , J = e("xhr")
          , Q = i(J)
          , Z = e("./tech/tech.js")
          , te = i(Z);
      if ("undefined" == typeof HTMLVideoElement && (p["default"].createElement("video"),
          p["default"].createElement("audio"),
          p["default"].createElement("track")),
      u["default"].VIDEOJS_NO_DYNAMIC_STYLE !== !0) {
        var ee = $.$(".vjs-styles-defaults");
        if (!ee) {
          ee = y.createStyleElement("vjs-styles-defaults");
          var ne = $.$("head");
          ne && ne.insertBefore(ee, ne.firstChild),
              y.setTextContent(ee, "\n      .video-js {\n        width: 300px;\n        height: 150px;\n      }\n\n      .vjs-fluid {\n        padding-top: 56.25%\n      }\n    ")
        }
      }
      h.autoSetupTimeout(1, s),
          s.VERSION = "5.12.1",
          s.options = T["default"].prototype.options_,
          s.getPlayers = function() {
            return T["default"].players
          }
          ,
          s.players = T["default"].players,
          s.getComponent = g["default"].getComponent,
          s.registerComponent = function(t, e) {
            te["default"].isTech(e) && H["default"].warn("The " + t + " tech was registered as a component. It should instead be registered using videojs.registerTech(name, tech)"),
                g["default"].registerComponent.call(g["default"], t, e)
          }
          ,
          s.getTech = te["default"].getTech,
          s.registerTech = te["default"].registerTech,
          s.browser = U,
          s.TOUCH_ENABLED = U.TOUCH_ENABLED,
          s.extend = q["default"],
          s.mergeOptions = O["default"],
          s.bind = x.bind,
          s.plugin = E["default"],
          s.addLanguage = function(t, e) {
            var n;
            return t = ("" + t).toLowerCase(),
                Y["default"](s.options.languages, (n = {},
                    n[t] = e,
                    n))[t]
          }
          ,
          s.log = H["default"],
          s.createTimeRange = s.createTimeRanges = L.createTimeRanges,
          s.formatTime = F["default"],
          s.parseUrl = G.parseUrl,
          s.isCrossOrigin = G.isCrossOrigin,
          s.EventTarget = b["default"],
          s.on = j.on,
          s.one = j.one,
          s.off = j.off,
          s.trigger = j.trigger,
          s.xhr = Q["default"],
          s.TextTrack = M["default"],
          s.AudioTrack = I["default"],
          s.VideoTrack = R["default"],
          s.isEl = $.isEl,
          s.isTextNode = $.isTextNode,
          s.createEl = $.createEl,
          s.hasClass = $.hasElClass,
          s.addClass = $.addElClass,
          s.removeClass = $.removeElClass,
          s.toggleClass = $.toggleElClass,
          s.setAttributes = $.setElAttributes,
          s.getAttributes = $.getElAttributes,
          s.emptyEl = $.emptyEl,
          s.appendContent = $.appendContent,
          s.insertContent = $.insertContent,
          "function" == typeof t && t.amd ? t("videoPlayer", [], function() {
            return s
          }) : "object" === ("undefined" == typeof o ? "undefined" : a(o)) && "object" === ("undefined" == typeof n ? "undefined" : a(n)) && (n.exports = s),
          o["default"] = s
    }
      , {
        "./component": 5,
        "./event-target": 45,
        "./extend.js": 46,
        "./player": 54,
        "./plugins.js": 55,
        "./setup": 59,
        "./tech/tech.js": 65,
        "./tracks/audio-track.js": 67,
        "./tracks/text-track.js": 76,
        "./tracks/video-track.js": 81,
        "./utils/browser.js": 82,
        "./utils/dom.js": 84,
        "./utils/events.js": 85,
        "./utils/fn.js": 86,
        "./utils/format-time.js": 87,
        "./utils/log.js": 89,
        "./utils/merge-options.js": 90,
        "./utils/stylesheet.js": 91,
        "./utils/time-ranges.js": 92,
        "./utils/url.js": 94,
        "global/document": 96,
        "global/window": 97,
        "lodash-compat/object/merge": 135,
        xhr: 151
      }],
    96: [function(t, e) {
      (function(n) {
            var o = "undefined" != typeof n ? n : "undefined" != typeof window ? window : {}
                , r = t("min-document");
            if ("undefined" != typeof document)
              e.exports = document;
            else {
              var i = o["__GLOBAL_DOCUMENT_CACHE@4"];
              i || (i = o["__GLOBAL_DOCUMENT_CACHE@4"] = r),
                  e.exports = i
            }
          }
      ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }
      , {
        "min-document": 98
      }],
    97: [function(t, e) {
      (function(t) {
            e.exports = "undefined" != typeof window ? window : "undefined" != typeof t ? t : "undefined" != typeof self ? self : {}
          }
      ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }
      , {}],
    98: [function() {}
      , {}],
    99: [function(t, e) {
      var n = t("../internal/getNative")
          , o = n(Date, "now")
          , r = o || function() {
            return (new Date).getTime()
          }
      ;
      e.exports = r
    }
      , {
        "../internal/getNative": 115
      }],
    100: [function(t, e) {
      function n(t, e, n) {
        function a() {
          g && clearTimeout(g),
          h && clearTimeout(h),
              b = 0,
              h = g = m = void 0
        }
        function l(e, n) {
          n && clearTimeout(n),
              h = g = m = void 0,
          e && (b = r(),
              d = t.apply(v, f),
          g || h || (f = v = void 0))
        }
        function u() {
          var t = e - (r() - y);
          0 >= t || t > e ? l(m, h) : g = setTimeout(u, t)
        }
        function c() {
          l(j, g)
        }
        function p() {
          if (f = arguments,
              y = r(),
              v = this,
              m = j && (g || !w),
          _ === !1)
            var n = w && !g;
          else {
            h || w || (b = y);
            var o = _ - (y - b)
                , i = 0 >= o || o > _;
            i ? (h && (h = clearTimeout(h)),
                b = y,
                d = t.apply(v, f)) : h || (h = setTimeout(c, o))
          }
          return i && g ? g = clearTimeout(g) : g || e === _ || (g = setTimeout(u, e)),
          n && (i = !0,
              d = t.apply(v, f)),
          !i || g || h || (f = v = void 0),
              d
        }
        var f, h, d, y, v, g, m, b = 0, _ = !1, j = !0;
        if ("function" != typeof t)
          throw new TypeError(i);
        if (e = 0 > e ? 0 : +e || 0,
        n === !0) {
          var w = !0;
          j = !1
        } else
          o(n) && (w = !!n.leading,
              _ = "maxWait"in n && s(+n.maxWait || 0, e),
              j = "trailing"in n ? !!n.trailing : j);
        return p.cancel = a,
            p
      }
      var o = t("../lang/isObject")
          , r = t("../date/now")
          , i = "Expected a function"
          , s = Math.max;
      e.exports = n
    }
      , {
        "../date/now": 99,
        "../lang/isObject": 128
      }],
    101: [function(t, e) {
      function n(t, e) {
        if ("function" != typeof t)
          throw new TypeError(o);
        return e = r(void 0 === e ? t.length - 1 : +e || 0, 0),
            function() {
              for (var n = arguments, o = -1, i = r(n.length - e, 0), s = Array(i); ++o < i; )
                s[o] = n[e + o];
              switch (e) {
                case 0:
                  return t.call(this, s);
                case 1:
                  return t.call(this, n[0], s);
                case 2:
                  return t.call(this, n[0], n[1], s)
              }
              var a = Array(e + 1);
              for (o = -1; ++o < e; )
                a[o] = n[o];
              return a[e] = s,
                  t.apply(this, a)
            }
      }
      var o = "Expected a function"
          , r = Math.max;
      e.exports = n
    }
      , {}],
    102: [function(t, e) {
      function n(t, e, n) {
        var s = !0
            , a = !0;
        if ("function" != typeof t)
          throw new TypeError(i);
        return n === !1 ? s = !1 : r(n) && (s = "leading"in n ? !!n.leading : s,
            a = "trailing"in n ? !!n.trailing : a),
            o(t, e, {
              leading: s,
              maxWait: +e,
              trailing: a
            })
      }
      var o = t("./debounce")
          , r = t("../lang/isObject")
          , i = "Expected a function";
      e.exports = n
    }
      , {
        "../lang/isObject": 128,
        "./debounce": 100
      }],
    103: [function(t, e) {
      function n(t, e) {
        var n = -1
            , o = t.length;
        for (e || (e = Array(o)); ++n < o; )
          e[n] = t[n];
        return e
      }
      e.exports = n
    }
      , {}],
    104: [function(t, e) {
      function n(t, e) {
        for (var n = -1, o = t.length; ++n < o && e(t[n], n, t) !== !1; )
          ;
        return t
      }
      e.exports = n
    }
      , {}],
    105: [function(t, e) {
      function n(t, e, n) {
        n || (n = {});
        for (var o = -1, r = e.length; ++o < r; ) {
          var i = e[o];
          n[i] = t[i]
        }
        return n
      }
      e.exports = n
    }
      , {}],
    106: [function(t, e) {
      var n = t("./createBaseFor")
          , o = n();
      e.exports = o
    }
      , {
        "./createBaseFor": 113
      }],
    107: [function(t, e) {
      function n(t, e) {
        return o(t, e, r)
      }
      var o = t("./baseFor")
          , r = t("../object/keysIn");
      e.exports = n
    }
      , {
        "../object/keysIn": 134,
        "./baseFor": 106
      }],
    108: [function(t, e) {
      function n(t, e, p, f, h) {
        if (!a(t))
          return t;
        var d = s(e) && (i(e) || u(e))
            , y = d ? void 0 : c(e);
        return o(y || e, function(o, i) {
          if (y && (i = o,
              o = e[i]),
              l(o))
            f || (f = []),
            h || (h = []),
                r(t, e, i, n, p, f, h);
          else {
            var s = t[i]
                , a = p ? p(s, o, i, t, e) : void 0
                , u = void 0 === a;
            u && (a = o),
            void 0 === a && (!d || i in t) || !u && (a === a ? a === s : s !== s) || (t[i] = a)
          }
        }),
            t
      }
      var o = t("./arrayEach")
          , r = t("./baseMergeDeep")
          , i = t("../lang/isArray")
          , s = t("./isArrayLike")
          , a = t("../lang/isObject")
          , l = t("./isObjectLike")
          , u = t("../lang/isTypedArray")
          , c = t("../object/keys");
      e.exports = n
    }
      , {
        "../lang/isArray": 125,
        "../lang/isObject": 128,
        "../lang/isTypedArray": 131,
        "../object/keys": 133,
        "./arrayEach": 104,
        "./baseMergeDeep": 109,
        "./isArrayLike": 116,
        "./isObjectLike": 121
      }],
    109: [function(t, e) {
      function n(t, e, n, c, p, f, h) {
        for (var d = f.length, y = e[n]; d--; )
          if (f[d] == y)
            return void (t[n] = h[d]);
        var v = t[n]
            , g = p ? p(v, y, n, t, e) : void 0
            , m = void 0 === g;
        m && (g = y,
            s(y) && (i(y) || l(y)) ? g = i(v) ? v : s(v) ? o(v) : [] : a(y) || r(y) ? g = r(v) ? u(v) : a(v) ? v : {} : m = !1),
            f.push(y),
            h.push(g),
            m ? t[n] = c(g, y, p, f, h) : (g === g ? g !== v : v === v) && (t[n] = g)
      }
      var o = t("./arrayCopy")
          , r = t("../lang/isArguments")
          , i = t("../lang/isArray")
          , s = t("./isArrayLike")
          , a = t("../lang/isPlainObject")
          , l = t("../lang/isTypedArray")
          , u = t("../lang/toPlainObject");
      e.exports = n
    }
      , {
        "../lang/isArguments": 124,
        "../lang/isArray": 125,
        "../lang/isPlainObject": 129,
        "../lang/isTypedArray": 131,
        "../lang/toPlainObject": 132,
        "./arrayCopy": 103,
        "./isArrayLike": 116
      }],
    110: [function(t, e) {
      function n(t) {
        return function(e) {
          return null == e ? void 0 : o(e)[t]
        }
      }
      var o = t("./toObject");
      e.exports = n
    }
      , {
        "./toObject": 123
      }],
    111: [function(t, e) {
      function n(t, e, n) {
        if ("function" != typeof t)
          return o;
        if (void 0 === e)
          return t;
        switch (n) {
          case 1:
            return function(n) {
              return t.call(e, n)
            }
                ;
          case 3:
            return function(n, o, r) {
              return t.call(e, n, o, r)
            }
                ;
          case 4:
            return function(n, o, r, i) {
              return t.call(e, n, o, r, i)
            }
                ;
          case 5:
            return function(n, o, r, i, s) {
              return t.call(e, n, o, r, i, s)
            }
        }
        return function() {
          return t.apply(e, arguments)
        }
      }
      var o = t("../utility/identity");
      e.exports = n
    }
      , {
        "../utility/identity": 137
      }],
    112: [function(t, e) {
      function n(t) {
        return i(function(e, n) {
          var i = -1
              , s = null == e ? 0 : n.length
              , a = s > 2 ? n[s - 2] : void 0
              , l = s > 2 ? n[2] : void 0
              , u = s > 1 ? n[s - 1] : void 0;
          for ("function" == typeof a ? (a = o(a, u, 5),
              s -= 2) : (a = "function" == typeof u ? u : void 0,
              s -= a ? 1 : 0),
               l && r(n[0], n[1], l) && (a = 3 > s ? void 0 : a,
                   s = 1); ++i < s; ) {
            var c = n[i];
            c && t(e, c, a)
          }
          return e
        })
      }
      var o = t("./bindCallback")
          , r = t("./isIterateeCall")
          , i = t("../function/restParam");
      e.exports = n
    }
      , {
        "../function/restParam": 101,
        "./bindCallback": 111,
        "./isIterateeCall": 119
      }],
    113: [function(t, e) {
      function n(t) {
        return function(e, n, r) {
          for (var i = o(e), s = r(e), a = s.length, l = t ? a : -1; t ? l-- : ++l < a; ) {
            var u = s[l];
            if (n(i[u], u, i) === !1)
              break
          }
          return e
        }
      }
      var o = t("./toObject");
      e.exports = n
    }
      , {
        "./toObject": 123
      }],
    114: [function(t, e) {
      var n = t("./baseProperty")
          , o = n("length");
      e.exports = o
    }
      , {
        "./baseProperty": 110
      }],
    115: [function(t, e) {
      function n(t, e) {
        var n = null == t ? void 0 : t[e];
        return o(n) ? n : void 0
      }
      var o = t("../lang/isNative");
      e.exports = n
    }
      , {
        "../lang/isNative": 127
      }],
    116: [function(t, e) {
      function n(t) {
        return null != t && r(o(t))
      }
      var o = t("./getLength")
          , r = t("./isLength");
      e.exports = n
    }
      , {
        "./getLength": 114,
        "./isLength": 120
      }],
    117: [function(t, e) {
      var n = function() {
        try {
          Object({
            toString: 0
          } + "")
        } catch (t) {
          return function() {
            return !1
          }
        }
        return function(t) {
          return "function" != typeof t.toString && "string" == typeof (t + "")
        }
      }();
      e.exports = n
    }
      , {}],
    118: [function(t, e) {
      function n(t, e) {
        return t = "number" == typeof t || o.test(t) ? +t : -1,
            e = null == e ? r : e,
        t > -1 && t % 1 == 0 && e > t
      }
      var o = /^\d+$/
          , r = 9007199254740991;
      e.exports = n
    }
      , {}],
    119: [function(t, e) {
      function n(t, e, n) {
        if (!i(n))
          return !1;
        var s = typeof e;
        if ("number" == s ? o(n) && r(e, n.length) : "string" == s && e in n) {
          var a = n[e];
          return t === t ? t === a : a !== a
        }
        return !1
      }
      var o = t("./isArrayLike")
          , r = t("./isIndex")
          , i = t("../lang/isObject");
      e.exports = n
    }
      , {
        "../lang/isObject": 128,
        "./isArrayLike": 116,
        "./isIndex": 118
      }],
    120: [function(t, e) {
      function n(t) {
        return "number" == typeof t && t > -1 && t % 1 == 0 && o >= t
      }
      var o = 9007199254740991;
      e.exports = n
    }
      , {}],
    121: [function(t, e) {
      function n(t) {
        return !!t && "object" == typeof t
      }
      e.exports = n
    }
      , {}],
    122: [function(t, e) {
      function n(t) {
        for (var e = l(t), n = e.length, u = n && t.length, p = !!u && s(u) && (r(t) || o(t) || a(t)), f = -1, h = []; ++f < n; ) {
          var d = e[f];
          (p && i(d, u) || c.call(t, d)) && h.push(d)
        }
        return h
      }
      var o = t("../lang/isArguments")
          , r = t("../lang/isArray")
          , i = t("./isIndex")
          , s = t("./isLength")
          , a = t("../lang/isString")
          , l = t("../object/keysIn")
          , u = Object.prototype
          , c = u.hasOwnProperty;
      e.exports = n
    }
      , {
        "../lang/isArguments": 124,
        "../lang/isArray": 125,
        "../lang/isString": 130,
        "../object/keysIn": 134,
        "./isIndex": 118,
        "./isLength": 120
      }],
    123: [function(t, e) {
      function n(t) {
        if (i.unindexedChars && r(t)) {
          for (var e = -1, n = t.length, s = Object(t); ++e < n; )
            s[e] = t.charAt(e);
          return s
        }
        return o(t) ? t : Object(t)
      }
      var o = t("../lang/isObject")
          , r = t("../lang/isString")
          , i = t("../support");
      e.exports = n
    }
      , {
        "../lang/isObject": 128,
        "../lang/isString": 130,
        "../support": 136
      }],
    124: [function(t, e) {
      function n(t) {
        return r(t) && o(t) && s.call(t, "callee") && !a.call(t, "callee")
      }
      var o = t("../internal/isArrayLike")
          , r = t("../internal/isObjectLike")
          , i = Object.prototype
          , s = i.hasOwnProperty
          , a = i.propertyIsEnumerable;
      e.exports = n
    }
      , {
        "../internal/isArrayLike": 116,
        "../internal/isObjectLike": 121
      }],
    125: [function(t, e) {
      var n = t("../internal/getNative")
          , o = t("../internal/isLength")
          , r = t("../internal/isObjectLike")
          , i = "[object Array]"
          , s = Object.prototype
          , a = s.toString
          , l = n(Array, "isArray")
          , u = l || function(t) {
            return r(t) && o(t.length) && a.call(t) == i
          }
      ;
      e.exports = u
    }
      , {
        "../internal/getNative": 115,
        "../internal/isLength": 120,
        "../internal/isObjectLike": 121
      }],
    126: [function(t, e) {
      function n(t) {
        return o(t) && s.call(t) == r
      }
      var o = t("./isObject")
          , r = "[object Function]"
          , i = Object.prototype
          , s = i.toString;
      e.exports = n
    }
      , {
        "./isObject": 128
      }],
    127: [function(t, e) {
      function n(t) {
        return null == t ? !1 : o(t) ? c.test(l.call(t)) : i(t) && (r(t) ? c : s).test(t)
      }
      var o = t("./isFunction")
          , r = t("../internal/isHostObject")
          , i = t("../internal/isObjectLike")
          , s = /^\[object .+?Constructor\]$/
          , a = Object.prototype
          , l = Function.prototype.toString
          , u = a.hasOwnProperty
          , c = RegExp("^" + l.call(u).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
      e.exports = n
    }
      , {
        "../internal/isHostObject": 117,
        "../internal/isObjectLike": 121,
        "./isFunction": 126
      }],
    128: [function(t, e) {
      function n(t) {
        var e = typeof t;
        return !!t && ("object" == e || "function" == e)
      }
      e.exports = n
    }
      , {}],
    129: [function(t, e) {
      function n(t) {
        var e;
        if (!s(t) || p.call(t) != l || i(t) || r(t) || !c.call(t, "constructor") && (e = t.constructor,
        "function" == typeof e && !(e instanceof e)))
          return !1;
        var n;
        return a.ownLast ? (o(t, function(t, e, o) {
          return n = c.call(o, e),
              !1
        }),
        n !== !1) : (o(t, function(t, e) {
          n = e
        }),
        void 0 === n || c.call(t, n))
      }
      var o = t("../internal/baseForIn")
          , r = t("./isArguments")
          , i = t("../internal/isHostObject")
          , s = t("../internal/isObjectLike")
          , a = t("../support")
          , l = "[object Object]"
          , u = Object.prototype
          , c = u.hasOwnProperty
          , p = u.toString;
      e.exports = n
    }
      , {
        "../internal/baseForIn": 107,
        "../internal/isHostObject": 117,
        "../internal/isObjectLike": 121,
        "../support": 136,
        "./isArguments": 124
      }],
    130: [function(t, e) {
      function n(t) {
        return "string" == typeof t || o(t) && s.call(t) == r
      }
      var o = t("../internal/isObjectLike")
          , r = "[object String]"
          , i = Object.prototype
          , s = i.toString;
      e.exports = n
    }
      , {
        "../internal/isObjectLike": 121
      }],
    131: [function(t, e) {
      function n(t) {
        return r(t) && o(t.length) && !!S[P.call(t)]
      }
      var o = t("../internal/isLength")
          , r = t("../internal/isObjectLike")
          , i = "[object Arguments]"
          , s = "[object Array]"
          , a = "[object Boolean]"
          , l = "[object Date]"
          , u = "[object Error]"
          , c = "[object Function]"
          , p = "[object Map]"
          , f = "[object Number]"
          , h = "[object Object]"
          , d = "[object RegExp]"
          , y = "[object Set]"
          , v = "[object String]"
          , g = "[object WeakMap]"
          , m = "[object ArrayBuffer]"
          , b = "[object Float32Array]"
          , _ = "[object Float64Array]"
          , j = "[object Int8Array]"
          , w = "[object Int16Array]"
          , T = "[object Int32Array]"
          , k = "[object Uint8Array]"
          , E = "[object Uint8ClampedArray]"
          , C = "[object Uint16Array]"
          , O = "[object Uint32Array]"
          , S = {};
      S[b] = S[_] = S[j] = S[w] = S[T] = S[k] = S[E] = S[C] = S[O] = !0,
          S[i] = S[s] = S[m] = S[a] = S[l] = S[u] = S[c] = S[p] = S[f] = S[h] = S[d] = S[y] = S[v] = S[g] = !1;
      var x = Object.prototype
          , P = x.toString;
      e.exports = n
    }
      , {
        "../internal/isLength": 120,
        "../internal/isObjectLike": 121
      }],
    132: [function(t, e) {
      function n(t) {
        return o(t, r(t))
      }
      var o = t("../internal/baseCopy")
          , r = t("../object/keysIn");
      e.exports = n
    }
      , {
        "../internal/baseCopy": 105,
        "../object/keysIn": 134
      }],
    133: [function(t, e) {
      var n = t("../internal/getNative")
          , o = t("../internal/isArrayLike")
          , r = t("../lang/isObject")
          , i = t("../internal/shimKeys")
          , s = t("../support")
          , a = n(Object, "keys")
          , l = a ? function(t) {
            var e = null == t ? void 0 : t.constructor;
            return "function" == typeof e && e.prototype === t || ("function" == typeof t ? s.enumPrototypes : o(t)) ? i(t) : r(t) ? a(t) : []
          }
          : i;
      e.exports = l
    }
      , {
        "../internal/getNative": 115,
        "../internal/isArrayLike": 116,
        "../internal/shimKeys": 122,
        "../lang/isObject": 128,
        "../support": 136
      }],
    134: [function(t, e) {
      function n(t) {
        if (null == t)
          return [];
        u(t) || (t = Object(t));
        var e = t.length;
        e = e && l(e) && (i(t) || r(t) || c(t)) && e || 0;
        for (var n = t.constructor, o = -1, f = s(n) && n.prototype || T, h = f === t, d = Array(e), v = e > 0, g = p.enumErrorProps && (t === w || t instanceof Error), b = p.enumPrototypes && s(t); ++o < e; )
          d[o] = o + "";
        for (var S in t)
          b && "prototype" == S || g && ("message" == S || "name" == S) || v && a(S, e) || "constructor" == S && (h || !E.call(t, S)) || d.push(S);
        if (p.nonEnumShadows && t !== T) {
          var x = t === k ? _ : t === w ? y : C.call(t)
              , P = O[x] || O[m];
          for (x == m && (f = T),
                   e = j.length; e--; ) {
            S = j[e];
            var M = P[S];
            h && M || (M ? !E.call(t, S) : t[S] === f[S]) || d.push(S)
          }
        }
        return d
      }
      var o = t("../internal/arrayEach")
          , r = t("../lang/isArguments")
          , i = t("../lang/isArray")
          , s = t("../lang/isFunction")
          , a = t("../internal/isIndex")
          , l = t("../internal/isLength")
          , u = t("../lang/isObject")
          , c = t("../lang/isString")
          , p = t("../support")
          , f = "[object Array]"
          , h = "[object Boolean]"
          , d = "[object Date]"
          , y = "[object Error]"
          , v = "[object Function]"
          , g = "[object Number]"
          , m = "[object Object]"
          , b = "[object RegExp]"
          , _ = "[object String]"
          , j = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"]
          , w = Error.prototype
          , T = Object.prototype
          , k = String.prototype
          , E = T.hasOwnProperty
          , C = T.toString
          , O = {};
      O[f] = O[d] = O[g] = {
        constructor: !0,
        toLocaleString: !0,
        toString: !0,
        valueOf: !0
      },
          O[h] = O[_] = {
            constructor: !0,
            toString: !0,
            valueOf: !0
          },
          O[y] = O[v] = O[b] = {
            constructor: !0,
            toString: !0
          },
          O[m] = {
            constructor: !0
          },
          o(j, function(t) {
            for (var e in O)
              if (E.call(O, e)) {
                var n = O[e];
                n[t] = E.call(n, t)
              }
          }),
          e.exports = n
    }
      , {
        "../internal/arrayEach": 104,
        "../internal/isIndex": 118,
        "../internal/isLength": 120,
        "../lang/isArguments": 124,
        "../lang/isArray": 125,
        "../lang/isFunction": 126,
        "../lang/isObject": 128,
        "../lang/isString": 130,
        "../support": 136
      }],
    135: [function(t, e) {
      var n = t("../internal/baseMerge")
          , o = t("../internal/createAssigner")
          , r = o(n);
      e.exports = r
    }
      , {
        "../internal/baseMerge": 108,
        "../internal/createAssigner": 112
      }],
    136: [function(t, e) {
      var n = Array.prototype
          , o = Error.prototype
          , r = Object.prototype
          , i = r.propertyIsEnumerable
          , s = n.splice
          , a = {};
      !function(t) {
        var e = function() {
          this.x = t
        }
            , n = {
          0: t,
          length: t
        }
            , r = [];
        e.prototype = {
          valueOf: t,
          y: t
        };
        for (var l in new e)
          r.push(l);
        a.enumErrorProps = i.call(o, "message") || i.call(o, "name"),
            a.enumPrototypes = i.call(e, "prototype"),
            a.nonEnumShadows = !/valueOf/.test(r),
            a.ownLast = "x" != r[0],
            a.spliceObjects = (s.call(n, 0, 1),
                !n[0]),
            a.unindexedChars = "x"[0] + Object("x")[0] != "xx"
      }(1, 0),
          e.exports = a
    }
      , {}],
    137: [function(t, e) {
      function n(t) {
        return t
      }
      e.exports = n
    }
      , {}],
    138: [function(t, e) {
      "use strict";
      var n = t("object-keys");
      e.exports = function() {
        if ("function" != typeof Symbol || "function" != typeof Object.getOwnPropertySymbols)
          return !1;
        if ("symbol" == typeof Symbol.iterator)
          return !0;
        var t = {}
            , e = Symbol("test");
        if ("string" == typeof e)
          return !1;
        var o = 42;
        t[e] = o;
        for (e in t)
          return !1;
        if (0 !== n(t).length)
          return !1;
        if ("function" == typeof Object.keys && 0 !== Object.keys(t).length)
          return !1;
        if ("function" == typeof Object.getOwnPropertyNames && 0 !== Object.getOwnPropertyNames(t).length)
          return !1;
        var r = Object.getOwnPropertySymbols(t);
        if (1 !== r.length || r[0] !== e)
          return !1;
        if (!Object.prototype.propertyIsEnumerable.call(t, e))
          return !1;
        if ("function" == typeof Object.getOwnPropertyDescriptor) {
          var i = Object.getOwnPropertyDescriptor(t, e);
          if (i.value !== o || i.enumerable !== !0)
            return !1
        }
        return !0
      }
    }
      , {
        "object-keys": 145
      }],
    139: [function(t, e) {
      "use strict";
      var n = t("object-keys")
          , o = t("function-bind")
          , r = function(t) {
        return "undefined" != typeof t && null !== t
      }
          , i = t("./hasSymbols")()
          , s = Object
          , a = o.call(Function.call, Array.prototype.push)
          , l = o.call(Function.call, Object.prototype.propertyIsEnumerable);
      e.exports = function(t) {
        if (!r(t))
          throw new TypeError("target must be an object");
        var e, o, u, c, p, f, h, d = s(t);
        for (e = 1; e < arguments.length; ++e) {
          if (o = s(arguments[e]),
              c = n(o),
          i && Object.getOwnPropertySymbols)
            for (p = Object.getOwnPropertySymbols(o),
                     u = 0; u < p.length; ++u)
              h = p[u],
              l(o, h) && a(c, h);
          for (u = 0; u < c.length; ++u)
            h = c[u],
                f = o[h],
            l(o, h) && (d[h] = f)
        }
        return d
      }
    }
      , {
        "./hasSymbols": 138,
        "function-bind": 144,
        "object-keys": 145
      }],
    140: [function(t, e) {
      "use strict";
      var n = t("define-properties")
          , o = t("./implementation")
          , r = t("./polyfill")
          , i = t("./shim");
      n(o, {
        implementation: o,
        getPolyfill: r,
        shim: i
      }),
          e.exports = o
    }
      , {
        "./implementation": 139,
        "./polyfill": 147,
        "./shim": 148,
        "define-properties": 141
      }],
    141: [function(t, e) {
      "use strict";
      var n = t("object-keys")
          , o = t("foreach")
          , r = "function" == typeof Symbol && "symbol" == typeof Symbol()
          , i = Object.prototype.toString
          , s = function(t) {
        return "function" == typeof t && "[object Function]" === i.call(t)
      }
          , a = function() {
        var t = {};
        try {
          Object.defineProperty(t, "x", {
            enumerable: !1,
            value: t
          });
          for (var e in t)
            return !1;
          return t.x === t
        } catch (n) {
          return !1
        }
      }
          , l = Object.defineProperty && a()
          , u = function(t, e, n, o) {
        (!(e in t) || s(o) && o()) && (l ? Object.defineProperty(t, e, {
          configurable: !0,
          enumerable: !1,
          value: n,
          writable: !0
        }) : t[e] = n)
      }
          , c = function(t, e) {
        var i = arguments.length > 2 ? arguments[2] : {}
            , s = n(e);
        r && (s = s.concat(Object.getOwnPropertySymbols(e))),
            o(s, function(n) {
              u(t, n, e[n], i[n])
            })
      };
      c.supportsDescriptors = !!l,
          e.exports = c
    }
      , {
        foreach: 142,
        "object-keys": 145
      }],
    142: [function(t, e) {
      var n = Object.prototype.hasOwnProperty
          , o = Object.prototype.toString;
      e.exports = function(t, e, r) {
        if ("[object Function]" !== o.call(e))
          throw new TypeError("iterator must be a function");
        var i = t.length;
        if (i === +i)
          for (var s = 0; i > s; s++)
            e.call(r, t[s], s, t);
        else
          for (var a in t)
            n.call(t, a) && e.call(r, t[a], a, t)
      }
    }
      , {}],
    143: [function(t, e) {
      var n = "Function.prototype.bind called on incompatible "
          , o = Array.prototype.slice
          , r = Object.prototype.toString
          , i = "[object Function]";
      e.exports = function(t) {
        var e = this;
        if ("function" != typeof e || r.call(e) !== i)
          throw new TypeError(n + e);
        for (var s, a = o.call(arguments, 1), l = function() {
          if (this instanceof s) {
            var n = e.apply(this, a.concat(o.call(arguments)));
            return Object(n) === n ? n : this
          }
          return e.apply(t, a.concat(o.call(arguments)))
        }, u = Math.max(0, e.length - a.length), c = [], p = 0; u > p; p++)
          c.push("$" + p);
        if (s = Function("binder", "return function (" + c.join(",") + "){ return binder.apply(this,arguments); }")(l),
            e.prototype) {
          var f = function() {};
          f.prototype = e.prototype,
              s.prototype = new f,
              f.prototype = null
        }
        return s
      }
    }
      , {}],
    144: [function(t, e) {
      var n = t("./implementation");
      e.exports = Function.prototype.bind || n
    }
      , {
        "./implementation": 143
      }],
    145: [function(t, e) {
      "use strict";
      var n = Object.prototype.hasOwnProperty
          , o = Object.prototype.toString
          , r = Array.prototype.slice
          , i = t("./isArguments")
          , s = Object.prototype.propertyIsEnumerable
          , a = !s.call({
        toString: null
      }, "toString")
          , l = s.call(function() {}, "prototype")
          , u = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"]
          , c = function(t) {
        var e = t.constructor;
        return e && e.prototype === t
      }
          , p = {
        $console: !0,
        $external: !0,
        $frame: !0,
        $frameElement: !0,
        $frames: !0,
        $innerHeight: !0,
        $innerWidth: !0,
        $outerHeight: !0,
        $outerWidth: !0,
        $pageXOffset: !0,
        $pageYOffset: !0,
        $parent: !0,
        $scrollLeft: !0,
        $scrollTop: !0,
        $scrollX: !0,
        $scrollY: !0,
        $self: !0,
        $webkitIndexedDB: !0,
        $webkitStorageInfo: !0,
        $window: !0
      }
          , f = function() {
        if ("undefined" == typeof window)
          return !1;
        for (var t in window)
          try {
            if (!p["$" + t] && n.call(window, t) && null !== window[t] && "object" == typeof window[t])
              try {
                c(window[t])
              } catch (e) {
                return !0
              }
          } catch (e) {
            return !0
          }
        return !1
      }()
          , h = function(t) {
        if ("undefined" == typeof window || !f)
          return c(t);
        try {
          return c(t)
        } catch (e) {
          return !1
        }
      }
          , d = function(t) {
        var e = null !== t && "object" == typeof t
            , r = "[object Function]" === o.call(t)
            , s = i(t)
            , c = e && "[object String]" === o.call(t)
            , p = [];
        if (!e && !r && !s)
          throw new TypeError("Object.keys called on a non-object");
        var f = l && r;
        if (c && t.length > 0 && !n.call(t, 0))
          for (var d = 0; d < t.length; ++d)
            p.push(String(d));
        if (s && t.length > 0)
          for (var y = 0; y < t.length; ++y)
            p.push(String(y));
        else
          for (var v in t)
            f && "prototype" === v || !n.call(t, v) || p.push(String(v));
        if (a)
          for (var g = h(t), m = 0; m < u.length; ++m)
            g && "constructor" === u[m] || !n.call(t, u[m]) || p.push(u[m]);
        return p
      };
      d.shim = function() {
        if (Object.keys) {
          var t = function() {
            return 2 === (Object.keys(arguments) || "").length
          }(1, 2);
          if (!t) {
            var e = Object.keys;
            Object.keys = function(t) {
              return e(i(t) ? r.call(t) : t)
            }
          }
        } else
          Object.keys = d;
        return Object.keys || d
      }
          ,
          e.exports = d
    }
      , {
        "./isArguments": 146
      }],
    146: [function(t, e) {
      "use strict";
      var n = Object.prototype.toString;
      e.exports = function(t) {
        var e = n.call(t)
            , o = "[object Arguments]" === e;
        return o || (o = "[object Array]" !== e && null !== t && "object" == typeof t && "number" == typeof t.length && t.length >= 0 && "[object Function]" === n.call(t.callee)),
            o
      }
    }
      , {}],
    147: [function(t, e) {
      "use strict";
      var n = t("./implementation")
          , o = function() {
        if (!Object.assign)
          return !1;
        for (var t = "abcdefghijklmnopqrst", e = t.split(""), n = {}, o = 0; o < e.length; ++o)
          n[e[o]] = e[o];
        var r = Object.assign({}, n)
            , i = "";
        for (var s in r)
          i += s;
        return t !== i
      }
          , r = function() {
        if (!Object.assign || !Object.preventExtensions)
          return !1;
        var t = Object.preventExtensions({
          1: 2
        });
        try {
          Object.assign(t, "xy")
        } catch (e) {
          return "y" === t[1]
        }
      };
      e.exports = function() {
        return Object.assign ? o() ? n : r() ? n : Object.assign : n
      }
    }
      , {
        "./implementation": 139
      }],
    148: [function(t, e) {
      "use strict";
      var n = t("define-properties")
          , o = t("./polyfill");
      e.exports = function() {
        var t = o();
        return n(Object, {
          assign: t
        }, {
          assign: function() {
            return Object.assign !== t
          }
        }),
            t
      }
    }
      , {
        "./polyfill": 147,
        "define-properties": 141
      }],
    149: [function(t, e) {
      function n(t, e) {
        var n, o = null;
        try {
          n = JSON.parse(t, e)
        } catch (r) {
          o = r
        }
        return [o, n]
      }
      e.exports = n
    }
      , {}],
    150: [function(t, e) {
      function n(t) {
        return t.replace(/\n\r?\s*/g, "")
      }
      e.exports = function(t) {
        for (var e = "", o = 0; o < arguments.length; o++)
          e += n(t[o]) + (arguments[o + 1] || "");
        return e
      }
    }
      , {}],
    151: [function(t, e) {
      "use strict";
      function n(t, e) {
        for (var n = 0; n < t.length; n++)
          e(t[n])
      }
      function o(t) {
        for (var e in t)
          if (t.hasOwnProperty(e))
            return !1;
        return !0
      }
      function r(t, e, n) {
        var o = t;
        return c(e) ? (n = e,
        "string" == typeof t && (o = {
          uri: t
        })) : o = f(e, {
          uri: t
        }),
            o.callback = n,
            o
      }
      function i(t, e, n) {
        return e = r(t, e, n),
            s(e)
      }
      function s(t) {
        function e() {
          4 === c.readyState && s()
        }
        function n() {
          var t = void 0;
          if (c.response ? t = c.response : "text" !== c.responseType && c.responseType || (t = c.responseText || c.responseXML),
              _)
            try {
              t = JSON.parse(t)
            } catch (e) {}
          return t
        }
        function r(t) {
          clearTimeout(d),
          t instanceof Error || (t = new Error("" + (t || "Unknown XMLHttpRequest Error"))),
              t.statusCode = 0,
              a(t, l)
        }
        function s() {
          if (!h) {
            var e;
            clearTimeout(d),
                e = t.useXDR && void 0 === c.status ? 200 : 1223 === c.status ? 204 : c.status;
            var o = l
                , r = null;
            0 !== e ? (o = {
              body: n(),
              statusCode: e,
              method: v,
              headers: {},
              url: y,
              rawRequest: c
            },
            c.getAllResponseHeaders && (o.headers = p(c.getAllResponseHeaders()))) : r = new Error("Internal XMLHttpRequest Error"),
                a(r, o, o.body)
          }
        }
        var a = t.callback;
        if ("undefined" == typeof a)
          throw new Error("callback argument missing");
        a = u(a);
        var l = {
          body: void 0,
          headers: {},
          statusCode: 0,
          method: v,
          url: y,
          rawRequest: c
        }
            , c = t.xhr || null;
        c || (c = t.cors || t.useXDR ? new i.XDomainRequest : new i.XMLHttpRequest);
        var f, h, d, y = c.url = t.uri || t.url, v = c.method = t.method || "GET", g = t.body || t.data || null, m = c.headers = t.headers || {}, b = !!t.sync, _ = !1;
        if ("json"in t && (_ = !0,
        m.accept || m.Accept || (m.Accept = "application/json"),
        "GET" !== v && "HEAD" !== v && (m["content-type"] || m["Content-Type"] || (m["Content-Type"] = "application/json"),
            g = JSON.stringify(t.json))),
            c.onreadystatechange = e,
            c.onload = s,
            c.onerror = r,
            c.onprogress = function() {}
            ,
            c.ontimeout = r,
            c.open(v, y, !b, t.username, t.password),
        b || (c.withCredentials = !!t.withCredentials),
        !b && t.timeout > 0 && (d = setTimeout(function() {
          h = !0,
              c.abort("timeout");
          var t = new Error("XMLHttpRequest timeout");
          t.code = "ETIMEDOUT",
              r(t)
        }, t.timeout)),
            c.setRequestHeader)
          for (f in m)
            m.hasOwnProperty(f) && c.setRequestHeader(f, m[f]);
        else if (t.headers && !o(t.headers))
          throw new Error("Headers cannot be set on an XDomainRequest object");
        return "responseType"in t && (c.responseType = t.responseType),
        "beforeSend"in t && "function" == typeof t.beforeSend && t.beforeSend(c),
            c.send(g),
            c
      }
      function a() {}
      var l = t("global/window")
          , u = t("once")
          , c = t("is-function")
          , p = t("parse-headers")
          , f = t("xtend");
      e.exports = i,
          i.XMLHttpRequest = l.XMLHttpRequest || a,
          i.XDomainRequest = "withCredentials"in new i.XMLHttpRequest ? i.XMLHttpRequest : l.XDomainRequest,
          n(["get", "put", "post", "patch", "head", "delete"], function(t) {
            i["delete" === t ? "del" : t] = function(e, n, o) {
              return n = r(e, n, o),
                  n.method = t.toUpperCase(),
                  s(n)
            }
          })
    }
      , {
        "global/window": 97,
        "is-function": 152,
        once: 153,
        "parse-headers": 156,
        xtend: 157
      }],
    152: [function(t, e) {
      function n(t) {
        var e = o.call(t);
        return "[object Function]" === e || "function" == typeof t && "[object RegExp]" !== e || "undefined" != typeof window && (t === window.setTimeout || t === window.alert || t === window.confirm || t === window.prompt)
      }
      e.exports = n;
      var o = Object.prototype.toString
    }
      , {}],
    153: [function(t, e) {
      function n(t) {
        var e = !1;
        return function() {
          return e ? void 0 : (e = !0,
              t.apply(this, arguments))
        }
      }
      e.exports = n,
          n.proto = n(function() {
            Object.defineProperty(Function.prototype, "once", {
              value: function() {
                return n(this)
              },
              configurable: !0
            })
          })
    }
      , {}],
    154: [function(t, e) {
      function n(t, e, n) {
        if (!s(e))
          throw new TypeError("iterator must be a function");
        arguments.length < 3 && (n = this),
            "[object Array]" === a.call(t) ? o(t, e, n) : "string" == typeof t ? r(t, e, n) : i(t, e, n)
      }
      function o(t, e, n) {
        for (var o = 0, r = t.length; r > o; o++)
          l.call(t, o) && e.call(n, t[o], o, t)
      }
      function r(t, e, n) {
        for (var o = 0, r = t.length; r > o; o++)
          e.call(n, t.charAt(o), o, t)
      }
      function i(t, e, n) {
        for (var o in t)
          l.call(t, o) && e.call(n, t[o], o, t)
      }
      var s = t("is-function");
      e.exports = n;
      var a = Object.prototype.toString
          , l = Object.prototype.hasOwnProperty
    }
      , {
        "is-function": 152
      }],
    155: [function(t, e, n) {
      function o(t) {
        return t.replace(/^\s*|\s*$/g, "")
      }
      n = e.exports = o,
          n.left = function(t) {
            return t.replace(/^\s*/, "")
          }
          ,
          n.right = function(t) {
            return t.replace(/\s*$/, "")
          }
    }
      , {}],
    156: [function(t, e) {
      var n = t("trim")
          , o = t("for-each")
          , r = function(t) {
        return "[object Array]" === Object.prototype.toString.call(t)
      };
      e.exports = function(t) {
        if (!t)
          return {};
        var e = {};
        return o(n(t).split("\n"), function(t) {
          var o = t.indexOf(":")
              , i = n(t.slice(0, o)).toLowerCase()
              , s = n(t.slice(o + 1));
          "undefined" == typeof e[i] ? e[i] = s : r(e[i]) ? e[i].push(s) : e[i] = [e[i], s]
        }),
            e
      }
    }
      , {
        "for-each": 154,
        trim: 155
      }],
    157: [function(t, e) {
      function n() {
        for (var t = {}, e = 0; e < arguments.length; e++) {
          var n = arguments[e];
          for (var r in n)
            o.call(n, r) && (t[r] = n[r])
        }
        return t
      }
      e.exports = n;
      var o = Object.prototype.hasOwnProperty
    }
      , {}]
  }, {}, [95])(95)
}),
    function(t) {
      var e = t.vttjs = {}
          , n = e.VTTCue
          , o = e.VTTRegion
          , r = t.VTTCue
          , i = t.VTTRegion;
      e.shim = function() {
        e.VTTCue = n,
            e.VTTRegion = o
      }
          ,
          e.restore = function() {
            e.VTTCue = r,
                e.VTTRegion = i
          }
    }(this),
    function(t, e) {
      function n(t) {
        if ("string" != typeof t)
          return !1;
        var e = a[t.toLowerCase()];
        return e ? t.toLowerCase() : !1
      }
      function o(t) {
        if ("string" != typeof t)
          return !1;
        var e = l[t.toLowerCase()];
        return e ? t.toLowerCase() : !1
      }
      function r(t) {
        for (var e = 1; e < arguments.length; e++) {
          var n = arguments[e];
          for (var o in n)
            t[o] = n[o]
        }
        return t
      }
      function i(t, e, i) {
        var a = this
            , l = /MSIE\s8\.0/.test(navigator.userAgent)
            , u = {};
        l ? a = document.createElement("custom") : u.enumerable = !0,
            a.hasBeenReset = !1;
        var c = ""
            , p = !1
            , f = t
            , h = e
            , d = i
            , y = null
            , v = ""
            , g = !0
            , m = "auto"
            , b = "start"
            , _ = 50
            , j = "middle"
            , w = 50
            , T = "middle";
        return Object.defineProperty(a, "id", r({}, u, {
          get: function() {
            return c
          },
          set: function(t) {
            c = "" + t
          }
        })),
            Object.defineProperty(a, "pauseOnExit", r({}, u, {
              get: function() {
                return p
              },
              set: function(t) {
                p = !!t
              }
            })),
            Object.defineProperty(a, "startTime", r({}, u, {
              get: function() {
                return f
              },
              set: function(t) {
                if ("number" != typeof t)
                  throw new TypeError("Start time must be set to a number.");
                f = t,
                    this.hasBeenReset = !0
              }
            })),
            Object.defineProperty(a, "endTime", r({}, u, {
              get: function() {
                return h
              },
              set: function(t) {
                if ("number" != typeof t)
                  throw new TypeError("End time must be set to a number.");
                h = t,
                    this.hasBeenReset = !0
              }
            })),
            Object.defineProperty(a, "text", r({}, u, {
              get: function() {
                return d
              },
              set: function(t) {
                d = "" + t,
                    this.hasBeenReset = !0
              }
            })),
            Object.defineProperty(a, "region", r({}, u, {
              get: function() {
                return y
              },
              set: function(t) {
                y = t,
                    this.hasBeenReset = !0
              }
            })),
            Object.defineProperty(a, "vertical", r({}, u, {
              get: function() {
                return v
              },
              set: function(t) {
                var e = n(t);
                if (e === !1)
                  throw new SyntaxError("An invalid or illegal string was specified.");
                v = e,
                    this.hasBeenReset = !0
              }
            })),
            Object.defineProperty(a, "snapToLines", r({}, u, {
              get: function() {
                return g
              },
              set: function(t) {
                g = !!t,
                    this.hasBeenReset = !0
              }
            })),
            Object.defineProperty(a, "line", r({}, u, {
              get: function() {
                return m
              },
              set: function(t) {
                if ("number" != typeof t && t !== s)
                  throw new SyntaxError("An invalid number or illegal string was specified.");
                m = t,
                    this.hasBeenReset = !0
              }
            })),
            Object.defineProperty(a, "lineAlign", r({}, u, {
              get: function() {
                return b
              },
              set: function(t) {
                var e = o(t);
                if (!e)
                  throw new SyntaxError("An invalid or illegal string was specified.");
                b = e,
                    this.hasBeenReset = !0
              }
            })),
            Object.defineProperty(a, "position", r({}, u, {
              get: function() {
                return _
              },
              set: function(t) {
                if (0 > t || t > 100)
                  throw new Error("Position must be between 0 and 100.");
                _ = t,
                    this.hasBeenReset = !0
              }
            })),
            Object.defineProperty(a, "positionAlign", r({}, u, {
              get: function() {
                return j
              },
              set: function(t) {
                var e = o(t);
                if (!e)
                  throw new SyntaxError("An invalid or illegal string was specified.");
                j = e,
                    this.hasBeenReset = !0
              }
            })),
            Object.defineProperty(a, "size", r({}, u, {
              get: function() {
                return w
              },
              set: function(t) {
                if (0 > t || t > 100)
                  throw new Error("Size must be between 0 and 100.");
                w = t,
                    this.hasBeenReset = !0
              }
            })),
            Object.defineProperty(a, "align", r({}, u, {
              get: function() {
                return T
              },
              set: function(t) {
                var e = o(t);
                if (!e)
                  throw new SyntaxError("An invalid or illegal string was specified.");
                T = e,
                    this.hasBeenReset = !0
              }
            })),
            a.displayState = void 0,
            l ? a : void 0
      }
      var s = "auto"
          , a = {
        "": !0,
        lr: !0,
        rl: !0
      }
          , l = {
        start: !0,
        middle: !0,
        end: !0,
        left: !0,
        right: !0
      };
      i.prototype.getCueAsHTML = function() {
        return WebVTT.convertCueToDOMTree(window, this.text)
      }
          ,
          t.VTTCue = t.VTTCue || i,
          e.VTTCue = i
    }(this, this.vttjs || {}),
    function(t, e) {
      function n(t) {
        if ("string" != typeof t)
          return !1;
        var e = i[t.toLowerCase()];
        return e ? t.toLowerCase() : !1
      }
      function o(t) {
        return "number" == typeof t && t >= 0 && 100 >= t
      }
      function r() {
        var t = 100
            , e = 3
            , r = 0
            , i = 100
            , s = 0
            , a = 100
            , l = "";
        Object.defineProperties(this, {
          width: {
            enumerable: !0,
            get: function() {
              return t
            },
            set: function(e) {
              if (!o(e))
                throw new Error("Width must be between 0 and 100.");
              t = e
            }
          },
          lines: {
            enumerable: !0,
            get: function() {
              return e
            },
            set: function(t) {
              if ("number" != typeof t)
                throw new TypeError("Lines must be set to a number.");
              e = t
            }
          },
          regionAnchorY: {
            enumerable: !0,
            get: function() {
              return i
            },
            set: function(t) {
              if (!o(t))
                throw new Error("RegionAnchorX must be between 0 and 100.");
              i = t
            }
          },
          regionAnchorX: {
            enumerable: !0,
            get: function() {
              return r
            },
            set: function(t) {
              if (!o(t))
                throw new Error("RegionAnchorY must be between 0 and 100.");
              r = t
            }
          },
          viewportAnchorY: {
            enumerable: !0,
            get: function() {
              return a
            },
            set: function(t) {
              if (!o(t))
                throw new Error("ViewportAnchorY must be between 0 and 100.");
              a = t
            }
          },
          viewportAnchorX: {
            enumerable: !0,
            get: function() {
              return s
            },
            set: function(t) {
              if (!o(t))
                throw new Error("ViewportAnchorX must be between 0 and 100.");
              s = t
            }
          },
          scroll: {
            enumerable: !0,
            get: function() {
              return l
            },
            set: function(t) {
              var e = n(t);
              if (e === !1)
                throw new SyntaxError("An invalid or illegal string was specified.");
              l = e
            }
          }
        })
      }
      var i = {
        "": !0,
        up: !0
      };
      t.VTTRegion = t.VTTRegion || r,
          e.VTTRegion = r
    }(this, this.vttjs || {}),
    function(t) {
      function e(t, e) {
        this.name = "ParsingError",
            this.code = t.code,
            this.message = e || t.message
      }
      function n(t) {
        function e(t, e, n, o) {
          return 3600 * (0 | t) + 60 * (0 | e) + (0 | n) + (0 | o) / 1e3
        }
        var n = t.match(/^(\d+):(\d{2})(:\d{2})?\.(\d{3})/);
        return n ? n[3] ? e(n[1], n[2], n[3].replace(":", ""), n[4]) : n[1] > 59 ? e(n[1], n[2], 0, n[4]) : e(0, n[1], n[2], n[4]) : null
      }
      function o() {
        this.values = d(null)
      }
      function r(t, e, n, o) {
        var r = o ? t.split(o) : [t];
        for (var i in r)
          if ("string" == typeof r[i]) {
            var s = r[i].split(n);
            if (2 === s.length) {
              var a = s[0]
                  , l = s[1];
              e(a, l)
            }
          }
      }
      function i(t, i, s) {
        function a() {
          var o = n(t);
          if (null === o)
            throw new e(e.Errors.BadTimeStamp,"Malformed timestamp: " + c);
          return t = t.replace(/^[^\sa-zA-Z-]+/, ""),
              o
        }
        function l(t, e) {
          var n = new o;
          r(t, function(t, e) {
            switch (t) {
              case "region":
                for (var o = s.length - 1; o >= 0; o--)
                  if (s[o].id === e) {
                    n.set(t, s[o].region);
                    break
                  }
                break;
              case "vertical":
                n.alt(t, e, ["rl", "lr"]);
                break;
              case "line":
                var r = e.split(",")
                    , i = r[0];
                n.integer(t, i),
                    n.percent(t, i) ? n.set("snapToLines", !1) : null,
                    n.alt(t, i, ["auto"]),
                2 === r.length && n.alt("lineAlign", r[1], ["start", "middle", "end"]);
                break;
              case "position":
                r = e.split(","),
                    n.percent(t, r[0]),
                2 === r.length && n.alt("positionAlign", r[1], ["start", "middle", "end"]);
                break;
              case "size":
                n.percent(t, e);
                break;
              case "align":
                n.alt(t, e, ["start", "middle", "end", "left", "right"])
            }
          }, /:/, /\s/),
              e.region = n.get("region", null),
              e.vertical = n.get("vertical", ""),
              e.line = n.get("line", "auto"),
              e.lineAlign = n.get("lineAlign", "start"),
              e.snapToLines = n.get("snapToLines", !0),
              e.size = n.get("size", 100),
              e.align = n.get("align", "middle"),
              e.position = n.get("position", {
                start: 0,
                left: 0,
                middle: 50,
                end: 100,
                right: 100
              }, e.align),
              e.positionAlign = n.get("positionAlign", {
                start: "start",
                left: "start",
                middle: "middle",
                end: "end",
                right: "end"
              }, e.align)
        }
        function u() {
          t = t.replace(/^\s+/, "")
        }
        var c = t;
        if (u(),
            i.startTime = a(),
            u(),
        "-->" !== t.substr(0, 3))
          throw new e(e.Errors.BadTimeStamp,"Malformed time stamp (time stamps must be separated by '-->'): " + c);
        t = t.substr(3),
            u(),
            i.endTime = a(),
            u(),
            l(t, i)
      }
      function s(t, e) {
        function o() {
          function t(t) {
            return e = e.substr(t.length),
                t
          }
          if (!e)
            return null;
          var n = e.match(/^([^<]*)(<[^>]+>?)?/);
          return t(n[1] ? n[1] : n[2])
        }
        function r(t) {
          return y[t]
        }
        function i(t) {
          for (; d = t.match(/&(amp|lt|gt|lrm|rlm|nbsp);/); )
            t = t.replace(d[0], r);
          return t
        }
        function s(t, e) {
          return !m[e.localName] || m[e.localName] === t.localName
        }
        function a(e, n) {
          var o = v[e];
          if (!o)
            return null;
          var r = t.document.createElement(o);
          r.localName = o;
          var i = g[e];
          return i && n && (r[i] = n.trim()),
              r
        }
        for (var l, u = t.document.createElement("div"), c = u, p = []; null !== (l = o()); )
          if ("<" !== l[0])
            c.appendChild(t.document.createTextNode(i(l)));
          else {
            if ("/" === l[1]) {
              p.length && p[p.length - 1] === l.substr(2).replace(">", "") && (p.pop(),
                  c = c.parentNode);
              continue
            }
            var f, h = n(l.substr(1, l.length - 2));
            if (h) {
              f = t.document.createProcessingInstruction("timestamp", h),
                  c.appendChild(f);
              continue
            }
            var d = l.match(/^<([^.\s\/0-9>]+)(\.[^\s\\>]+)?([^>\\]+)?(\\?)>?$/);
            if (!d)
              continue;
            if (f = a(d[1], d[3]),
                !f)
              continue;
            if (!s(c, f))
              continue;
            d[2] && (f.className = d[2].substr(1).replace(".", " ")),
                p.push(d[1]),
                c.appendChild(f),
                c = f
          }
        return u
      }
      function a(t) {
        function e(t, e) {
          for (var n = e.childNodes.length - 1; n >= 0; n--)
            t.push(e.childNodes[n])
        }
        function n(t) {
          if (!t || !t.length)
            return null;
          var o = t.pop()
              , r = o.textContent || o.innerText;
          if (r) {
            var i = r.match(/^.*(\n|\r)/);
            return i ? (t.length = 0,
                i[0]) : r
          }
          return "ruby" === o.tagName ? n(t) : o.childNodes ? (e(t, o),
              n(t)) : void 0
        }
        var o, r = [], i = "";
        if (!t || !t.childNodes)
          return "ltr";
        for (e(r, t); i = n(r); )
          for (var s = 0; s < i.length; s++) {
            o = i.charCodeAt(s);
            for (var a = 0; a < b.length; a++)
              if (b[a] === o)
                return "rtl"
          }
        return "ltr"
      }
      function l(t) {
        if ("number" == typeof t.line && (t.snapToLines || t.line >= 0 && t.line <= 100))
          return t.line;
        if (!t.track || !t.track.textTrackList || !t.track.textTrackList.mediaElement)
          return -1;
        for (var e = t.track, n = e.textTrackList, o = 0, r = 0; r < n.length && n[r] !== e; r++)
          "showing" === n[r].mode && o++;
        return -1 * ++o
      }
      function u() {}
      function c(t, e, n) {
        var o = /MSIE\s8\.0/.test(navigator.userAgent)
            , r = "rgba(255, 255, 255, 1)"
            , i = "rgba(0, 0, 0, 0.8)";
        o && (r = "rgb(255, 255, 255)",
            i = "rgb(0, 0, 0)"),
            u.call(this),
            this.cue = e,
            this.cueDiv = s(t, e.text);
        var l = {
          color: r,
          backgroundColor: i,
          position: "relative",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          display: "inline"
        };
        o || (l.writingMode = "" === e.vertical ? "horizontal-tb" : "lr" === e.vertical ? "vertical-lr" : "vertical-rl",
            l.unicodeBidi = "plaintext"),
            this.applyStyles(l, this.cueDiv),
            this.div = t.document.createElement("div"),
            l = {
              textAlign: "middle" === e.align ? "center" : e.align,
              font: n.font,
              whiteSpace: "pre-line",
              position: "absolute"
            },
        o || (l.direction = a(this.cueDiv),
            l.writingMode = "" === e.vertical ? "horizontal-tb" : "lr" === e.vertical ? "vertical-lr" : "vertical-rl".stylesunicodeBidi = "plaintext"),
            this.applyStyles(l),
            this.div.appendChild(this.cueDiv);
        var c = 0;
        switch (e.positionAlign) {
          case "start":
            c = e.position;
            break;
          case "middle":
            c = e.position - e.size / 2;
            break;
          case "end":
            c = e.position - e.size
        }
        this.applyStyles("" === e.vertical ? {
          left: this.formatStyle(c, "%"),
          width: this.formatStyle(e.size, "%")
        } : {
          top: this.formatStyle(c, "%"),
          height: this.formatStyle(e.size, "%")
        }),
            this.move = function(t) {
              this.applyStyles({
                top: this.formatStyle(t.top, "px"),
                bottom: this.formatStyle(t.bottom, "px"),
                left: this.formatStyle(t.left, "px"),
                right: this.formatStyle(t.right, "px"),
                height: this.formatStyle(t.height, "px"),
                width: this.formatStyle(t.width, "px")
              })
            }
      }
      function p(t) {
        var e, n, o, r, i = /MSIE\s8\.0/.test(navigator.userAgent);
        if (t.div) {
          n = t.div.offsetHeight,
              o = t.div.offsetWidth,
              r = t.div.offsetTop;
          var s = (s = t.div.childNodes) && (s = s[0]) && s.getClientRects && s.getClientRects();
          t = t.div.getBoundingClientRect(),
              e = s ? Math.max(s[0] && s[0].height || 0, t.height / s.length) : 0
        }
        this.left = t.left,
            this.right = t.right,
            this.top = t.top || r,
            this.height = t.height || n,
            this.bottom = t.bottom || r + (t.height || n),
            this.width = t.width || o,
            this.lineHeight = void 0 !== e ? e : t.lineHeight,
        i && !this.lineHeight && (this.lineHeight = 13)
      }
      function f(t, e, n, o) {
        function r(t, e) {
          for (var r, i = new p(t), s = 1, a = 0; a < e.length; a++) {
            for (; t.overlapsOppositeAxis(n, e[a]) || t.within(n) && t.overlapsAny(o); )
              t.move(e[a]);
            if (t.within(n))
              return t;
            var l = t.intersectPercentage(n);
            s > l && (r = new p(t),
                s = l),
                t = new p(i)
          }
          return r || i
        }
        var i = new p(e)
            , s = e.cue
            , a = l(s)
            , u = [];
        if (s.snapToLines) {
          var c;
          switch (s.vertical) {
            case "":
              u = ["+y", "-y"],
                  c = "height";
              break;
            case "rl":
              u = ["+x", "-x"],
                  c = "width";
              break;
            case "lr":
              u = ["-x", "+x"],
                  c = "width"
          }
          var f = i.lineHeight
              , h = f * Math.round(a)
              , d = n[c] + f
              , y = u[0];
          Math.abs(h) > d && (h = 0 > h ? -1 : 1,
              h *= Math.ceil(d / f) * f),
          0 > a && (h += "" === s.vertical ? n.height : n.width,
              u = u.reverse()),
              i.move(y, h)
        } else {
          var v = i.lineHeight / n.height * 100;
          switch (s.lineAlign) {
            case "middle":
              a -= v / 2;
              break;
            case "end":
              a -= v
          }
          switch (s.vertical) {
            case "":
              e.applyStyles({
                top: e.formatStyle(a, "%")
              });
              break;
            case "rl":
              e.applyStyles({
                left: e.formatStyle(a, "%")
              });
              break;
            case "lr":
              e.applyStyles({
                right: e.formatStyle(a, "%")
              })
          }
          u = ["+y", "-x", "+x", "-y"],
              i = new p(e)
        }
        var g = r(i, u);
        e.move(g.toCSSCompatValues(n))
      }
      function h() {}
      var d = Object.create || function() {
        function t() {}
        return function(e) {
          if (1 !== arguments.length)
            throw new Error("Object.create shim only accepts one parameter.");
          return t.prototype = e,
              new t
        }
      }();
      e.prototype = d(Error.prototype),
          e.prototype.constructor = e,
          e.Errors = {
            BadSignature: {
              code: 0,
              message: "Malformed WebVTT signature."
            },
            BadTimeStamp: {
              code: 1,
              message: "Malformed time stamp."
            }
          },
          o.prototype = {
            set: function(t, e) {
              this.get(t) || "" === e || (this.values[t] = e)
            },
            get: function(t, e, n) {
              return n ? this.has(t) ? this.values[t] : e[n] : this.has(t) ? this.values[t] : e
            },
            has: function(t) {
              return t in this.values
            },
            alt: function(t, e, n) {
              for (var o = 0; o < n.length; ++o)
                if (e === n[o]) {
                  this.set(t, e);
                  break
                }
            },
            integer: function(t, e) {
              /^-?\d+$/.test(e) && this.set(t, parseInt(e, 10))
            },
            percent: function(t, e) {
              var n;
              return (n = e.match(/^([\d]{1,3})(\.[\d]*)?%$/)) && (e = parseFloat(e),
              e >= 0 && 100 >= e) ? (this.set(t, e),
                  !0) : !1
            }
          };
      var y = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&lrm;": "‎",
        "&rlm;": "‏",
        "&nbsp;": " "
      }
          , v = {
        c: "span",
        i: "i",
        b: "b",
        u: "u",
        ruby: "ruby",
        rt: "rt",
        v: "span",
        lang: "span"
      }
          , g = {
        v: "title",
        lang: "lang"
      }
          , m = {
        rt: "ruby"
      }
          , b = [1470, 1472, 1475, 1478, 1488, 1489, 1490, 1491, 1492, 1493, 1494, 1495, 1496, 1497, 1498, 1499, 1500, 1501, 1502, 1503, 1504, 1505, 1506, 1507, 1508, 1509, 1510, 1511, 1512, 1513, 1514, 1520, 1521, 1522, 1523, 1524, 1544, 1547, 1549, 1563, 1566, 1567, 1568, 1569, 1570, 1571, 1572, 1573, 1574, 1575, 1576, 1577, 1578, 1579, 1580, 1581, 1582, 1583, 1584, 1585, 1586, 1587, 1588, 1589, 1590, 1591, 1592, 1593, 1594, 1595, 1596, 1597, 1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609, 1610, 1645, 1646, 1647, 1649, 1650, 1651, 1652, 1653, 1654, 1655, 1656, 1657, 1658, 1659, 1660, 1661, 1662, 1663, 1664, 1665, 1666, 1667, 1668, 1669, 1670, 1671, 1672, 1673, 1674, 1675, 1676, 1677, 1678, 1679, 1680, 1681, 1682, 1683, 1684, 1685, 1686, 1687, 1688, 1689, 1690, 1691, 1692, 1693, 1694, 1695, 1696, 1697, 1698, 1699, 1700, 1701, 1702, 1703, 1704, 1705, 1706, 1707, 1708, 1709, 1710, 1711, 1712, 1713, 1714, 1715, 1716, 1717, 1718, 1719, 1720, 1721, 1722, 1723, 1724, 1725, 1726, 1727, 1728, 1729, 1730, 1731, 1732, 1733, 1734, 1735, 1736, 1737, 1738, 1739, 1740, 1741, 1742, 1743, 1744, 1745, 1746, 1747, 1748, 1749, 1765, 1766, 1774, 1775, 1786, 1787, 1788, 1789, 1790, 1791, 1792, 1793, 1794, 1795, 1796, 1797, 1798, 1799, 1800, 1801, 1802, 1803, 1804, 1805, 1807, 1808, 1810, 1811, 1812, 1813, 1814, 1815, 1816, 1817, 1818, 1819, 1820, 1821, 1822, 1823, 1824, 1825, 1826, 1827, 1828, 1829, 1830, 1831, 1832, 1833, 1834, 1835, 1836, 1837, 1838, 1839, 1869, 1870, 1871, 1872, 1873, 1874, 1875, 1876, 1877, 1878, 1879, 1880, 1881, 1882, 1883, 1884, 1885, 1886, 1887, 1888, 1889, 1890, 1891, 1892, 1893, 1894, 1895, 1896, 1897, 1898, 1899, 1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917, 1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1969, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2e3, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2036, 2037, 2042, 2048, 2049, 2050, 2051, 2052, 2053, 2054, 2055, 2056, 2057, 2058, 2059, 2060, 2061, 2062, 2063, 2064, 2065, 2066, 2067, 2068, 2069, 2074, 2084, 2088, 2096, 2097, 2098, 2099, 2100, 2101, 2102, 2103, 2104, 2105, 2106, 2107, 2108, 2109, 2110, 2112, 2113, 2114, 2115, 2116, 2117, 2118, 2119, 2120, 2121, 2122, 2123, 2124, 2125, 2126, 2127, 2128, 2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136, 2142, 2208, 2210, 2211, 2212, 2213, 2214, 2215, 2216, 2217, 2218, 2219, 2220, 8207, 64285, 64287, 64288, 64289, 64290, 64291, 64292, 64293, 64294, 64295, 64296, 64298, 64299, 64300, 64301, 64302, 64303, 64304, 64305, 64306, 64307, 64308, 64309, 64310, 64312, 64313, 64314, 64315, 64316, 64318, 64320, 64321, 64323, 64324, 64326, 64327, 64328, 64329, 64330, 64331, 64332, 64333, 64334, 64335, 64336, 64337, 64338, 64339, 64340, 64341, 64342, 64343, 64344, 64345, 64346, 64347, 64348, 64349, 64350, 64351, 64352, 64353, 64354, 64355, 64356, 64357, 64358, 64359, 64360, 64361, 64362, 64363, 64364, 64365, 64366, 64367, 64368, 64369, 64370, 64371, 64372, 64373, 64374, 64375, 64376, 64377, 64378, 64379, 64380, 64381, 64382, 64383, 64384, 64385, 64386, 64387, 64388, 64389, 64390, 64391, 64392, 64393, 64394, 64395, 64396, 64397, 64398, 64399, 64400, 64401, 64402, 64403, 64404, 64405, 64406, 64407, 64408, 64409, 64410, 64411, 64412, 64413, 64414, 64415, 64416, 64417, 64418, 64419, 64420, 64421, 64422, 64423, 64424, 64425, 64426, 64427, 64428, 64429, 64430, 64431, 64432, 64433, 64434, 64435, 64436, 64437, 64438, 64439, 64440, 64441, 64442, 64443, 64444, 64445, 64446, 64447, 64448, 64449, 64467, 64468, 64469, 64470, 64471, 64472, 64473, 64474, 64475, 64476, 64477, 64478, 64479, 64480, 64481, 64482, 64483, 64484, 64485, 64486, 64487, 64488, 64489, 64490, 64491, 64492, 64493, 64494, 64495, 64496, 64497, 64498, 64499, 64500, 64501, 64502, 64503, 64504, 64505, 64506, 64507, 64508, 64509, 64510, 64511, 64512, 64513, 64514, 64515, 64516, 64517, 64518, 64519, 64520, 64521, 64522, 64523, 64524, 64525, 64526, 64527, 64528, 64529, 64530, 64531, 64532, 64533, 64534, 64535, 64536, 64537, 64538, 64539, 64540, 64541, 64542, 64543, 64544, 64545, 64546, 64547, 64548, 64549, 64550, 64551, 64552, 64553, 64554, 64555, 64556, 64557, 64558, 64559, 64560, 64561, 64562, 64563, 64564, 64565, 64566, 64567, 64568, 64569, 64570, 64571, 64572, 64573, 64574, 64575, 64576, 64577, 64578, 64579, 64580, 64581, 64582, 64583, 64584, 64585, 64586, 64587, 64588, 64589, 64590, 64591, 64592, 64593, 64594, 64595, 64596, 64597, 64598, 64599, 64600, 64601, 64602, 64603, 64604, 64605, 64606, 64607, 64608, 64609, 64610, 64611, 64612, 64613, 64614, 64615, 64616, 64617, 64618, 64619, 64620, 64621, 64622, 64623, 64624, 64625, 64626, 64627, 64628, 64629, 64630, 64631, 64632, 64633, 64634, 64635, 64636, 64637, 64638, 64639, 64640, 64641, 64642, 64643, 64644, 64645, 64646, 64647, 64648, 64649, 64650, 64651, 64652, 64653, 64654, 64655, 64656, 64657, 64658, 64659, 64660, 64661, 64662, 64663, 64664, 64665, 64666, 64667, 64668, 64669, 64670, 64671, 64672, 64673, 64674, 64675, 64676, 64677, 64678, 64679, 64680, 64681, 64682, 64683, 64684, 64685, 64686, 64687, 64688, 64689, 64690, 64691, 64692, 64693, 64694, 64695, 64696, 64697, 64698, 64699, 64700, 64701, 64702, 64703, 64704, 64705, 64706, 64707, 64708, 64709, 64710, 64711, 64712, 64713, 64714, 64715, 64716, 64717, 64718, 64719, 64720, 64721, 64722, 64723, 64724, 64725, 64726, 64727, 64728, 64729, 64730, 64731, 64732, 64733, 64734, 64735, 64736, 64737, 64738, 64739, 64740, 64741, 64742, 64743, 64744, 64745, 64746, 64747, 64748, 64749, 64750, 64751, 64752, 64753, 64754, 64755, 64756, 64757, 64758, 64759, 64760, 64761, 64762, 64763, 64764, 64765, 64766, 64767, 64768, 64769, 64770, 64771, 64772, 64773, 64774, 64775, 64776, 64777, 64778, 64779, 64780, 64781, 64782, 64783, 64784, 64785, 64786, 64787, 64788, 64789, 64790, 64791, 64792, 64793, 64794, 64795, 64796, 64797, 64798, 64799, 64800, 64801, 64802, 64803, 64804, 64805, 64806, 64807, 64808, 64809, 64810, 64811, 64812, 64813, 64814, 64815, 64816, 64817, 64818, 64819, 64820, 64821, 64822, 64823, 64824, 64825, 64826, 64827, 64828, 64829, 64848, 64849, 64850, 64851, 64852, 64853, 64854, 64855, 64856, 64857, 64858, 64859, 64860, 64861, 64862, 64863, 64864, 64865, 64866, 64867, 64868, 64869, 64870, 64871, 64872, 64873, 64874, 64875, 64876, 64877, 64878, 64879, 64880, 64881, 64882, 64883, 64884, 64885, 64886, 64887, 64888, 64889, 64890, 64891, 64892, 64893, 64894, 64895, 64896, 64897, 64898, 64899, 64900, 64901, 64902, 64903, 64904, 64905, 64906, 64907, 64908, 64909, 64910, 64911, 64914, 64915, 64916, 64917, 64918, 64919, 64920, 64921, 64922, 64923, 64924, 64925, 64926, 64927, 64928, 64929, 64930, 64931, 64932, 64933, 64934, 64935, 64936, 64937, 64938, 64939, 64940, 64941, 64942, 64943, 64944, 64945, 64946, 64947, 64948, 64949, 64950, 64951, 64952, 64953, 64954, 64955, 64956, 64957, 64958, 64959, 64960, 64961, 64962, 64963, 64964, 64965, 64966, 64967, 65008, 65009, 65010, 65011, 65012, 65013, 65014, 65015, 65016, 65017, 65018, 65019, 65020, 65136, 65137, 65138, 65139, 65140, 65142, 65143, 65144, 65145, 65146, 65147, 65148, 65149, 65150, 65151, 65152, 65153, 65154, 65155, 65156, 65157, 65158, 65159, 65160, 65161, 65162, 65163, 65164, 65165, 65166, 65167, 65168, 65169, 65170, 65171, 65172, 65173, 65174, 65175, 65176, 65177, 65178, 65179, 65180, 65181, 65182, 65183, 65184, 65185, 65186, 65187, 65188, 65189, 65190, 65191, 65192, 65193, 65194, 65195, 65196, 65197, 65198, 65199, 65200, 65201, 65202, 65203, 65204, 65205, 65206, 65207, 65208, 65209, 65210, 65211, 65212, 65213, 65214, 65215, 65216, 65217, 65218, 65219, 65220, 65221, 65222, 65223, 65224, 65225, 65226, 65227, 65228, 65229, 65230, 65231, 65232, 65233, 65234, 65235, 65236, 65237, 65238, 65239, 65240, 65241, 65242, 65243, 65244, 65245, 65246, 65247, 65248, 65249, 65250, 65251, 65252, 65253, 65254, 65255, 65256, 65257, 65258, 65259, 65260, 65261, 65262, 65263, 65264, 65265, 65266, 65267, 65268, 65269, 65270, 65271, 65272, 65273, 65274, 65275, 65276, 67584, 67585, 67586, 67587, 67588, 67589, 67592, 67594, 67595, 67596, 67597, 67598, 67599, 67600, 67601, 67602, 67603, 67604, 67605, 67606, 67607, 67608, 67609, 67610, 67611, 67612, 67613, 67614, 67615, 67616, 67617, 67618, 67619, 67620, 67621, 67622, 67623, 67624, 67625, 67626, 67627, 67628, 67629, 67630, 67631, 67632, 67633, 67634, 67635, 67636, 67637, 67639, 67640, 67644, 67647, 67648, 67649, 67650, 67651, 67652, 67653, 67654, 67655, 67656, 67657, 67658, 67659, 67660, 67661, 67662, 67663, 67664, 67665, 67666, 67667, 67668, 67669, 67671, 67672, 67673, 67674, 67675, 67676, 67677, 67678, 67679, 67840, 67841, 67842, 67843, 67844, 67845, 67846, 67847, 67848, 67849, 67850, 67851, 67852, 67853, 67854, 67855, 67856, 67857, 67858, 67859, 67860, 67861, 67862, 67863, 67864, 67865, 67866, 67867, 67872, 67873, 67874, 67875, 67876, 67877, 67878, 67879, 67880, 67881, 67882, 67883, 67884, 67885, 67886, 67887, 67888, 67889, 67890, 67891, 67892, 67893, 67894, 67895, 67896, 67897, 67903, 67968, 67969, 67970, 67971, 67972, 67973, 67974, 67975, 67976, 67977, 67978, 67979, 67980, 67981, 67982, 67983, 67984, 67985, 67986, 67987, 67988, 67989, 67990, 67991, 67992, 67993, 67994, 67995, 67996, 67997, 67998, 67999, 68e3, 68001, 68002, 68003, 68004, 68005, 68006, 68007, 68008, 68009, 68010, 68011, 68012, 68013, 68014, 68015, 68016, 68017, 68018, 68019, 68020, 68021, 68022, 68023, 68030, 68031, 68096, 68112, 68113, 68114, 68115, 68117, 68118, 68119, 68121, 68122, 68123, 68124, 68125, 68126, 68127, 68128, 68129, 68130, 68131, 68132, 68133, 68134, 68135, 68136, 68137, 68138, 68139, 68140, 68141, 68142, 68143, 68144, 68145, 68146, 68147, 68160, 68161, 68162, 68163, 68164, 68165, 68166, 68167, 68176, 68177, 68178, 68179, 68180, 68181, 68182, 68183, 68184, 68192, 68193, 68194, 68195, 68196, 68197, 68198, 68199, 68200, 68201, 68202, 68203, 68204, 68205, 68206, 68207, 68208, 68209, 68210, 68211, 68212, 68213, 68214, 68215, 68216, 68217, 68218, 68219, 68220, 68221, 68222, 68223, 68352, 68353, 68354, 68355, 68356, 68357, 68358, 68359, 68360, 68361, 68362, 68363, 68364, 68365, 68366, 68367, 68368, 68369, 68370, 68371, 68372, 68373, 68374, 68375, 68376, 68377, 68378, 68379, 68380, 68381, 68382, 68383, 68384, 68385, 68386, 68387, 68388, 68389, 68390, 68391, 68392, 68393, 68394, 68395, 68396, 68397, 68398, 68399, 68400, 68401, 68402, 68403, 68404, 68405, 68416, 68417, 68418, 68419, 68420, 68421, 68422, 68423, 68424, 68425, 68426, 68427, 68428, 68429, 68430, 68431, 68432, 68433, 68434, 68435, 68436, 68437, 68440, 68441, 68442, 68443, 68444, 68445, 68446, 68447, 68448, 68449, 68450, 68451, 68452, 68453, 68454, 68455, 68456, 68457, 68458, 68459, 68460, 68461, 68462, 68463, 68464, 68465, 68466, 68472, 68473, 68474, 68475, 68476, 68477, 68478, 68479, 68608, 68609, 68610, 68611, 68612, 68613, 68614, 68615, 68616, 68617, 68618, 68619, 68620, 68621, 68622, 68623, 68624, 68625, 68626, 68627, 68628, 68629, 68630, 68631, 68632, 68633, 68634, 68635, 68636, 68637, 68638, 68639, 68640, 68641, 68642, 68643, 68644, 68645, 68646, 68647, 68648, 68649, 68650, 68651, 68652, 68653, 68654, 68655, 68656, 68657, 68658, 68659, 68660, 68661, 68662, 68663, 68664, 68665, 68666, 68667, 68668, 68669, 68670, 68671, 68672, 68673, 68674, 68675, 68676, 68677, 68678, 68679, 68680, 126464, 126465, 126466, 126467, 126469, 126470, 126471, 126472, 126473, 126474, 126475, 126476, 126477, 126478, 126479, 126480, 126481, 126482, 126483, 126484, 126485, 126486, 126487, 126488, 126489, 126490, 126491, 126492, 126493, 126494, 126495, 126497, 126498, 126500, 126503, 126505, 126506, 126507, 126508, 126509, 126510, 126511, 126512, 126513, 126514, 126516, 126517, 126518, 126519, 126521, 126523, 126530, 126535, 126537, 126539, 126541, 126542, 126543, 126545, 126546, 126548, 126551, 126553, 126555, 126557, 126559, 126561, 126562, 126564, 126567, 126568, 126569, 126570, 126572, 126573, 126574, 126575, 126576, 126577, 126578, 126580, 126581, 126582, 126583, 126585, 126586, 126587, 126588, 126590, 126592, 126593, 126594, 126595, 126596, 126597, 126598, 126599, 126600, 126601, 126603, 126604, 126605, 126606, 126607, 126608, 126609, 126610, 126611, 126612, 126613, 126614, 126615, 126616, 126617, 126618, 126619, 126625, 126626, 126627, 126629, 126630, 126631, 126632, 126633, 126635, 126636, 126637, 126638, 126639, 126640, 126641, 126642, 126643, 126644, 126645, 126646, 126647, 126648, 126649, 126650, 126651, 1114109];
      u.prototype.applyStyles = function(t, e) {
        e = e || this.div;
        for (var n in t)
          t.hasOwnProperty(n) && (e.style[n] = t[n])
      }
          ,
          u.prototype.formatStyle = function(t, e) {
            return 0 === t ? 0 : t + e
          }
          ,
          c.prototype = d(u.prototype),
          c.prototype.constructor = c,
          p.prototype.move = function(t, e) {
            switch (e = void 0 !== e ? e : this.lineHeight,
                t) {
              case "+x":
                this.left += e,
                    this.right += e;
                break;
              case "-x":
                this.left -= e,
                    this.right -= e;
                break;
              case "+y":
                this.top += e,
                    this.bottom += e;
                break;
              case "-y":
                this.top -= e,
                    this.bottom -= e
            }
          }
          ,
          p.prototype.overlaps = function(t) {
            return this.left < t.right && this.right > t.left && this.top < t.bottom && this.bottom > t.top
          }
          ,
          p.prototype.overlapsAny = function(t) {
            for (var e = 0; e < t.length; e++)
              if (this.overlaps(t[e]))
                return !0;
            return !1
          }
          ,
          p.prototype.within = function(t) {
            return this.top >= t.top && this.bottom <= t.bottom && this.left >= t.left && this.right <= t.right
          }
          ,
          p.prototype.overlapsOppositeAxis = function(t, e) {
            switch (e) {
              case "+x":
                return this.left < t.left;
              case "-x":
                return this.right > t.right;
              case "+y":
                return this.top < t.top;
              case "-y":
                return this.bottom > t.bottom
            }
          }
          ,
          p.prototype.intersectPercentage = function(t) {
            var e = Math.max(0, Math.min(this.right, t.right) - Math.max(this.left, t.left))
                , n = Math.max(0, Math.min(this.bottom, t.bottom) - Math.max(this.top, t.top))
                , o = e * n;
            return o / (this.height * this.width)
          }
          ,
          p.prototype.toCSSCompatValues = function(t) {
            return {
              top: this.top - t.top,
              bottom: t.bottom - this.bottom,
              left: this.left - t.left,
              right: t.right - this.right,
              height: this.height,
              width: this.width
            }
          }
          ,
          p.getSimpleBoxPosition = function(t) {
            var e = t.div ? t.div.offsetHeight : t.tagName ? t.offsetHeight : 0
                , n = t.div ? t.div.offsetWidth : t.tagName ? t.offsetWidth : 0
                , o = t.div ? t.div.offsetTop : t.tagName ? t.offsetTop : 0;
            t = t.div ? t.div.getBoundingClientRect() : t.tagName ? t.getBoundingClientRect() : t;
            var r = {
              left: t.left,
              right: t.right,
              top: t.top || o,
              height: t.height || e,
              bottom: t.bottom || o + (t.height || e),
              width: t.width || n
            };
            return r
          }
          ,
          h.StringDecoder = function() {
            return {
              decode: function(t) {
                if (!t)
                  return "";
                if ("string" != typeof t)
                  throw new Error("Error - expected string data.");
                return decodeURIComponent(encodeURIComponent(t))
              }
            }
          }
          ,
          h.convertCueToDOMTree = function(t, e) {
            return t && e ? s(t, e) : null
          }
      ;
      var _ = .05
          , j = "sans-serif"
          , w = "1.5%";
      h.processCues = function(t, e, n) {
        function o(t) {
          for (var e = 0; e < t.length; e++)
            if (t[e].hasBeenReset || !t[e].displayState)
              return !0;
          return !1
        }
        if (!t || !e || !n)
          return null;
        for (; n.firstChild; )
          n.removeChild(n.firstChild);
        var r = t.document.createElement("div");
        if (r.style.position = "absolute",
            r.style.left = "0",
            r.style.right = "0",
            r.style.top = "0",
            r.style.bottom = "0",
            r.style.margin = w,
            n.appendChild(r),
            o(e)) {
          var i = []
              , s = p.getSimpleBoxPosition(r)
              , a = Math.round(s.height * _ * 100) / 100
              , l = {
            font: a + "px " + j
          };
          !function() {
            for (var n, o, a = 0; a < e.length; a++)
              o = e[a],
                  n = new c(t,o,l),
                  r.appendChild(n.div),
                  f(t, n, s, i),
                  o.displayState = n.div,
                  i.push(p.getSimpleBoxPosition(n))
          }()
        } else
          for (var u = 0; u < e.length; u++)
            r.appendChild(e[u].displayState)
      }
          ,
          h.Parser = function(t, e, n) {
            n || (n = e,
                e = {}),
            e || (e = {}),
                this.window = t,
                this.vttjs = e,
                this.state = "INITIAL",
                this.buffer = "",
                this.decoder = n || new TextDecoder("utf8"),
                this.regionList = []
          }
          ,
          h.Parser.prototype = {
            reportOrThrowError: function(t) {
              if (!(t instanceof e))
                throw t;
              this.onparsingerror && this.onparsingerror(t)
            },
            parse: function(t) {
              function n() {
                for (var t = l.buffer, e = 0; e < t.length && "\r" !== t[e] && "\n" !== t[e]; )
                  ++e;
                var n = t.substr(0, e);
                return "\r" === t[e] && ++e,
                "\n" === t[e] && ++e,
                    l.buffer = t.substr(e),
                    n
              }
              function s(t) {
                var e = new o;
                if (r(t, function(t, n) {
                  switch (t) {
                    case "id":
                      e.set(t, n);
                      break;
                    case "width":
                      e.percent(t, n);
                      break;
                    case "lines":
                      e.integer(t, n);
                      break;
                    case "regionanchor":
                    case "viewportanchor":
                      var r = n.split(",");
                      if (2 !== r.length)
                        break;
                      var i = new o;
                      if (i.percent("x", r[0]),
                          i.percent("y", r[1]),
                      !i.has("x") || !i.has("y"))
                        break;
                      e.set(t + "X", i.get("x")),
                          e.set(t + "Y", i.get("y"));
                      break;
                    case "scroll":
                      e.alt(t, n, ["up"])
                  }
                }, /=/, /\s/),
                    e.has("id")) {
                  var n = new (l.vttjs.VTTRegion || l.window.VTTRegion);
                  n.width = e.get("width", 100),
                      n.lines = e.get("lines", 3),
                      n.regionAnchorX = e.get("regionanchorX", 0),
                      n.regionAnchorY = e.get("regionanchorY", 100),
                      n.viewportAnchorX = e.get("viewportanchorX", 0),
                      n.viewportAnchorY = e.get("viewportanchorY", 100),
                      n.scroll = e.get("scroll", ""),
                  l.onregion && l.onregion(n),
                      l.regionList.push({
                        id: e.get("id"),
                        region: n
                      })
                }
              }
              function a(t) {
                r(t, function(t, e) {
                  switch (t) {
                    case "Region":
                      s(e)
                  }
                }, /:/)
              }
              var l = this;
              t && (l.buffer += l.decoder.decode(t, {
                stream: !0
              }));
              try {
                var u;
                if ("INITIAL" === l.state) {
                  if (!/\r\n|\n/.test(l.buffer))
                    return this;
                  u = n();
                  var c = u.match(/^WEBVTT([ \t].*)?$/);
                  if (!c || !c[0])
                    throw new e(e.Errors.BadSignature);
                  l.state = "HEADER"
                }
                for (var p = !1; l.buffer; ) {
                  if (!/\r\n|\n/.test(l.buffer))
                    return this;
                  switch (p ? p = !1 : u = n(),
                      l.state) {
                    case "HEADER":
                      /:/.test(u) ? a(u) : u || (l.state = "ID");
                      continue;
                    case "NOTE":
                      u || (l.state = "ID");
                      continue;
                    case "ID":
                      if (/^NOTE($|[ \t])/.test(u)) {
                        l.state = "NOTE";
                        break
                      }
                      if (!u)
                        continue;
                      if (l.cue = new (l.vttjs.VTTCue || l.window.VTTCue)(0,0,""),
                          l.state = "CUE",
                      -1 === u.indexOf("-->")) {
                        l.cue.id = u;
                        continue
                      }
                    case "CUE":
                      try {
                        i(u, l.cue, l.regionList)
                      } catch (f) {
                        l.reportOrThrowError(f),
                            l.cue = null,
                            l.state = "BADCUE";
                        continue
                      }
                      l.state = "CUETEXT";
                      continue;
                    case "CUETEXT":
                      var h = -1 !== u.indexOf("-->");
                      if (!u || h && (p = !0)) {
                        l.oncue && l.oncue(l.cue),
                            l.cue = null,
                            l.state = "ID";
                        continue
                      }
                      l.cue.text && (l.cue.text += "\n"),
                          l.cue.text += u;
                      continue;
                    case "BADCUE":
                      u || (l.state = "ID");
                      continue
                  }
                }
              } catch (f) {
                l.reportOrThrowError(f),
                "CUETEXT" === l.state && l.cue && l.oncue && l.oncue(l.cue),
                    l.cue = null,
                    l.state = "INITIAL" === l.state ? "BADWEBVTT" : "BADCUE"
              }
              return this
            },
            flush: function() {
              var t = this;
              try {
                if (t.buffer += t.decoder.decode(),
                (t.cue || "HEADER" === t.state) && (t.buffer += "\n\n",
                    t.parse()),
                "INITIAL" === t.state)
                  throw new e(e.Errors.BadSignature)
              } catch (n) {
                t.reportOrThrowError(n)
              }
              return t.onflush && t.onflush(),
                  this
            }
          },
          t.WebVTT = h
    }(this, this.vttjs || {});
