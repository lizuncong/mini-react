import React from 'react'
import { Component } from './ReactBaseClasses'

export default class Counter extends Component{
    constructor(props){
        super(props)
        this.state = {
            number: 0
        }
    }

    handleClick = (event) => {
        this.setState({ number: this.state.number + 1})
        console.log('setState1', this.state)
        this.setState({ number: this.state.number + 1 })
        console.log('setState2', this.state)
        setTimeout(() => {
            this.setState({ number: this.state.number + 1})
            console.log('setTimeout setState1', this.state)
            this.setState({ number: this.state.number + 1 })
            console.log('setTimeout setState2', this.state)
        });
    }

    render(){
        console.log('render===', this.state)
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