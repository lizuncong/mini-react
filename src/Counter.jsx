import React, { useState } from 'react'

class Counter extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            number: 0
        }
    }
    handleClick = (event) => {
        this.setState({
            number: this.state.number + 1
        })
    }

    render(){
        return (
            <div>
                <p>{this.state.number}</p>
                <button onClick={this.handleClick}>+</button>
            </div>
        )
    }
}
export default Counter