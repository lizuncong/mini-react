function render(element, container){
  // 1.创建真实的dom元素。
  const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type); // 创建真实的dom

  // 2.给真实的dom元素添加属性
  const isProperty = key => key !== 'children';
  Object.keys(element.props)
      .filter(isProperty)
      .forEach(name => {
        dom[name] = element.props[name]
      })

  // 3.递归创建子元素。
  element.props.children.forEach(child => {
    render(child, dom)
  })

  // 4.添加到父容器中
  container.appendChild(dom);
}
