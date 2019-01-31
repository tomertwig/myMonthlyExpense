
import $ from "jquery";
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
  1:'🛒 Supermarket',
  2:'🍺 Bar',
  3:'🍽️ Restaurant',
  4:'🏥 SuperPharm',
  5:'🚌 Rav-Kav',
  6:'👜 Fashion',
  8:'🚕 Taxi',
  9:'🥂 Events',
  10:'🚗 Car2Go',
  11:'💅 Pedicure',
  12:'🍀 Green',
  13:'🏡 Rent Bill',
  14:'👩‍🍳 Gas Bill',
  15:'🚰 Water Bill',
  16:'🔌 Electricity Bill',
  17:'🏢 Arnona Bill',
  18:'🏘️ House Committee',
  19:'🌐 Internet Bill',
  20:'🏋️️ GYM',
  21:'☕ Coffee',
  100:'❓ Other',
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
      isMonthlyExpense: false,
      spentTypeKey: -1,
      filteredOptions: {},
      textValue:''
    }

    this.fetchExpenses(this.state.displayAll)

  }

  handlePay = () => {
    $('input').blur();
    fetch(serverUrl + 'pay?user_id=' + this.props.userID +'&amount='+
    this.state.amount + '&spent_type=' + this.state.spentTypeKey +'&is_monthly_expense=' +this.state.isMonthlyExpense, {
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

      this.setState({textValue:'', spentTypeKey: -1, amount:'', monthlyExpenses:result.expensesSum, expenses: result.expenses, displayAll, permanentIndex:result.permanentIndex})
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
  
  handleSpentTypeChanged = (key) => {
    console.log('handleSpentTypeChanged')

    console.log(key)
    this.setState({spentTypeKey: key});
  }

  handleCheck = () => { 
    const isMonthlyExpense = !this.state.isMonthlyExpense
    this.setState({isMonthlyExpense});
  }

  handleAmountChanged = (e) => {    
    this.setState({amount: e.target.value});
  }

updateFilter = (evt) => {
  console.log('updateFilter')
   let value = '';

   if (evt) {
       value = evt.target.value;
   }
   let filteredOptions = {};
   for(var key in SpenTypes){
       const item = SpenTypes[key];
       if (item.replace(/[^\x00-\x7F]/g, "").substr(1).toUpperCase().startsWith(value.toUpperCase()) || value =='') {
          filteredOptions[key] = item;
   }

   this.setState({
       filteredOptions: filteredOptions,
       textValue: value,
   });
}
}

handleClick = (key) => {
  console.log(key)
  this.handleSpentTypeChanged(key)
  this.setState({textValue: this.state.filteredOptions[key]})
  this.hideList();
}

showList = () => {
 this.updateFilter()
  this.setState({
      expanded: true
  });
}

hideList() { // whe we click that name after by this function the list hide.
  this.setState({
          expanded: false
  });
}

handleKeyPressedForList = (e) => {
  console.log(e)
  if (e.key === 'Enter') {
    console.log(this.state.filteredOptions)
    var filteredOptionsKeys = Object.keys(this.state.filteredOptions)

    if (filteredOptionsKeys.length >0)
    {

      console.log('this.state.filteredOptions')

      console.log(filteredOptionsKeys[0])

      this.handleClick(filteredOptionsKeys[0])
      $('input').focus();

    }
  }
}

handleKeyPressedForNumber= (e) => {
  console.log(e)
  if (e.key === 'Enter') {
      $('input').blur();
  }
}

renderSelect(){
  console.log('renderSelect')
  console.log(this.state.filteredOptions)
  let displayList = Object.keys(this.state.filteredOptions).map((key, index) => {
      return (<div className='DataListOption' data-id={key} onClick={()=>this.handleClick(key)}>{this.state.filteredOptions[key]}</div>)
    })




  const  { textValue } = this.state;
  console.log(textValue)
  return(
    <div className="dropdown">
      <input className="dropbtn" type="text" value={textValue}  onKeyPress={this.handleKeyPressedForList} 
        onChange={this.updateFilter.bind(this)} onFocus={this.showList} placeholder="Chose type.." />
      {this.state.expanded && displayList?
      <div className="dropdown-content">
        {this.state.expanded && displayList}
      </div>: null
      }
    </div>
  )
}

  render() {
    return (
      <div className="App">
      <div className="inputForm">
        {this.renderSelect()}
        <input type="number" pattern="[0-9]*"   className='inputLayout1' placeholder="Enter amount.." 
          value={this.state.amount} onChange={this.handleAmountChanged} onKeyPress={this.handleKeyPressedForNumber} />
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
