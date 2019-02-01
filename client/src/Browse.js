import React, { Component } from 'react';
import './App.css';
import Cookies from 'universal-cookie';
import { BrowserRouter, Route} from 'react-router-dom';
import HistoryPage from './HistoryPage';
import MonthlyExpensesTable from './MonthlyExpensesTable';
import MainPage from './MainPage';
var SHA256 = require("crypto-js/sha256");
const hostName = window.location.hostname
const serverPort = '5000'
const clientPort = '3000'

export const serverUrl =  'http://' + hostName + ':' + serverPort +'/'
export const clientUrl = 'http://' + hostName + ':' + clientPort +'/'


export default class Auth extends Component {
  constructor() {
    super()
    const cookies = new Cookies();
    
    const userID = cookies.get('user_id') || null;

    this.state = {
        userName:'',
        password:'',
        userID
    }
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
    return (
        <div className="App">
            <div className="inputForm">
                <input type="text"  placeholder="user name.." value={this.state.userName} onChange={this.handleUserName} />
                <input type="password"  placeholder="password.." value={this.state.password} onChange={this.handlePassword} />
            <button onClick={() => this.handleLogin()}> <div className='payText' >Login </div></button>
            <button onClick={() => this.handleSignIn()}> <div className='payText' >Sign-in </div></button>

            </div>
        </div>
        );
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
            <div className="App">
                  <MonthlyExpensesTable
                    userID={this.state.userID}
                    displayAll={true}
                    mounth={month} 
                    year={year}>
                  </MonthlyExpensesTable>
            </div>
        )}/>)
      }

    return result;
}

render() {

    if (!this.state.userID)
    {
        return this.renderSignInPage();
    }
    <Route exact={true} path='/history/01-2019' render={() => (
        <div className="App">
            <HistoryPage userID={this.state.userID}></HistoryPage>
        </div>
    )}/>

    return (
    <BrowserRouter>
        <div>
            <Route exact={true} path='/' render={() => (
                <div className="App">
                    <MainPage userID={this.state.userID}></MainPage>
                </div>
            )}/>
            <Route exact={true} path='/history' render={() => (
                <div className="App">
                    <HistoryPage userID={this.state.userID} ></HistoryPage>
                </div>
            )}/>
            {this.renderMonthExpensesTable()}
        </div>
    </BrowserRouter>)
  }
}
