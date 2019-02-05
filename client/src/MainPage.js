
import $ from "jquery";
import React, { Component } from 'react';
import './App.css';
import MonthlyExpensesPage from "./MonthlyExpensesPage";
import {serverUrl} from './Browse'

export const SpenTypes = {
  1:'🛒 Supermarket',
  2:'🍺 Bar',
  3:'🍽️ Restaurant',
  4:'🏥 SuperPharm',
  5:'🚌 Rav-Kav',
  6:'🥤 Tamara',
  8:'🚕 Taxi',
  9:'👜 Fashion',
  10:'🥂 Events',
  11:'🚗 Car2Go',
  12:'💅 Pedicure',
  13:'🏡 Rent Bill',
  14:'👩‍🍳 Gas Bill',
  15:'🚰 Water Bill',
  16:'🔌 Electricity Bill',
  17:'🏢 Arnona Bill',
  18:'🏘️ House Committee',
  19:'🌐 Internet Bill',
  20:'🏋️️ GYM',
  21:'☕ Coffee',
  22:'⚽ Soccer',
  23:'🍀 Green',
  100:'❓ Other',
}


export const ActiveTab = {OneTime:0, Monthly:1, Total:2}


export default class App extends Component {
  

  constructor(props) {
    super()
    this.props = {
      userID:props.userID,
    }
    this.state = {
      isMonthlyExpense: false,
      spentTypeKey: -1,
      filteredOptions: {},
      textValue:'',
      activeTab: ActiveTab.OneTime
    }
  }

  handlePay = () => {
    $('input').blur();
    fetch(serverUrl+ 'pay?user_id=' + this.props.userID +'&amount='+
    this.state.amount + '&spent_type=' + this.state.spentTypeKey +'&is_monthly_expense=' +this.state.isMonthlyExpense, {
      method: 'GET',
      dataType: 'json'
    }).then(r => r.json())
      .then((json) => {
        this.setState({textValue:'', spentTypeKey: -1, amount:'', isChart:false})
      if (json.result === 'failed')
      {
        alert("Invalid Input");
        return;
      }
    })
  }
  
  handleSpentTypeChanged = (key) => {
    this.setState({spentTypeKey: key});
  }

  handleCheck = () => { 
    const isMonthlyExpense = !this.state.isMonthlyExpense
    const activeTab = isMonthlyExpense ? ActiveTab.Monthly : ActiveTab.OneTime 
    this.setState({isMonthlyExpense, activeTab});
  }

  handleAmountChanged = (e) => {    
    this.setState({amount: e.target.value});
  }

updateFilter = (evt) => {
  $(".DataListOption:first-child").css("background-color", "#D0E4F5");

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

  if (e.key === 'Enter') {
    var filteredOptionsKeys = Object.keys(this.state.filteredOptions)

    if (filteredOptionsKeys.length >0)
    {
      this.handleClick(filteredOptionsKeys[0])
      $('input').focus();

    }
  }
}

handleKeyPressedForNumber= (e) => {
  if (e.key === 'Enter') {
      $('input').blur();
  }
}

renderSelect(){

  let displayList = Object.keys(this.state.filteredOptions).map((key, index) => {
      return (<div className='DataListOption' data-id={key} onClick={()=>this.handleClick(key)} >{this.state.filteredOptions[key]}</div>)
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
    var today = new Date();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    return (
      <div>
      <div className="inputMainPageForm">
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
      <MonthlyExpensesPage
       userID={this.props.userID}
       mounth={mm}
       year={yyyy}
       writePermissions={true}
       activeTab={this.state.activeTab}
       chart={this.state.isChart}>
      </MonthlyExpensesPage>
      </div>
    );
  }
}
