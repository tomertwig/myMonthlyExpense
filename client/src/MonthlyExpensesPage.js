import React from  'react'
import './App.css';

import {ActiveTab, InfoType} from './MainPage'
import {serverUrl} from './Browse'
import { Chart } from "react-google-charts";
import MonthlyExpensesTable from './MonthlyExpensesTable'

class MonthlyExpensesPage extends React.Component {
    constructor(props) {
        super(props)
        this.props = {
            userID:props.userID,
            mounth:props.mounth,
            year:props.year,
            writePermissions:props.writePermissions,
            handlePayCallback:props.handlePayCallback,
            handleActiveTabChangedCallBack:props.handleActiveTabChangedCallBack,
            spentTypes: props.spentTypes
        }

        this.state = {
            monthlyExpensesData:[],
            oneTimeExpensesData:[],
            unusualExpensesData:[],
            monthlyExpenses:0,
            oneTimeExpenses:0,
            unusualExpensesSum: 0,
            infoType:InfoType.TransactionsTable,
            activeTab:ActiveTab.OneTime
        }

        this.fetchExpenses()
    }

    componentWillReceiveProps(props)
    {
        let infoType = props.infoType != null ? props.infoType :this.state.infoType
        let activeTab = props.activeTab != null ? props.activeTab :this.state.activeTab
        let spentTypes = props.spentTypes != null ? props.spentTypes :this.state.spentTypes
        this.setState({
            activeTab,
            infoType,
            spentTypes
        })
    
        this.fetchExpenses()
    }

    fetchExpenses = () => {
        let expenses = this.getExpenses();
        expenses.then(result => {
          this.setState({ monthlyExpensesData:result.monthlyExpensesData,  monthlyExpensesSum:result.monthlyExpensesSum,
            oneTimeExpensesData:result.oneTimeExpensesData,  oneTimeExpensesSum:result.oneTimeExpensesSum,
            unusualExpensesData:result.unusualExpensesData, unusualExpensesSum:result.unusualExpensesSum})
        })
      }

    getExpenses(){
        let serverExpensesUrl = serverUrl  + 'expenses?user_id=' + this.props.userID +'&month='+this.props.mounth +'&year=' +this.props.year
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
        this.setState({activeTab})
        if (this.props.handleActiveTabChangedCallBack)
        {
            this.props.handleActiveTabChangedCallBack(activeTab)
        }
    }

    handleInfoTypeClick = (infoType) =>{
        this.setState({infoType})
    }

