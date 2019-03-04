import React, { Component } from 'react';
import './App.css';
import Cookies from 'universal-cookie';
import { BrowserRouter, Route} from 'react-router-dom';
import HistoryPage from './HistoryPage';
import $ from "jquery";

import MonthlyExpensesPage from './MonthlyExpensesPage';
import MainPage from './MainPage';
import EditTypePage from './editTypePage';
var SHA256 = require("crypto-js/sha256");
const hostName = window.location.hostname
const serverPort = '5000'
const clientPort = '80'

export const serverUrl =  'http://' + hostName + ':' + serverPort +'/'
export const clientUrl = 'http://' + hostName + ':' + clientPort +'/'


export const getSpentTypes= (userID) => {
    let serverSpentTypesUrl = serverUrl  + 'spent_types?user_id=' +userID 
  
    console.log(serverSpentTypesUrl)
    return fetch(serverSpentTypesUrl, {
        method: 'GET',
        dataType: 'json',
    })
        .then(r => r.json())
        .then(r => {
        return r
        })
        .catch(err => console.log(err))
  }

export default class Auth extends Component {
  constructor() {
    super()
    const cookies = new Cookies();
    
    const userID = cookies.get('user_id') || null;

    this.state = {
        userName:'',
        password:'',
        userID,
    }
    this.fetchSpentTypes()
  }
    
  fetchSpentTypes = () => {
    console.log('fetchSpentTypes')
    const spetTypes = getSpentTypes(this.state.userID)
    spetTypes.then(result => {
      console.log(result.spentTypes)
      console.log('result.spentTypes browsss')

      this.setState({spentTypes:result.spentTypes})
    })
}
  
  handleUserName = (e) => {  
    this.setState({userName:e.target.value})
  }
  handlePassword = (e) => {  
    this.setState({password:e.target.value})
  }
  handleLogin = () => {  

    fetch(serverUrl + 'login?user_name=' + this.state.userName +'&password='+  SHA256(this.state.password), {
        method: 'GET',
        dataType: 'json'
      }).then(r => r.json())
        .then((json) => {
  
        if (json.result === 'failed')
        {
            alert("Invalid user name or password");
            this.setState({password:''})
            return;
        }
        const cookies = new Cookies();
        cookies.set('user_id', json.userID, { path: '/' });
        this.setState({userID:json.userID})
        this.fetchSpentTypes()
    })
  }

  handleSignIn = () => {

    fetch(serverUrl + 'signin?user_name=' + this.state.userName +'&password='+ SHA256(this.state.password), {
        method: 'GET',
        dataType: 'json'
      }).then(r => r.json())
        .then((json) => {
  
        if (json.result === 'failed')
        {
          alert("Invalid Input");
          return;
        }
    })
  }

renderSignInPage() {

    $("body").css("background-color", "#61dafb");

    return (
        <div className="App">
            <div className="inputForm">
                <div className="inputForm1">
                <input  className="LoginButton" type="text"  placeholder="User name.." value={this.state.userName} onChange={this.handleUserName} />
                <input  className="LoginButton" type="password"  placeholder="Password.." value={this.state.password} onChange={this.handlePassword} />
                <button className="SignInButton" onClick={() => this.handleLogin()}> <div>Login </div></button>
                <button className="SignInButton" onClick={() => this.handleSignIn()}> <div> Sign-in </div></button>
                </div>

            </div>
        </div>
        );
}

renderHomeButton()
{
    return(
        <img className="iconButton" src={require('./home_icon2.png')} width="42" height="42"/>
    )
}

renderCalenderButton()
{
    return(
        <img className="iconButton" src={require('./calender_icon3.png')} width="42" height="42"/>
    )  
}

renderPlusButton()
{
    return(
        <img className="iconButton" src={require('./edit.png')} width="42" height="42"/>
    )  
}



renderMonthExpensesTable()
{
    const startMonth = 1
    const startYear = 2019
    
    var today = new Date();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    const end_month = mm
    const end_year = yyyy
    
    const ym_start= 12*startYear + startMonth - 1
    const ym_end= 12*end_year + end_month - 1

    let result = []
    for (var ym = ym_start; ym < ym_end + 1; ym++) { 
        const year = Math.floor(ym/12);
        const m  = (ym % 12) +1;
        const month = ("0" + m).slice(-2);
        console.log('mm')

        console.log('/history/'+month+'-'+year)
        console.log(ym)
        result.push(<Route key={ym} exact={true} path={'/history/'+month+'-'+year} render={() => (
                  <MonthlyExpensesPage
                    userID={this.state.userID}
                    mounth={month} 
                    year={year}
                    spentTypes={this.state.spentTypes}>
                  </MonthlyExpensesPage>
        )}/>)
      }

    return result;
}


renderHomeIcon()
{
    const isHomeActive = (window.location.href == clientUrl+'/' || window.location.href == clientUrl)
    return (isHomeActive ? <a className={'active'}> <i> {this.renderHomeButton()}</i></a>:
     <a href="/" ><i> {this.renderHomeButton()}</i></a> )
}
renderCalenderIcon()
{
    const isCalenderActive = window.location.href.includes(clientUrl+'history')

    const isCalenderRef= (window.location.href != clientUrl+'history')
    if (isCalenderActive)
    {
        if (isCalenderRef)
        {
            return  <a className={'active'} href={clientUrl + 'history'}> <i className="Calender"> {this.renderCalenderButton()}</i></a>
        }
        else
        {
            return  <a className={'active'}> <i className="Calender"> {this.renderCalenderButton()}</i></a>
        }
    }
    else
    {
        return <a href={clientUrl + 'history'}><i> {this.renderCalenderButton()}</i></a>

    }
}

renderPlusIcon()
{
    const isPlusActive = window.location.href.includes(clientUrl+'edit_types')
    return (isPlusActive ? <a className={'active'}> <i> {this.renderPlusButton()}</i></a>:
     <a href={clientUrl+'edit_types'}><i> {this.renderPlusButton()}</i></a> )
}
render() {
    console.log('render BROWSE')
    console.log(this.state.spentTypes)

    if (!this.state.userID)
    {
        return this.renderSignInPage();
    }
    $("body").css("background-color", "#f1f1f1");

    <Route exact={true} path='/history/01-2019' render={() => (
        <div className="App">
            <HistoryPage userID={this.state.userID}></HistoryPage>
        </div>
    )}/>

    return (
    <div className="App">
        <div className="icon-bar">
        {this.renderHomeIcon()}
        {this.renderCalenderIcon()}
        {this.renderPlusIcon()}
        </div>
        <BrowserRouter>
            <div>
                <Route exact={true} path='/' render={() => (
                        <MainPage userID={this.state.userID} spentTypes={this.state.spentTypes}></MainPage>
                )}/>
                <Route exact={true} path='/history' render={() => (
                        <HistoryPage userID={this.state.userID} ></HistoryPage>
                )}/>
                {this.renderMonthExpensesTable()}
                <Route exact={true} path='/edit_types' render={() => (
                        <EditTypePage userID={this.state.userID} spentTypes={this.state.spentTypes} ></EditTypePage>
                )}/>
            </div>
        </BrowserRouter>
    </div>)
  }
}
