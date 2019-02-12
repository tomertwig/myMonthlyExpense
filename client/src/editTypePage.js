import React from  'react'
import './App.css';
import {getSpentTypes, serverUrl} from './Browse'
const utf8 = require('utf8');


const EditType = {Add:0, Remove:1}



class EditTypePage extends React.Component {
    constructor(props) {
        super(props)

        this.props = {
            userID:props.userID,
        }
        this.state = {
            type:'',
            emoji : '',
            editType:EditType.Add,
            spentTypes:[]
        }
        this.fetchSpentTypes()
    }

    fetchSpentTypes = () => {
        const spetTypes = getSpentTypes(this.props.userID)
        spetTypes.then(result => {
          this.setState({spentTypes:result.spentTypes})
        })
    }


    handleTypeChanged = (e) => {
        this.setState({type:e.target.value, addedSuccesfully:false})
    }

    handleEmojiChanged = (e) => {
        this.setState({emoji:e.target.value, addedSuccesfully:false})
    } 

    onEditTypeClicked = (editType) => {
        this.setState({editType, addedSuccesfully:false})
    }

    removeAddedSuccessfully = () => 
    {
        this.setState({addedSuccesfully:false})
    }
    onSubmit = () => {
        const newType = this.state.emoji + ' ' + this.state.type
        if (window.confirm("Are you sure you want to add this new type? \n" + newType)) {
            fetch(serverUrl + 'add_new_type?user_id=' + this.props.userID +'&spent_type='+utf8.encode(newType),{
              method: 'GET',
              dataType: 'json'
            }).then(r => r.json())
            .then(r => {
                this.fetchSpentTypes()
                this.setState({emoji:'',  type:'', addedSuccesfully:true})
            })
          }
    } 

    renderRemoveTab(){
        if (this.state.editType == EditType.Add)
        {
            return null
        }

        return this.renderSpentTypes()
    }
   
    handleDeleteSpentType = (key) => {

        const type = this.state.spentTypes[key][0]
        if (window.confirm("Are you sure you want to delete this type? \n" + type)) {
            fetch(serverUrl + 'remove_type?user_id=' + this.props.userID +'&spent_type_id='+key,{
              method: 'GET',
              dataType: 'json'
            }).then(r => r.json())
            .then(r => {
                this.fetchSpentTypes()

                this.setState({emoji:'',  type:'', addedSuccesfully:true})
            })
          }
    }


    renderAddTab(){
        if (this.state.editType == EditType.Remove)
        {
            return null
        }
        return  (<div>
        <input className='inputLayout1' placeholder="Enter type.." 
        value={this.state.type} onFocus={this.removeAddedSuccessfully} onChange={this.handleTypeChanged} onKeyPress={this.handleKeyPressedForNumber} />
        <input type="text" emojionFocus={this.removeAddedSuccessfully}   className='inputLayout1' placeholder="Enter emoji.." 
        value={this.state.emoji} onChange={this.handleEmojiChanged} onKeyPress={this.handleKeyPressedForNumber} /> 
        <button className='inputButton' onClick={() => this.onSubmit()}> <div className='payText' > Submit </div></button>
        {this.state.addedSuccesfully ? <div> Added Successfully </div> : null }
        </div>
        )

    }

    renderSpentTypes = () => {
        let types = Object.keys(this.state.spentTypes).map((key, index) => {
            if (this.state.spentTypes[key][1])
            {
                const item = this.state.spentTypes[key][0];
                return (<tr key={key}>
                        <td className= "spentType" onClick={() => this.handleDeleteSpentType(key)}>
                        <span className='deleteSpentType'>❌</span>
                        {item}
                        </td>
                    </tr>)   
            }
            return null     
        })


        return ( <table className='paleBlueRows'>
         <thead>
           <tr>
             <th>Spent Type</th>
           </tr>
         </thead>
         <tbody>
           {types}
        </tbody>
        </table>)
     }

    render() {
        return  (<div>            
            <div className='tableHeadline1'> Edit your expenses types </div>
            <div className='subicon-edit-bar-charts '>
                <a className ={this.state.editType == EditType.Add ? 'subicon-bar-charts-active':''} onClick={() => {this.onEditTypeClicked(EditType.Add)}}> <i> <img className="iconButton" src={require('./add.png')} width="30" height="30"/></i></a>
                <a className ={this.state.editType == EditType.Remove ? 'subicon-bar-charts-active':''}   onClick={() => {this.onEditTypeClicked(EditType.Remove)}}><i> <img className="iconButton" src={require('./remove.png')} width="30" height="30"/></i></a>
            </div>
            {this.renderAddTab()}
            {this.renderRemoveTab()}


        </div>
        )
    
    }
}

export default EditTypePage;