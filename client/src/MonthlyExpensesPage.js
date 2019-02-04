import React from  'react'
import './App.css';
import {SpenTypes} from './MainPage'
import {serverUrl} from './Browse'
import { Chart } from "react-google-charts";
import MonthlyExpensesTable from './MonthlyExpensesTable'

const ActiveTab = {OneTime:0, Monthly:1, Total:2}
const ChartType = {Table:0, Pai:1}

class MonthlyExpensesPage extends React.Component {
    constructor(props) {
        super()
        this.props = {
            userID:props.userID,
            mounth:props.mounth,
            year:props.year,
            writePermissions:props.writePermissions,
            chart:false,
            activeTab:ActiveTab.OneTime,
        }
        this.state = {
            monthlyExpensesData:[],
            oneTimeExpensesData:[],
            monthlyExpenses:0,
            oneTimeExpenses:0,
            chartType:ChartType.Table
        }

        this.fetchExpenses()
    }

    fetchExpenses = () => {
        console.log('fetchExpenses')
        let expenses = this.getExpenses();
        expenses.then(result => {
          console.log(result)
          this.setState({ monthlyExpensesData:result.monthlyExpensesData,  monthlyExpensesSum:result.monthlyExpensesSum,
            oneTimeExpensesData:result.oneTimeExpensesData,  oneTimeExpensesSum:result.oneTimeExpensesSum})
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
    
    onChartClicked = (disaplayOneTimeExpenses) =>{
        const activeTab = disaplayOneTimeExpenses ? ActiveTab.OneTime : ActiveTab.Total
        this.setState({chart:true, disaplayOneTimeExpenses, activeTab})
    }
    
    onMonthlyClicked = (isMmonthlyTable) => {
        const activeTab = isMmonthlyTable ? ActiveTab.Monthly : ActiveTab.OneTime

        this.setState({chart:false, activeTab})
    }

    handleChartTypeClick = (chartType) =>{
        this.setState({'chartType':chartType})
    }

    renderPaiChart = (data)=>
    {

        const pieOptions = {
            title: "",
            legend: {
              position: "left",
              alignment: "center",
              textStyle: {
                color: "233238",
                fontSize: 11,
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
            backgroundColor:'#f1f1f1',

            fontName: "Roboto"
          };
        console.log(data)
       return (
        <Chart
            chartType="PieChart"
            data={data}
            options={pieOptions}
            graph_id="PieChart"
            width={"100%"}
            height={"300px"}
            legend_toggle
        />
      )
    }

    renderTableChart = (data) => {
        console.log('data.shift()')
        console.log(data.shift())

        console.log(data)


        data.sort(function(a,b){return a[1]<b[1];});
        return( <table className='paleBlueRows'>
         <thead>
           <tr>
             <th>Type</th>
             <th>Total Expense</th>
           </tr>
         </thead>
         <tbody>
         {
         data.map((element, idx) => {
             console.log(idx)
             console.log(element)
            return  (<tr key={idx}>
                    <td className='spentType'>{data[idx][0]} </td>
                    <td>{data[idx][1]}</td>
                    </tr>)
         })
         
         }
        </tbody>
        </table>)
    }
    
    renderChart(){
        const sumup = {}
        const expenses = this.state.disaplayOneTimeExpenses ? this.state.oneTimeExpensesData :  this.state.monthlyExpensesData
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

        console.log(this.state.chartType )
        if (this.state.chartType == ChartType.Table)
        {
            return (
                <div>  
                <button disabled className='chartButtons'>Table</button>
                <button  className='chartButtons chartButtons_active'onClick={()=>this.handleChartTypeClick(ChartType.Pai)}> Chart</button>
                {this.state.chartType == ChartType.Pai ? this.renderPaiChart(data) : this.renderTableChart(data)}
                </div>
            )
        }
        else
        {
            return (
                <div>  
                <button className='chartButtons chartButtons_active' onClick={()=>{this.handleChartTypeClick(ChartType.Table)}}>Table</button>
                <button disabled className='chartButtons'> Chart</button>
                {this.state.chartType == ChartType.Pai ? this.renderPaiChart(data) : this.renderTableChart(data)}
                </div>
            )
        }


    }
    

    renderSumupTable(){
        return (
        <table className='paleBlueRows'>
            <thead>
                <tr>
                {this.state.chart ? <th onClick={() => this.onMonthlyClicked(false)}>One-Time <span className='chartIcon'>🗂️ </span> </th> :
                <th onClick={() => this.onChartClicked(true)}>One-Time <span className='chartIcon'>📊 </span> </th>}
                <th onClick={() => this.onMonthlyClicked(true)}> Monthly <span className='chartIcon'>🗂️ </span> </th>
                <th onClick={() => this.onChartClicked(false)}>Total
                    <span className='chartIcon'>📊</span> 
                </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td>{this.state.oneTimeExpensesSum}</td>
                <td> {this.state.monthlyExpensesSum}</td>
                <td>{this.state.oneTimeExpensesSum + this.state.monthlyExpensesSum}</td>
                </tr>
            </tbody>
        </table>)
    }


    renderTables()
    {  
        return( 
            <div>          
                {this.state.activeTab == ActiveTab.Monthly ? 
                <MonthlyExpensesTable
                 userID={this.props.userID}
                 expenses={this.state.monthlyExpensesData}
                 writePermissions={this.props.writePermissions}
                 isOneTimeExpenses={false}
                 fetchExpensesCallback={this.fetchExpenses}>
                 </MonthlyExpensesTable> :
                <MonthlyExpensesTable 
                userID={this.props.userID}
                expenses={this.state.oneTimeExpensesData}
                writePermissions={this.props.writePermissions}
                isOneTimeExpenses={true}
                fetchExpensesCallback={this.fetchExpenses}>
                </MonthlyExpensesTable>}
            </div>
        )
    }

    render() {

        let headline;
        switch (this.state.activeTab){
            case ActiveTab.Total:
                headline = 'Total Expenses'
                break;
            case ActiveTab.Monthly:
                headline = 'Monthly Expenses'
                break;
            case ActiveTab.OneTime:
                headline = 'One-Time Expenses'
                break;
            default:
                headline = 'One-Time Expenses'
                break;

        }
        return (
        <div>
            {this.renderSumupTable()}
            { <div className='tableHeadline'> {headline} </div>}
            {this.state.chart ? this.renderChart() : this.renderTables()}
        </div>
        )

    }
}

export default MonthlyExpensesPage;