import React from 'react';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      show: false
    }
  }
  componentDidMount(){
    document.addEventListener('click', () => {
      console.log('handleDocumentClick')
      this.setState({
        show: false
      })
    })
  }

  handleButtonClick = e => {
    console.log('handleButtonClick', e.stopPropagation)
    e.nativeEvent.stopImmediatePropagation();
    this.setState({
      show: true
    })
  }

  render(){
    return (
      <div>
        <button onClick={this.handleButtonClick}>显示</button>
        {
          this.state.show && (
            <div>
              模态框
            </div>
          )
        }
      </div>
    )
  }
}
export default App;