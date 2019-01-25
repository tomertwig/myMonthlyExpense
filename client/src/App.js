import React, { Component } from 'react';
import './App.css';


export default class App extends Component {
  constructor() {
    super()

    this.state = {
      pyResp: [],
      lastTenExpenses:[]
    }
    fetch('https://api.ipify.org?format=json')
    .then(function(response) {
      return response.json();
    })
    .then((json) => {
      const serverHost = (json.ip === '93.173.170.102' ? '10.100.102.4' : '18.224.252.180')
      const serverPort = '5000'
      const serverUrl =  'http://' + serverHost + ':' + serverPort +'/'
      this.state.serverUrl = serverUrl
      this.fetchMonthlyExpensesAndLestTenExpenses()
    }); 

  }

  handlePay = () => {
    fetch(this.state.serverUrl + 'pay?amount='+ this.state.amount + '&spent_type=' + this.state.spentType, {
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

  getMonthlyExpenses = () => {
    console.log('getMonthlyExpenses')
    console.log(this.state.serverUrl)
    return fetch(this.state.serverUrl  + 'monthlyExpenses', {
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
    return fetch(this.state.serverUrl  + 'lestTenExpenses', {
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
        case 0: 
          return 'Chose Type'
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
        <option value="0">{this.getTypeName(0)}</option>
        <option value="1">{this.getTypeName(1)}</option>
        <option value="2">{this.getTypeName(2)}</option>
        <option value="3">{this.getTypeName(3)}</option>
        <option value="4">{this.getTypeName(4)}</option>
        <option value="5">{this.getTypeName(5)}</option>
        <option value="6">{this.getTypeName(6)}</option>
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
