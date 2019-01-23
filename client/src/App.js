import React, { Component } from 'react';
import './App.css';

//const SERVER_HOST = '0.0.0.0'
// const SERVER_HOST = '18.224.252.180'

const SERVER_PORT = '5000'
const SERVER_URL =  'http://' + SERVER_HOST + ':' + SERVER_PORT +'/'

export default class App extends Component {
  constructor() {
    super()

    this.state = {
      pyResp: []
    }
    this.getMonthlyExpenses()
  }

  handlePay = () => {
    fetch(SERVER_URL + 'pay?amount='+ this.state.amount + '&spent_type=' + this.state.spentType, {
      method: 'GET',
      dataType: 'json'
    }).then(() => this.setState({amount:'', spentType:'0', monthlyExpenses : this.getMonthlyExpenses()}))
  }

  componentDidMount(){
    this.getMonthlyExpenses()
  }

  getMonthlyExpenses(){
    console.log('getMonthlyExpenses')
    fetch(SERVER_URL + 'monthlyExpenses', {
      method: 'GET',
      dataType: 'json',
    })
      .then(r => r.json())
      .then(r => {
        console.log(r)
        this.setState({
          monthlyExpenses: r.monthlyExpenses,
          tomer: true
        })
      })
      .catch(err => console.log(err))
  }

  getLestTenExpenses(){
    console.log('getLestTenExpenses')
    return fetch(SERVER_URL + 'lestTenExpenses', {
      method: 'GET',
      dataType: 'json',
    })
      .then(r => r.json())
      .then(r => {
          console.log(r.lestTenExpenses)
  
      })
      .catch(err => console.log(err))
  }

  
  handleSpentTypeChanged = (e) => {
    console.log(e.target.value);
    this.setState({spentType: e.target.value});
  }


  handleAmountChanged = (e) => {
    console.log(e.target.value);
    
    this.setState({amount: e.target.value});
  }


  render() {
    return (
      <div className="App">
      <select value={this.state.spentType} onChange={this.handleSpentTypeChanged}>
        <option value="0">Chose Type</option>
        <option value="1">Bar</option>
        <option value="2">Resturant</option>
        <option value="3">Supermarket</option>
        <option value="4">Tamara</option>
        <option value="5">Fashion</option>
        <option value="6">Other</option>
      </select>
      <div/>
      <input type="text" value={this.state.amount} onChange={this.handleAmountChanged} />
      <div/>
      <button onClick={() => this.handlePay()}>Pay</button>
      <div> Total monthly expenses: {this.state.monthlyExpenses}</div>
      <div> Last expenses: {this.getLestTenExpenses()}</div>

      </div>
    );
  }
}
