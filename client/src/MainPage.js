
import $ from "jquery";
import React, { Component } from 'react';
import './App.css';
import MonthlyExpensesPage from "./MonthlyExpensesPage";
import {serverUrl} from './Browse'

export const InfoType = {TransactionsTable:0, SumupTable:1, Chart:2}

const ExpenseType = {OneTime:0, Unusual:1, Monthly:2}
export const ActiveTab = {OneTime:0, UnusualExpenses:1, Monthly:2, Total:3}

export default class App extends Component {
  

  constructor(props) {
    super(props)
    console.log(props.spentTypes)
    console.log('App.props.spentTypes')

    this.props = {
      userID:props.userID,
      spentTypes: props.spentTypes
    }

    this.state = {
      expenseType: ExpenseType.OneTime,
      spentTypeKey: -1,
      filteredOptions: {},
      textValue:'',
      activeTab:ActiveTab.OneTime,
    }
  }


  handlePay = () => {
    $('input').blur();
    
    let expenseType;
    if (this.state.activeTab == ActiveTab.OneTime)
    {
      expenseType = ExpenseType.OneTime
    }
    else if (this.state.activeTab  == ActiveTab.UnusualExpenses)
    {
      expenseType = ExpenseType.Unusual
    }
    else
    {
      expenseType = ExpenseType.Monthly
    }

    fetch(serverUrl+ 'pay?user_id=' + this.props.userID +'&amount='+
    this.state.amount + '&spent_type=' + this.state.spentTypeKey +'&expense_type=' + expenseType, {
      method: 'GET',
      dataType: 'json'
    }).then(r => r.json())
      .then((json) => {
        this.setState({textValue:'', spentTypeKey: -1, amount:'', infoType:InfoType.TransactionsTable})
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
   for(var key in this.props.spentTypes){
       if (this.props.spentTypes[key][1])
       {
        const item = this.props.spentTypes[key][0];
        if (item.replace(/[^\x00-\x7F]/g, "").substr(1).toUpperCase().startsWith(value.toUpperCase()) || value =='') {
           filteredOptions[key] = item;
       }
   }

   this.setState({
       filteredOptions: filteredOptions,
       textValue: value,
   });
}
}

handleActiveTabChanged = (activeTab) => 
{
  $('input').attr('disabled', activeTab == ActiveTab.Total)
  $('input').attr('disabled', activeTab == ActiveTab.Total)

  this.setState({activeTab})
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
      </div>
      <MonthlyExpensesPage
       userID={this.props.userID}
       mounth={mm}
       year={yyyy}
       writePermissions={true}
       handlePayCallback={this.handlePay}
       handleActiveTabChangedCallBack = {this.handleActiveTabChanged}
       activeTab={this.state.activeTab}
       infoType={this.state.infoType}
       spentTypes={this.props.spentTypes}>
      </MonthlyExpensesPage>
      </div>
    );
  }
}
