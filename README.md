## 从零实现自己的react
本文翻译自[build your own react](https://pomb.us/build-your-own-react/)，同时结合了我个人的理解。这篇文章我看了至少5遍，每看一遍收获都很大。我一直觉得，
写代码是一门技术，但能以简单的方式让别人理解则是一门艺术。这篇文章没有涉及太多的概念，由简单到复杂，从为什么到怎么做，思路清晰。这种精炼的好文章确实值得多读读(当然不是指读我的，能看英文的就看英文的)。

本文从零开始去实现一个简单的 `React`。遵循真实的 `React` 代码架构，只关注React核心架构，不考虑优化以及其他非必要的功能。

作者之前也写了很多关于[build your own React](https://engineering.hexacta.com/didact-learning-how-react-works-by-building-it-from-scratch-51007984e5c5)的文章，但是本文的不同之处在于是基于`React16.8`的版本，因此可以使用`hooks`相关的特性。


本文总共分成九个小节，从零开始一步一步实现一个简单的 `React`。
- 1.基本概念
- 2.`createElement`函数实现
- 3.`render`函数实现
- 4.Concurrent Mode 并发模式
- 5.Fibers（什么是Fibers？）
- 6.Render 及 Commit 阶段（为什么需要Commit阶段？？）
- 7.Reconciliation 协调阶段（这个阶段其实就是dom diff的一个阶段）
- 8.Function Components 函数式组件
- 9.Hooks 

对应的代码放在lib目录下


在阅读的过程中，最好带着问题，比如：
- render阶段，内存中到底有几棵树？
- 什么是Fiber Tree，什么是 Element Tree，两者有什么区别？两者又是通过什么关联的？
- 为什么需要Commit阶段
- 为什么需要Reconciliation阶段？
