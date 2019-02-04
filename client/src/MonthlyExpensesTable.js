import React from  'react'
import './App.css';
import {SpenTypes} from './MainPage'
import {serverUrl} from './Browse'

class MonthlyExpensesTable extends React.Component {
    constructor(props) {
        super()
        this.props = {
            userID: props.userID,
            expenses: props.expenses,
            isOneTimeExpenses: props.isOneTimeExpenses,
            writePermissions:props.writePermissions,
            fetchExpensesCallback:props.fetchExpensesCallback
        }
        this.state = {
            displayAll:false,
        }
    }


    handleDeleteLatestTransaction = (isOneTimeExpenses) => {

        if (window.confirm("Are you sure you want to delete this transaction?")) {
          fetch(serverUrl + 'deleteLatestTransaction?user_id=' + this.props.userID +'&isOneTimeExpenses='+isOneTimeExpenses,{
            method: 'GET',
            dataType: 'json'
          }).then(() => {
            this.props.fetchExpensesCallback()
        })
        }
      }

 
    handleDisplayAll(){
        console.log('handleDisplayAll')
        this.setState({displayAll:true})
    }

    handleShowLess(){
        console.log('handleShowLess')
        this.setState({displayAll:false})
    }  

    renderArrow(){
        if (!this.props.isOneTimeExpenses){
            return  <span className="arrow"> </span>;
        }
        return( this.state.displayAll ?  <span className="arrow" onClick={() => this.handleShowLess()}></span> :
        <span className="arrow" onClick={() => this.handleDisplayAll()}></span>)
    }
    renderTable(){
       const expenses = this.props.expenses

       return( <table className='paleBlueRows'>
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
        if (idx >4){
          if (this.props.isOneTimeExpenses && !this.state.displayAll )
            {
             return null ;
            }
        }


         return (<tr key={idx}>
                  <td className= "dateTable">
                  {this.props.writePermissions && idx === 0 ?
                     <span className='deleteLatestTransaction' onClick={() => this.handleDeleteLatestTransaction(this.props.isOneTimeExpenses)}>❌</span>: ''} 
                  {expense[0]}
                  </td>
                  <td className='spentType'>{SpenTypes[expense[1]]} </td>
                  <td>{expense[2]}</td>
                </tr>)
        })
      }
       </tbody>
       </table>)
    }

    render(){
        return (
            <div>
            {this.renderTable()}
            {this.renderArrow()}
           </div>
        );
      
      }

}

export default MonthlyExpensesTable;