import React from  'react'
import './App.css';
import {SpenTypes, ActiveTab} from './MainPage'
import {serverUrl} from './Browse'
import { Chart } from "react-google-charts";
import MonthlyExpensesTable from './MonthlyExpensesTable'

const ChartType = {Table:0, Pai:1}

class MonthlyExpensesPage extends React.Component {
    constructor(props) {
        super(props)
        console.log('MonthlyExpensesPage INTTNT')

        this.props = {
            userID:props.userID,
            mounth:props.mounth,
            year:props.year,
            writePermissions:props.writePermissions,
            chart:false,
            handlePayCallback:props.handlePayCallback,
            handleActiveTabChangedCallBack:props.handleActiveTabChangedCallBack
        }

        this.state = {
            monthlyExpensesData:[],
            oneTimeExpensesData:[],
            unusualExpensesData:[],
            monthlyExpenses:0,
            oneTimeExpenses:0,
            unusualExpensesSum: 0,
            chartType:ChartType.Table,
            activeTab:ActiveTab.OneTime
        }

        this.fetchExpenses()
    }

    componentWillReceiveProps(props)
    {
        this.setState({
            activeTab:props.activeTab,
            chart: props.chart
        })
    
        this.fetchExpenses()
    }

    fetchExpenses = () => {
        console.log('fetchExpenses')
        let expenses = this.getExpenses();
        expenses.then(result => {
          console.log(result)
          this.setState({ monthlyExpensesData:result.monthlyExpensesData,  monthlyExpensesSum:result.monthlyExpensesSum,
            oneTimeExpensesData:result.oneTimeExpensesData,  oneTimeExpensesSum:result.oneTimeExpensesSum,
            unusualExpensesData:result.unusualExpensesData, unusualExpensesSum:result.unusualExpensesSum})
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
    
    
    onActiveTabClicked =  (activeTab)  => {
        let chart = (activeTab == ActiveTab.Total || (activeTab == ActiveTab.OneTime && this.state.activeTab ==  ActiveTab.OneTime))
        if (this.state.chart == chart)
        {
            chart = false;
        }
        this.setState({chart, activeTab})
        this.props.handleActiveTabChangedCallBack(activeTab)
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

        if (this.state.activeTab != ActiveTab.OneTime && this.state.activeTab != ActiveTab.Total)
        {
            return null;
        }

        const sumup = {}
        let expenses
        switch (this.state.activeTab){
            case ActiveTab.OneTime: 
                expenses = this.state.oneTimeExpensesData 
                break;
            case ActiveTab.UnusualExpenses:
                expenses = this.state.unusualExpensesData
                break;
            case ActiveTab.Monthly: 
                expenses = this.state.monthlyExpensesData;
                break;
            case ActiveTab.Total:
                expenses = this.state.oneTimeExpensesData.concat(this.state.unusualExpensesData).concat(this.state.monthlyExpensesData)
                break;             
        }
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

        console.log(this.state.chartType)
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
        else //chart
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
        console.log('this.state.activeTab')

        console.log(this.state.activeTab)
        return (
        <table className='paleBlueRows'>
            <thead>
                <tr>
                { this.state.activeTab != ActiveTab.OneTime || this.state.chart ?
                  <th onClick={() => this.onActiveTabClicked(ActiveTab.OneTime)}>One-Time <span className='chartIcon'>🗂️ </span> </th> :
                  <th onClick={() => this.onActiveTabClicked(ActiveTab.OneTime)}>One-Time <span className='chartIcon'>📊 </span> </th>
                }
                <th onClick={() => this.onActiveTabClicked(ActiveTab.UnusualExpenses)}> Unusual <span className='chartIcon'>🗂️ </span> </th>
                <th onClick={() => this.onActiveTabClicked(ActiveTab.Monthly)}> Monthly <span className='chartIcon'>🗂️ </span> </th>
                <th onClick={() => this.onActiveTabClicked(ActiveTab.Total)}>Total  
                    <span className='chartIcon'>  📊</span> 
                </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td onClick={() => this.onActiveTabClicked(ActiveTab.OneTime)}>{this.state.oneTimeExpensesSum}</td>
                <td onClick={() => this.onActiveTabClicked(ActiveTab.UnusualExpenses)} > {this.state.unusualExpensesSum}</td>
                <td onClick={() => this.onActiveTabClicked(ActiveTab.Monthly)} > {this.state.monthlyExpensesSum}</td>
                <td onClick={() => this.onActiveTabClicked(ActiveTab.Total)} >{this.state.oneTimeExpensesSum + this.state.monthlyExpensesSum}</td>
                </tr>
            </tbody>
        </table>)
    }


    renderTables()
    {  
        let expenses

        switch (this.state.activeTab){
            case ActiveTab.OneTime: 
                expenses = this.state.oneTimeExpensesData 
                break;
            case ActiveTab.UnusualExpenses:
                expenses = this.state.unusualExpensesData 
                break
            case ActiveTab.Monthly: 
                expenses = this.state.monthlyExpensesData;
                break;
            case ActiveTab.Total:
                expenses = this.state.oneTimeExpensesData.concat(this.state.unusualExpensesData).concat(this.state.monthlyExpensesData)
                break;             
        }

        return( 
                <MonthlyExpensesTable
                 userID={this.props.userID}
                 expenses={expenses}
                 writePermissions={this.props.writePermissions}
                 activeTab={this.state.activeTab}
                 fetchExpensesCallback={this.fetchExpenses}>
                 </MonthlyExpensesTable> 
        )
    }

    renderPayButton()
    {
        let buttonText = ''
        console.log('activeTabfsdmfioiofdsn')
        console.log(this.state.activeTab)

        switch (this.state.activeTab)
        {
            case ActiveTab.OneTime:
            case ActiveTab.Total:
            {
                buttonText ='💵 One Time Payment'
                break;
            }
            case ActiveTab.UnusualExpenses:
            {
                buttonText = 'Unusual Payment'
                break;
            }
            case ActiveTab.Monthly:
            {
                buttonText = '💳 Monthly Payment'
                break
            }
        }
        console.log('this.state.activeTab')

        console.log(this.state.activeTab)
        return <button className='inputButton' onClick={() => this.props.handlePayCallback(this.state.activeTab)}> <div className='payText' > {buttonText} </div></button>
    }
    render() {
        let headline;
        switch (this.state.activeTab){
            case ActiveTab.Total:
                headline = 'Total Expenses'
                break;
            case ActiveTab.UnusualExpenses:
                headline = 'Unusual Expenses'
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
            {this.renderPayButton()}
            {this.renderSumupTable()}
            { <div className='tableHeadline'> {headline} </div>}
            {this.state.chart ? this.renderChart() : this.renderTables()}
        </div>
        )

    }
}

export default MonthlyExpensesPage;