import React, {Component} from 'react';
import axios from 'axios'
import Popup from 'reactjs-popup';


export default class Customers extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selectedCustomer: 1
    }
  }

  //function which is called the first time the component loads
  componentDidMount() {
    this.getCustomerData();
  }

  //Function to get the Customer Data from json
  getCustomerData() {
    axios.get('https://jsonplaceholder.typicode.com/users').then(response => {
      console.log(response);

      this.setState({customerList: response})
    })
  };

  showDetail(id) {
    let url = "/customerdetail/" + id;
    let history = this.props.history;
    history.push(url);
  }

  render() {
    if (!this.state.customerList)
      return (<p>Loading data</p>)
    return (<div className="addmargin">
      <div className="col-md-12">
        {
          this.state.customerList.data.map(customer => 
            <div key={customer.name} className="row mt-10">
              <Popup
                trigger={
                  <button className="btn btn-primary col-md-offset-3 col-md-6" onClick={() => {this.showDetail(customer.id)}}>{customer.name}</button>
                }
                position="right center"
                on={['hover', 'focus']}
              >
                <div>
                  <p> Name: {customer.username} </p>
                  <p> Email: {customer.email} </p>
                </div>
                
              </Popup>
            </div>
            
          )
        }
      </div>
      
    </div>)
  }

}
