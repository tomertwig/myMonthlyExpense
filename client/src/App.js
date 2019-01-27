import React, { Component } from 'react';
import './App.css';

import Cookies from 'universal-cookie';

const cookies = new Cookies();
//cookies.set('user_id', '2', { path: '/' });
console.log(cookies.get('user_id')); // Pacman


const hostName = window.location.hostname
const serverPort = '5000'
const serverUrl =  'http://' + hostName + ':' + serverPort +'/'
console.log(serverUrl)

const SpenTypes = {
  0:'Chose Type',
  1:'🛒 Supermarket ',
  2:'🍺 Bar',
  3:'🍽️ Restaurant',
  4:'🏥 SuperPharm ',
  5:'🚌 Rav-Kav',
  6:'👜 Fashion',
  7:'❓ Other',
  8:'🚕 Taxi',
  9:'👰🏻 Wedding',
  10:'🚗 Car2Go',
  11:'💅 Pedicure',
  12:'👩‍🍳 Gaz Bill',
  13:'🚰 Water Bill',
  14:'🔌 Electricity Bill',
  15:'🏢 Arnona Bill',
  16:'🏘️ House Committee',
  17:'🍀 Weed',
  160:'More..',
  170:'Less..'
}

const user_id = cookies.get('user_id')
console.log(user_id); // user_id

export default class App extends Component {
  constructor() {
    super()

    this.state = {
      displayAll: false,
      expenses:[],
      showMore: false,
    }

    this.fetchExpenses(this.state.displayAll)

  }

  handlePay = () => {
    console.log(user_id)
    fetch(serverUrl + 'pay?user_id=' + user_id +'&amount='+ this.state.amount + '&spent_type=' + this.state.spentType, {
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
      this.fetchExpenses(this.state.displayAll)
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
      fetch(serverUrl + 'deleteLatestTransaction?user_id=' + user_id,{
        method: 'GET',
        dataType: 'json'
      }).then(() => {
        this.fetchExpenses(this.state.displayAll)
        })
    }
  }
  
  fetchExpenses = (displayAll) => {
    let expenses = this.getExpenses(displayAll);
    expenses.then(result => {
        this.setState({spentType: 0, amount:'', monthlyExpenses:result.expensesSum, expenses: result.expenses, displayAll})
    })
  }

  getExpenses(displayAll){
    let serverExpensesUrl = serverUrl  + 'expenses?user_id=' + user_id
    if (displayAll)
    {
      serverExpensesUrl += '&all=1'
    }
    return fetch(serverExpensesUrl, {
      method: 'GET',
      dataType: 'json',
    })
      .then(r => r.json())
      .then(r => {
        return r
      })
      .catch(err => console.log(err))
    }


  renderExpensesTable(){
    const expenses = this.state.expenses

    return (
      <table>
          <tr>
            <th>Date</th>
            <th className='TypeHeader'>Type</th>
            <th>Expense</th>
          </tr>
      {
        expenses.map((expense, idx) => {
         return (<tr key={idx}>
                  <td>{expense[0]}</td>
                  <td className='spentType'>{SpenTypes[expense[1]]}</td>
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
    if (e.target.value == 160) // More..
    {
      this.setState({showMore: true});
    }
    else if(e.target.value == 170) // Less..
    {
      this.setState({showMore: false});
    }
    else
    {
      this.setState({spentType: e.target.value});
    }
  }


  handleAmountChanged = (e) => {    
    this.setState({amount: e.target.value});
  }
 
 renderSelect(){
  return (
    <select value={this.state.spentType} onChange={this.handleSpentTypeChanged}>
      {Object.keys(SpenTypes).map((key, value) => {
        if (this.state.showMore)
        {
          if (key != 160)
          {
            return (<option key={key} value={key}>{SpenTypes[key]}</option>)
          }
        }
        else if (key < 8 || key == 160)
        {
          return (<option key={key} value={key}>{SpenTypes[key]}</option>)
        }
      })}
    </select>
  );
}

  render() {
    return (
      <div className="App">
      <div className="inputForm">
        {this.renderSelect()}
        <input type="text"  placeholder="amount.." value={this.state.amount} onChange={this.handleAmountChanged} />
        <button onClick={() => this.handlePay()}> <div className='payText' >💵 Pay </div></button>
      </div>
      <div> Total: {this.state.monthlyExpenses}</div>
      {this.renderExpensesTable()} 
      {this.state.displayAll ? <a href='#' onClick={() => this.handleShowLess()}>Show less..</a>
       : <a href='#' onClick={() => this.handleDisplayAll()}>Show all..</a>}


      </div>
    );
  }
}
