import React from  'react'
import './App.css';
import {serverUrl} from './Browse'

class HistoryPage extends React.Component {
    constructor(props) {
        super()

        this.props = {
            userID:props.userID,
          }
        this.state = {
            mouthToAmount:null
        }
        this.fetchExpenses()
    }

    fetchExpenses = () =>{
        let serverExpensesUrl = serverUrl  + 'all_expenses?user_id=' + this.props.userID
        return fetch(serverExpensesUrl, {
          method: 'GET',
          dataType: 'json',
        })
          .then(r => r.json())
          .then(r => {
             this.setState({mouthToAmount:r})
          })
          .catch(err => console.log(err))
    }

    renderTable () {
        let content = []
        console.log(this.state.mouthToAmount != null)
        if (this.state.mouthToAmount)
        {
            console.log('this.state.mouthToAmount')

            for (let i = 0; i < this.state.mouthToAmount.result.length;i++)
            {
                console.log(this.state.mouthToAmount.result[i])
                content.push(<tr key={i}>
                    <td><a href={'/history/' + this.state.mouthToAmount.result[i].date}>{this.state.mouthToAmount.result[i].date}</a></td>
                    <td> {this.state.mouthToAmount.result[i].amount}</td>
                </tr>)
            }
        }
        return content;
    }

    renderExpensesTable(){
    
        return (
          <table className='paleBlueRows'>
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Expenses</th>
              </tr>
            </thead>
            <tbody>
          {this.renderTable()}
           </tbody>
           </table>
        );
      
      }
    render() {
        return <div>{this.renderExpensesTable()}</div>

    }
}

export default HistoryPage;