import React from  'react'
import './App.css';


class DataList extends React.Component {
    constructor(props) {
        console.log('DataList init')
        super(props);
        this.state = {
            filteredOptions: [],
            textValue:''
        }
        this.handleClick = this.handleClick.bind(this);
        this.showList = this.showList.bind(this);
        this.hideList = this.hideList.bind(this);
    }

    updateFilter(evt) {
       console.log('updateFilter')
        let value = '';

        if (evt) {
            value = evt.target.value;
        }

        let filteredOptions = [];
        
        for (let i = 0;i<this.props.options.length;i++) { // this is the idea of creating div//
            const item = this.props.options[i];
            if (item.value.substr(1).toUpperCase().indexOf(value.toUpperCase()) != -1 || value =='') {
                filteredOptions.push({
                    id: item.id,
                    value: item.value
                });
            }
        }

        this.setState({
            filteredOptions: filteredOptions,
            textValue: value,
        });
    }

    handleClick(option){
        console.log(option)

        this.props.action(option)
        this.setState({textValue: option.value})
        this.hideList();
    }

    showList() {
       console.log('option')
       this.updateFilter()
        this.setState({
            expanded: true
        });
    }

    hideList() { // whe we click that name after by this function the list hide.
        this.setState({
                expanded: false
        });
    }

    render() {
        console.log('render dataa list')


    }
}

export default DataList;