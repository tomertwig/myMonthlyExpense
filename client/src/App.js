import React, { Component } from 'react';
import './App.css';


const hostName = window.location.hostname
const serverPort = '5000'
const serverUrl =  'http://' + hostName + ':' + serverPort +'/'
console.log('serverUrl')
console.log(serverUrl)


export default class App extends Component {
  constructor() {
    super()

    this.state = {
      displayAll: false,
      expenses:[]
    }
    this.fetchExpenses()

  }

  handlePay = () => {
    fetch(serverUrl + 'pay?amount='+ this.state.amount + '&spent_type=' + this.state.spentType, {
      method: 'GET',
      dataType: 'json'
    }).then(r => r.json())
      .then((json) => {
      console.log(json)

      if (json.result === 'failed')
      {
        alert("Invalid Input");
        return;
      }
      this.fetchExpenses()
      })
  }

  handleDisplayAll(){
    console.log('handleDisplayAll')
    this.fetchExpenses(true)
  }

  handleShowLess(){
    console.log('handleShowLess')
    this.fetchExpenses(false)
  }

  
  handleDeleteLatestTransaction = () => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      fetch(serverUrl + 'deleteLatestTransaction',{
        method: 'GET',
        dataType: 'json'
      }).then(() => {
        this.fetchExpenses()
        })
    }

  }
  
  fetchExpenses = (displayAll) => {
    let expenses = this.getExpenses(displayAll);
    expenses.then(result => {
        console.log('fetchExpenses')
        console.log(result)
        console.log('fetchExpenses_end')

        this.setState({spentType: 0, amount:'', monthlyExpenses:result.expensesSum, expenses: result.expenses, displayAll})
    })
  }

  getMonthlyExpenses = () => {
    console.log('getMonthlyExpenses')
    return fetch(serverUrl  + 'monthlyExpenses', {
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

  getExpenses(displayAll){
    console.log('displayAll')

    console.log(displayAll)
    let serverExpensesUrl = serverUrl  + 'expenses'
    if (displayAll)
    {
      serverExpensesUrl += '?all=1'
    }
    return fetch(serverExpensesUrl, {
      method: 'GET',
      dataType: 'json',
    })
      .then(r => r.json())
      .then(r => {
        //console.log(r)
        return r
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


  renderExpensesTable(){
    const expenses = this.state.expenses
    console.log('renderExpensesTable')
    console.log(expenses)

    return (
      <table>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Expense</th>
          </tr>
      {
        expenses.map((expense, idx) => {
         return (<tr key={idx}>
                  <td>{expense[0]}</td>
                  <td>{this.getTypeName.call(this, expense[1])}</td>
                  <td>{expense[2]}
                      {idx === 0? <span className='deleteLatestTransaction' onClick={() => this.handleDeleteLatestTransaction()}>↩️</span>: ''}
                  </td>

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
      <div className="inputForm">
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
        <input type="text"  placeholder="amount.." value={this.state.amount} onChange={this.handleAmountChanged} />
        <div/>
      <button onClick={() => this.handlePay()}>Pay</button>
      </div>
      <div> Total: {this.state.monthlyExpenses}</div>
      {this.renderExpensesTable()} 
      {this.state.displayAll ? <button onClick={() => this.handleShowLess()}>show less..</button>
       : <button onClick={() => this.handleDisplayAll()}>show all..</button>}


      </div>
    );
  }
}
