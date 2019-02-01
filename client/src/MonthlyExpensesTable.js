import React from  'react'
import './App.css';
import {SpenTypes} from './MainPage'
import {serverUrl} from './Browse'

class MonthlyExpensesTable extends React.Component {
    constructor(props) {
        super()
        
        console.log('props.year')
        console.log(props.year)

        console.log('props.mounth')

        console.log(props.mounth)
        this.props = {
            userID:props.userID,
            mounth:props.mounth,
            year:props.year,
            writePermissions:props.writePermissions
        }
        this.state = {
            expenses:[],
            monthlyExpenses:0,
            displayAll:props.displayAll,
        }
        console.log(props.userID)
        console.log(props.mounth)

        console.log(props.year)

        this.fetchExpenses()
    }

    componentWillReceiveProps(props) {
        this.setState({displayAll:props.displayAll})
        this.fetchExpenses() 
      }

    handleDeleteLatestTransaction = (idx) => {
        const deletePermenentExpense = idx != 0
        if (window.confirm("Are you sure you want to delete this transaction?")) {
          fetch(serverUrl + 'deleteLatestTransaction?user_id=' + this.props.userID +'&deletePermenentExpense='+deletePermenentExpense,{
            method: 'GET',
            dataType: 'json'
          }).then(() => {
            this.fetchExpenses()
            })
        }
      }

    fetchExpenses = () => {
        let expenses = this.getExpenses();
        expenses.then(result => {
          console.log(result)
          this.setState({ monthlyExpenses:result.expensesSum, expenses: result.expenses, permanentIndex:result.permanentIndex})
        })
      }
    
      getExpenses(){
        let serverExpensesUrl = serverUrl  + 'expenses?user_id=' + this.props.userID +'&month='+this.props.mounth +'&year=' +this.props.year
        console.log(serverExpensesUrl)
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
                          {this.props.writePermissions && (idx === 0 || idx===this.state.permanentIndex) ? <span className='deleteLatestTransaction' onClick={() => this.handleDeleteLatestTransaction(idx)}>❌</span>: ''} 
                       </td>
                    </tr>)
            })
          }
           </tbody>
           </table>
        );
      
      }



    render() {
        return (<div>{this.renderExpensesTable()}
        <div className="endLayout">
        <div className="totalExpenses"> Total: {this.state.monthlyExpenses}</div>
        </div>
      </div>
        )

    }
}

export default MonthlyExpensesTable;