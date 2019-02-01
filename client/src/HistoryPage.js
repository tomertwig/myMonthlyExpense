import React from  'react'
import './App.css';


class HistoryPage extends React.Component {
    constructor(props) {
        super()

        this.props = {
            userID:props.userID,
            serverUrl:props.serverUrl
          }
        this.state = {
        }
    }

    componentDidMount(){
        console.log('HistoryPagecomponentDidMount')
        let serverExpensesUrl = this.props.serverUrl  + 'all_expenses?user_id=' + this.props.userID
        return fetch(serverExpensesUrl, {
          method: 'GET',
          dataType: 'json',
        })
          .then(r => r.json())
          .then(r => {
             this.setState({mouthToAmount:r})
             console.log(r)
          })
          .catch(err => console.log(err))
    }
    
    renderTable () {
        let content = []
        console.log(this.state.mouthToAmount)
        if (this.state.mouthToAmount)
        {
            console.log('this.state.mouthToAmount')

            Object.keys(this.state.mouthToAmount).map((key, index)  => {  

  
                content.push(<tr key={key}>
                        <td>{this.state.mouthToAmount[key][index].date}</td>
                        <td> {this.state.mouthToAmount[key][index].amount}</td>
                    </tr>)
            })
        }
        return content;
    }

    renderExpensesTable(){
        const expenses = this.state.expenses
    
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