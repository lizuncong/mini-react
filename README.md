## 从零实现自己的react
本文翻译自[build your own react](https://pomb.us/build-your-own-react/)，不是生硬的翻译，会结合我个人的理解去写。这篇文章我看了至少5遍，每看一遍收获都很大。我一直觉得，
写代码是一门技术，但能以简单的方式让别人理解则是一门艺术。这篇文章没有涉及太多的概念，由简单到复杂，从为什么到怎么做，思路清晰。确实值得多读读(当然不是指读我的，能看英文的就看英文的)。

本文从零开始去实现一个简单的 `React`。遵循真实的 `React` 代码架构，只关注核心功能，不考虑优化以及其他非必要的功能。

作者之前也写了很多关于[build your own React]()的文章，但是本文的不同之处在于是基于 `React` 16.8的版本，因此可以使用 `hooks`相关的特性。


下面我们会从以下几步一点一点的实现一个简单的 `React`。
- 1.`createElement`函数实现
- 2.`render`函数实现
- 3.Concurrent Mode 并发模式
- 4.Fibers（什么是Fibers？）
- 5.Render 及 Commit 阶段（为什么需要Commit阶段？？）
- 6.Reconciliation 协调阶段（这个阶段其实就是dom diff的一个阶段）
- 7.Function Components 函数式组件
- 8.Hooks 

#### 基本概念
这一节主要介绍一些基本概念。如果你已经对`React`，`JSX`以及`DOM`有了很好的理解，这一节其实可以跳过的。
以下面三行代码为例：
```jsx harmony
const element = <h1 title="foo">Hello</h1> // jsx语法，js是无法识别这种语法的。
const container = document.getElementById("root")
ReactDOM.render(element, container)
```
第一行代码并不是一个合法的js语法，而是jsx语法，需要借助babel将jsx语法转换成js。
```jsx harmony
const element = React.createElement(
    "h1", 
    { title: "foo" }, 
    "Hello"
)
const container = document.getElementById("root")
ReactDOM.render(element, container)
```
如果这里没明白babel怎么转换的jsx语法，可以去[babel 官网](https://babeljs.io/)。
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/babel.jpg)

