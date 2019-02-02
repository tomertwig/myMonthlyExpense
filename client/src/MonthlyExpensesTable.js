import React from  'react'
import './App.css';
import {SpenTypes} from './MainPage'
import {serverUrl} from './Browse'
import { Chart } from "react-google-charts";

class MonthlyExpensesTable extends React.Component {
    constructor(props) {
        super()
        this.props = {

            userID:props.userID,
            mounth:props.mounth,
            year:props.year,
            writePermissions:props.writePermissions,
            chart:false,
        }
        this.state = {
            expenses:[],
            monthlyExpenses:0,
            oneTimeExpenses:0,
            displayAll:false,
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
          this.setState({ monthlyExpenses:result.monthlyExpenses,  oneTimeExpenses:result.oneTimeExpenses, expenses: result.expenses, permanentIndex:result.permanentIndex})
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
    
    onChartClicked = () =>{
        this.setState({chart:true})
    }
    

    renderChart(){
        const expenses = this.state.expenses
        const sumup = {}
        for (let i = 0; i < expenses.length; i++)
        {   
            const key = expenses[i][1];
            if (! (SpenTypes[key] in sumup)){
                sumup[SpenTypes[key]] = 0
            }
            sumup[SpenTypes[key]] += expenses[i][2]
        }

        const data = [['Task', 'Hours per Day']]
        for (let key in sumup)
        {
            data.push([key, sumup[key]])
        }
        
        const pieOptions = {
            title: "",
            legend: {
              position: "left",
              alignment: "center",
              textStyle: {
                color: "233238",
                fontSize: 11
              }
            },
            tooltip: {
              showColorCode: true
            },
            chartArea: {
              left: 20,
              top: 0,
              width: "90%",
              height: "80%"
            },
            fontName: "Roboto"
          };
        console.log(data)
       return (<Chart
        chartType="PieChart"
        data={data}
        options={pieOptions}
        graph_id="PieChart"
        width={"100%"}
        height={"300px"}
        legend_toggle
      />)
    }
    

    handleDisplayAll(){
        console.log('handleDisplayAll')
        this.setState({displayAll:true})
    }

    handleShowLess(){
        console.log('handleShowLess')
        this.setState({displayAll:false})
    }  


    renderExpensesTable(){
        const expenses = this.state.expenses
    
        return (
        <div>
          <table className='paleBlueRows'>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type
                    <span className='chartIcon' onClick={() => this.onChartClicked()}>📊</span> 
                </th>
                <th>Expense</th>
              </tr>
            </thead>
            <tbody>
          {
            expenses.map((expense, idx) => {
            if (idx >4){
              if (!this.state.displayAll)
                {
                 return null ;
                }
            }
    
    
             return (<tr key={idx}>
                      <td className= "dateTable">
                      {this.props.writePermissions && (idx === 0 || idx===this.state.permanentIndex) ? <span className='deleteLatestTransaction' onClick={() => this.handleDeleteLatestTransaction(idx)}>❌</span>: ''} 
                      {expense[0]}
                      </td>
                      <td className='spentType'>{SpenTypes[expense[1]]}</td>
                      <td>{expense[2]}</td>
                    </tr>)
            })
          }
           </tbody>
           </table>
            {this.state.displayAll ?  <span className="arrow" onClick={() => this.handleShowLess()}>⇧</span> :
            <span className="arrow" onClick={() => this.handleDisplayAll()}>⇩</span>}
           </div>
        );
      
      }

    renderSumupTable(){
        return (
        <table className='paleBlueRows'>
            <thead>
                <tr>
                <th>On-Time</th>
                <th>Monthly</th>
                <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td>{this.state.oneTimeExpenses}</td>
                <td> {this.state.monthlyExpenses}</td>
                <td>{this.state.oneTimeExpenses + this.state.monthlyExpenses}</td>
                </tr>
            </tbody>
        </table>)
    }

    render() {
        return (
        <div>
            {this.renderSumupTable()}
            {this.state.chart ? this.renderChart() : this.renderExpensesTable()}
        </div>
        )

    }
}

export default MonthlyExpensesTable;