    renderInfoData = () =>{
        switch (this.state.infoType){
            case (InfoType.TransactionsTable): 
            {
                return this.renderTables();
            }
            case (InfoType.SumupTable): 
            {
                const data = this.getChartData()
                return this.renderTableChart(data)
            }
            case (InfoType.Chart): 
            {
                const data = this.getChartData()
                return this.renderPaiChart(data)            
            }
        }
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

            if (data[idx][0] == 'Task') return null
            return  (<tr key={idx}>
                    <td className='spentType'>{data[idx][0]} </td>
                    <td>{data[idx][1]}</td>
                    </tr>)
         })
         
         }
        </tbody>
        </table>)
    }
    
    getChartData(){
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
            const type = this.props.spentTypes[key] ? this.props.spentTypes[key][0] : null
            if (type){
                if (! (type in sumup)){
                    sumup[type]= 0
                }
                sumup[type] += expenses[i][2]
            }

        }

        const data = [['Task', 'Hours per Day']]
        for (let key in sumup)
        {
            data.push([key, sumup[key]])
        }
        
        return data;
    }
    
    
    getClassName(activeTab){
        return this.state.activeTab == activeTab ? 'paleBlueRowsActive' : 'paleBlueRowsNotActive'
    }

    renderSumupTable(){

        return (
        <table className='paleBlueRows'>
            <thead>
                <tr>
                    <th className={this.getClassName(ActiveTab.OneTime)}   onClick={() => this.onActiveTabClicked(ActiveTab.OneTime)}>One-Time</th> 
                    <th className={this.getClassName(ActiveTab.UnusualExpenses)} onClick={() => this.onActiveTabClicked(ActiveTab.UnusualExpenses)}>Unusual</th>
                    <th className={this.getClassName(ActiveTab.Monthly)} onClick={() => this.onActiveTabClicked(ActiveTab.Monthly)}>Monthly</th>
                    <th className={this.getClassName(ActiveTab.Total)}  onClick={() => this.onActiveTabClicked(ActiveTab.Total)}>Total</th> 
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td onClick={() => this.onActiveTabClicked(ActiveTab.OneTime)}>{this.state.oneTimeExpensesSum}</td>
                    <td onClick={() => this.onActiveTabClicked(ActiveTab.UnusualExpenses)} > {this.state.unusualExpensesSum}</td>
                    <td onClick={() => this.onActiveTabClicked(ActiveTab.Monthly)} > {this.state.monthlyExpensesSum}</td>
                    <td onClick={() => this.onActiveTabClicked(ActiveTab.Total)} >{this.state.oneTimeExpensesSum + this.state.unusualExpensesSum + this.state.monthlyExpensesSum}</td>
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
                expenses = []
                expenses = this.state.oneTimeExpensesData.concat(this.state.unusualExpensesData, this.state.monthlyExpensesData)
                expenses.sort();
                expenses.reverse()
                break;             
                
        }

        return( 
                <MonthlyExpensesTable
                 userID={this.props.userID}
                 expenses={expenses}
                 writePermissions={this.props.writePermissions}
                 activeTab={this.state.activeTab}
                 fetchExpensesCallback={this.fetchExpenses}
                 spentTypes={this.props.spentTypes}>
                 </MonthlyExpensesTable> 
        )
    }

    renderPayButton()
    {
        if (!this.props.handlePayCallback){
            return null;
        }
        
        let buttonText = ''
        switch (this.state.activeTab)
        {
            case ActiveTab.OneTime:
            {
                buttonText ='💵 One Time Payment'
                break;
            }
            case ActiveTab.UnusualExpenses:
            {
                buttonText ='💰 Unusual Payment'
                break;
            }
            case ActiveTab.Monthly:
            {
                buttonText = '💳 Monthly Payment'
                break
            }
            case ActiveTab.Total:
                buttonText = 'Invalid'
                break
        }

        if (this.state.activeTab === ActiveTab.Total)
        {
            return <button className='inputButton' disabled> <div className='payText' > {buttonText} </div></button>
        }
        else{
            return <button className='inputButton' onClick={() => this.props.handlePayCallback(this.state.activeTab)}> <div className='payText' > {buttonText} </div></button>
        }
    }


    onTransctionsClicked()
    {
        this.setState({infoType: InfoType.TransactionsTable})
    }
    onSumupClicked()
    {
        this.setState({infoType: InfoType.SumupTable})
    }
    onChartClicked()
    {
        this.setState({infoType: InfoType.Chart})
    }
    renderHomeIcon()
    {
        return <a className={'active'}> <i> tomer</i></a>
    }
    
    renderCalenderIcon()
    {   
        return <a><i> harel</i></a>
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

        let classNameSubicon
        if (this.state.infoType == InfoType.TransactionsTable)
        {
            classNameSubicon =  "subicon-bar-charts infoDataTables"
        }
        else if(this.state.infoType == InfoType.SumupTable)
        {
            classNameSubicon = "subicon-bar-charts infoDataTables1"
        }
        else{
            classNameSubicon = "subicon-bar-charts"

        }
        return (
        <div>
            {this.renderPayButton()}
            {this.renderSumupTable()}
            { <div className='tableHeadline'>{headline} </div>}
            <div className={classNameSubicon}>
                <a className ={this.state.infoType == InfoType.TransactionsTable ? 'subicon-bar-charts-active':''} onClick={() => {this.onTransctionsClicked()}}> <i> <img className="iconButton" src={require('./transctions.png')} width="30" height="30"/></i></a>
                <a className ={this.state.infoType == InfoType.SumupTable ? 'subicon-bar-charts-active':''}   onClick={() => {this.onSumupClicked()}}><i> <img className="iconButton" src={require('./sum.png')} width="30" height="30"/></i></a>
                <a className ={this.state.infoType == InfoType.Chart ? 'subicon-bar-charts-active':''} onClick={() => {this.onChartClicked()}} ><i> <img className="iconButton" src={require('./chart1.png')} width="30" height="30"/></i></a>
            </div>
            <div className='infoData'> {this.renderInfoData()}</div>
        </div>
        )

    }
}

export default MonthlyExpensesPage;