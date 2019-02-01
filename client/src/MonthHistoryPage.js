import React from  'react'
import './App.css';
import {serverUrl} from './Browse'

class MounthHistoryPage extends React.Component {
    constructor(props) {
        super()

        this.props = {
            userID:props.userID,
          }
        this.state = {
        }
    }

    componentDidMount(){
        console.log('HistoryPagecomponentDidMount')
        let serverExpensesUrl = serverUrl  + 'all_expenses?user_id=' + this.props.userID
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

    renderTableContent () {
        let content = []
        console.log('this.state.mouthToAmount')

        console.log(this.state.mouthToAmount)
        if (this.state.mouthToAmount)
        {

            Object.keys(this.state.mouthToAmount).map((key, index)  => {  
                console.log('1')
                content.push(<tr key={key}>
                        <td><a href={'/history/' + this.state.mouthToAmount[key][index].date}>{this.state.mouthToAmount[key][index].date}</a></td>
                        <td> {this.state.mouthToAmount[key][index].amount}</td>
                    </tr>)
            })
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
          {this.renderTableContent()}
           </tbody>
           </table>
        );
      
      }
    render() {
        return <div>{this.renderExpensesTable()}</div>

    }
}

export default MounthHistoryPage;