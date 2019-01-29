import React, { Component } from 'react';
import './App.css';

import Cookies from 'universal-cookie';

const cookies = new Cookies();
//cookies.set('user_id', '2', { path: '/' });
//console.log(cookies.get('user_id'));


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
  12:'🍀 Green',
  13:'🏡 Rent Bill',
  14:'👩‍🍳 Gaz Bill',
  15:'🚰 Water Bill',
  16:'🔌 Electricity Bill',
  17:'🏢 Arnona Bill',
  18:'🏘️ House Committee',
  19:'🏋️️ GYM',
  160:'More..',
  200:'Less..'
}

export default class App extends Component {
  constructor(props) {
    super()
    this.props = {
      userID:props.userID
    }
    this.state = {
      displayAll: false,
      expenses:[],
      showMore: false,
      isMonthlyExpense: false,
    }

    this.fetchExpenses(this.state.displayAll)

  }

  handlePay = () => {
    fetch(serverUrl + 'pay?user_id=' + this.props.userID +'&amount='+
    this.state.amount + '&spent_type=' + this.state.spentType +'&is_monthly_expense=' +this.state.isMonthlyExpense, {
      method: 'GET',
      dataType: 'json'
    }).then(r => r.json())
      .then((json) => {

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
    this.setState({displayAll:true})
  }

  handleShowLess(){
    console.log('handleShowLess')
    this.setState({displayAll:false})
  }

  
  handleDeleteLatestTransaction = (idx) => {
    const deletePermenentExpense = idx != 0
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      fetch(serverUrl + 'deleteLatestTransaction?user_id=' + this.props.userID +'&deletePermenentExpense='+deletePermenentExpense,{
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
      console.log(result.expensesSum)
      console.log(result.expensesSum)

        this.setState({spentType: 0, amount:'', monthlyExpenses:result.expensesSum, expenses: result.expenses, displayAll, permanentIndex:result.permanentIndex})
    })
  }

  getExpenses(displayAll){
    let serverExpensesUrl = serverUrl  + 'expenses?user_id=' + this.props.userID
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
      <table className='paleBlueRows'>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Expense</th>
          </tr>
        </thead>
        <tbody>
      {
        expenses.map((expense, idx) => {
        if (idx >7){
          if (!this.state.displayAll)
            {
             return null ;
            }
        }


         return (<tr key={idx}>
                  <td>{expense[0]}</td>
                  <td className='spentType'>{SpenTypes[expense[1]]}</td>
                  <td>{expense[2]}
                      {idx === 0 || idx===this.state.permanentIndex ? <span className='deleteLatestTransaction' onClick={() => this.handleDeleteLatestTransaction(idx)}>❌</span>: ''}
                  </td>
                </tr>)
        })
      }
       </tbody>
       </table>
    );
  
  }
  
  handleSpentTypeChanged = (e) => {
    if (e.target.value == 160) // More..
    {
      this.setState({showMore: true});
    }
    else if(e.target.value == 200) // Less..
    {
      this.setState({showMore: false});
    }
    else{
      this.setState({spentType: e.target.value});
    }
  }

  handleCheck = () => { 
    const isMonthlyExpense = !this.state.isMonthlyExpense
    this.setState({isMonthlyExpense});
  }

  handleAmountChanged = (e) => {    
    this.setState({amount: e.target.value});
  }
 
 renderSelect(){
  return (
    <select className='inputLayout' value={this.state.spentType} onChange={this.handleSpentTypeChanged}>
      {
        Object.keys(SpenTypes).map((key, value) => {
          
          if (key < 8 ){
            if (key == 0){
              return (<option key={key} value={key} disabled>{SpenTypes[key]}</option>)
            }
            else{
              return (<option key={key} value={key} >{SpenTypes[key]}</option>)
            }
          }
          else{
            if (this.state.showMore)
            {
              if (key != 160)
              {
                return (<option key={key} value={key} >{SpenTypes[key]}</option>)
              }
            }
            else
            {
              if (key == 160)
              {
                return (<option key={key} value={key} >{SpenTypes[key]}</option>)
              }
            }
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
        <input type="text"  className='inputLayout' placeholder="amount.." value={this.state.amount} onChange={this.handleAmountChanged} />
        <div className="paymentButtons">
          <span className='checkboxLayout'onClick={()=>this.handleCheck()}>⇄</span> 
          {this.state.isMonthlyExpense ? 
          <button className='inputButton' onClick={() => this.handlePay()}> <div className='payText' >💳 Monthly Payment </div></button>:
          <button className='inputButton' onClick={() => this.handlePay()}> <div className='payText' >💵 One Time Payment </div></button>}
        </div>
      </div>
      {this.renderExpensesTable()} 
      <div className="endLayout">
        <div className="totalExpenses"> Total: {this.state.monthlyExpenses}</div>
        {this.state.displayAll ?  <span className="arrow" onClick={() => this.handleShowLess()}>⇧</span> :
          <span className="arrow" onClick={() => this.handleDisplayAll()}>⇩</span>}
        </div>
      </div>
    );
  }
}
