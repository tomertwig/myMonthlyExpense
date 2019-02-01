import React, { Component } from 'react';
import './App.css';
import Cookies from 'universal-cookie';
import { BrowserRouter, Route} from 'react-router-dom';
import HistoryPage from './HistoryPage';
import MainPage from './MainPage';
var SHA256 = require("crypto-js/sha256");
const hostName = window.location.hostname
const serverPort = '5000'
const clientPort = '3000'

const serverUrl =  'http://' + hostName + ':' + serverPort +'/'
const clientUrl = 'http://' + hostName + ':' + clientPort +'/'


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


render() {

    if (!this.state.userID)
    {
        return this.renderSignInPage();
    }

    return (
    <BrowserRouter>
        <div>
            <Route exact={true} path='/' render={() => (
                <div className="App">
                    <MainPage userID={this.state.userID} serverUrl={serverUrl} clientUrl={clientUrl}></MainPage>
                </div>
            )}/>
            <Route exact={true} path='/history' render={() => (
                <div className="App">
                    <HistoryPage userID={this.state.userID} serverUrl={serverUrl}></HistoryPage>
                </div>
            )}/>
        </div>
    </BrowserRouter>)
  }
}
