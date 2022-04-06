import React from 'react'

export default class Counter extends React.Component{
    constructor(){
        this.state = {
            number: 0
        }
    }

    handleClick = (event) => {
        this.setState({ number: this.state.number + 1})
        console.log('setState1', this.state)
        this.setState({ number: this.state.number + 1 })
        console.log('setState2', this.state)
    }

    render(){
        return (
            <div>
                <p>{this.state.number}</p>
                <button
                    onClick={this.handleClick}
                >
                    +
                </button>
            </div>
        )
    }
}