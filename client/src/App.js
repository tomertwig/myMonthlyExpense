import React, { Component } from 'react';
import './App.css';

// const SERVER_HOST = '10.100.102.4'
// const SERVER_HOST = '18.224.252.180'

const SERVER_PORT = '5000'
const SERVER_URL =  'http://' + SERVER_HOST + ':' + SERVER_PORT +'/'

export default class App extends Component {
  constructor() {
    super()

    this.state = {
      pyResp: [],
      lastTenExpenses:[]
    }
//    this.getMonthlyExpenses().then(response => console.log(response));
  }

  handlePay = () => {
    console.log('Tomer');

    fetch(SERVER_URL + 'pay?amount='+ this.state.amount + '&spent_type=' + this.state.spentType, {
      method: 'GET',
      dataType: 'json'
    }).then(() => {
      this.fetchMonthlyExpensesAndLestTenExpenses()
      })
  }

  fetchMonthlyExpensesAndLestTenExpenses = () => {
    let monthlyExpenses = this.getMonthlyExpenses();
    monthlyExpenses.then(monthlyExpensesValue => {
      let lestTenExpenses = this.getLestTenExpenses();
      lestTenExpenses.then(lestTenExpensesValue => {
          console.log(lestTenExpensesValue)
          this.setState({spentType: 0, amount:'', monthlyExpenses:monthlyExpensesValue, lastTenExpenses: lestTenExpensesValue})
      })
    })
  }

  componentDidMount(){
   // this.getMonthlyExpenses().then(response => console.log(response));

  //  const monthlyExpenses = this.getMonthlyExpenses()
//    const lestTenExpenses = this.getLestTenExpenses()
    //console.log(monthlyExpenses)
    //console.log(lestTenExpenses)

    //this.setState({monthlyExpenses, lestTenExpenses})
  }

  getMonthlyExpenses(){
    console.log('getMonthlyExpenses')
    return fetch(SERVER_URL + 'monthlyExpenses', {
      method: 'GET',
      dataType: 'json',
    })
      .then(r => r.json())
      .then(r => {
        //console.log(r)
        return r.monthlyExpenses
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
        //console.log(r)
        return r.lestTenExpenses
      })
      .catch(err => console.log(err))
    }
    
    getTypeName(t) {
      switch(t) {
        case 1:
          return 'Bar'
        case 2:
          return 'Resturant'
        case 3:
          return 'Supermarket'
        case 4:
          return 'Tamara'
        case 5:
          return 'Fashion'
        case 6:
          return 'Other'
        default:
          return 'Other'
       }
    }


  renderLastTenExpenses(){
    const lastTenExpenses = this.state.lastTenExpenses
    console.log('lastTenExpenses')
    console.log(lastTenExpenses)

    if (lastTenExpenses === [])
      return;
    //let tomer = this.getTypeName(1)

    return (
      <table>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Expense</th>
          </tr>
      {
        lastTenExpenses.map((expense, idx) => {
         return (<tr key={idx}>
                  <td>{expense[0]}</td>
                  <td>{this.getTypeName.call(this, expense[1])}</td>
                  <td>{expense[2]} </td>
                  </tr>)
        })
      }
       </table>
    );
  
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
    console.log('render')
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
      {this.renderLastTenExpenses()} 
      </div>
    );
  }
}
