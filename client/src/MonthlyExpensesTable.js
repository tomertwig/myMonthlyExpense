import React from  'react'
import './App.css';
import {ActiveTab} from './MainPage'
import {serverUrl} from './Browse'

class MonthlyExpensesTable extends React.Component {
    constructor(props) {
        super(props)
        console.log('props.MonthlyExpensesTable')
        console.log(props.expenses)
        console.log(props.spentTypes)

        this.props = {
            userID: props.userID,
            expenses: props.expenses,
            writePermissions:props.writePermissions,
            fetchExpensesCallback:props.fetchExpensesCallback,
            spentTypes:props.spentTypes
        }

        this.state = {
            displayAll:false,
            activeTab: props.activeTab,
        }
    }

    componentWillReceiveProps(props)
    {   
        const activeTab =  props.activeTab? props.activeTab : this.state.activeTab 
        this.setState({
            activeTab,
            chart: props.chart
        })
    
    }


    handleDeleteLatestTransaction = (activeTab) => {
        console.log('handleDeleteLatestTransaction')
        console.log(activeTab)
        if (window.confirm("Are you sure you want to delete this transaction?")) {
          fetch(serverUrl + 'deleteLatestTransaction?user_id=' + this.props.userID +'&expenses_type='+this.state.activeTab,{
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
        if (this.state.activeTab == ActiveTab.OneTime){
            return( this.state.displayAll ?  <span className="arrow" onClick={() => this.handleShowLess()}>⇧</span> :
            <span className="arrow" onClick={() => this.handleDisplayAll()}>⇩</span>)
        }
        else
        {
            return null;
        }
    }
    renderTable(){
       const expenses = this.props.expenses
        console.log(this.props.spentTypes)
        console.log('this.props.spentTypes tableee')

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
          if (this.state.activeTab == ActiveTab.OneTime && !this.state.displayAll )
            {
             return null ;
            }
        }


         return (<tr key={idx}>
                  <td className= "dateTable">
                  {this.props.writePermissions && idx === 0 ?
                     <span className='deleteLatestTransaction' onClick={() => this.handleDeleteLatestTransaction(this.state.activeTab)}>❌</span>: ''} 
                  {expense[0]}
                  </td>
                  <td className='spentType'>{this.props.spentTypes[expense[1]] ? this.props.spentTypes[expense[1]][0] : null } </td>
                  <td>{expense[2]}</td>
                </tr>)
        })
      }
       </tbody>
       </table>)
    }

    render(){
        console.log()
        return (
            <div className='tableWithArrow'>
            {this.renderTable()}
            {this.renderArrow()}
           </div>
        );
      
      }

}

export default MonthlyExpensesTable;