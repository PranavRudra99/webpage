import React, {Component} from 'react';
import Panel from 'react-bootstrap/lib/Panel'
import axios from 'axios'

export default class CustomerDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showAlbums: false,
      showPost: false,
    }
  }

  //Function which is called when the component loads for the first time
  componentDidMount() {
    let id = this.props.match.params.id;
    this.state.userId = id;
    // let { id } = useParams();//this.props.route.params;
    
    
    this.getCustomerDetails(id)
  }


  //Function to Load the customerdetails data from json.
  getCustomerDetails(id) {
    axios.get('https://jsonplaceholder.typicode.com/users/' + id).then(response => {
      this.setState({customerDetails: response});
      this.getAlbums(id);
      this.getPosts(id);
    })
  };

  //Function to Load the customer albums data from json.
  getAlbums(id) {
    axios.get('https://jsonplaceholder.typicode.com/albums?userId=' + id).then(response => {
      this.setState({customerAlbums: response})
      let flags = [];
      for(let i =0; i < response.data.length; i++){
        flags[i]=false;
      }
      this.setState({showAlbumImages: flags})
    })
  };

  //Function to Load the customer posts data from json.
  getPosts(id) {
    axios.get('https://jsonplaceholder.typicode.com/posts?userId=' + id).then(response => {
      this.setState({customerPosts: response.data})
      let flags = [];
      let comments = [];
      for(let i =0; i < response.data.length; i++){
        flags[i]=false;
        comments[i] = {};
      }
      this.setState({showPostComments: flags, postComments: comments})
    });
  };

  clickShowAlbum() {
    this.setState({showAlbums: !this.state.showAlbums});
  }

  clickShowPosts() {
    this.setState({showPost: !this.state.showPost});
  }

  showDetailAlbums(albumId, index) {
    axios.get('https://jsonplaceholder.typicode.com/photos?albumId=' + albumId).then(response => {
      this.setState({albumImages: response})
      let arr = [...this.state.showAlbumImages]
      arr[index] = !this.state.showAlbumImages[index]
      this.setState({showAlbumImages: [...arr]})
    })
  }

  showComments(postId,index){
    axios.get('https://jsonplaceholder.typicode.com/comments?postId=' + postId).then(response => {
        // this.setState({postComments:response})
        let arr1 = [...this.state.showPostComments]
        arr1[index] = !this.state.showPostComments[index]
        let arr2 = [... this.state.postComments]
        arr2[index] = response;
        this.setState({showPostComments:arr1, postComments:arr2})
    });
  }

  deletePost(postId, index){
    axios.delete('https://jsonplaceholder.typicode.com/posts/' + postId).then(response => {
      if(response.status === 200){
        let arr1 = [...this.state.customerPosts];
        arr1.splice(index, 1);
        let arr2 = [...this.state.showPostComments];
        arr2.splice(index, 1);
        let arr3 = [...this.state.postComments];
        console.log(this.state.postComments)
        this.setState({customerPosts: [...arr1], showPostComments: [...arr2], postComments: [...arr3]})
        // console.log(this.state.customerPosts)
      }
    });
  }



  render() {
    if (!this.state.customerDetails)
      return (<p>Loading Data</p>)
    return (<div className="customerdetails">
      <Panel bsStyle="info" className="centeralign">
        <Panel.Heading>
          <Panel.Title componentClass="h3">Profile</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <div>
            <p>Name : {this.state.customerDetails.data.name}</p>
            <p>UserName : {this.state.customerDetails.data.username}</p>
            <p>Email : {this.state.customerDetails.data.email}</p>
            <p>Phone : {this.state.customerDetails.data.phone}</p>
            <p>Address : {this.state.customerDetails.data.address.city + " " + this.state.customerDetails.data.address.street + " " + this.state.customerDetails.data.address.suite}</p>
            <p>Company : {this.state.customerDetails.data.company.name}</p>
            <p>Website : {this.state.customerDetails.data.website}</p>
          </div>
          
        </Panel.Body>
      </Panel>

      <Panel bsStyle="info" className="centeralign">
        <Panel.Heading>
          <Panel.Title componentClass="h3" onClick={() => {this.clickShowPosts({})}}>Posts</Panel.Title>
        </Panel.Heading>
        {this.state.showPost == true ?<Panel.Body>
          {this.state.customerPosts? 
            this.state.customerPosts.map((post,index) =>
              <div key={post.id}>
                  <div>
                    <Panel.Body onClick={() => {this.showComments(post.id,index)}}>{post.title}</Panel.Body>
                    {/* <button className='btn btn-primary' onClick={() => {this.updatePost(post.id)}}>Update Post</button> */}
                    <button className='btn btn-primary' onClick={() => {this.deletePost(post.id, index)}}>Delete Post</button>
                  </div>
                  
                  <Panel bsStyle="info" className="centeralign">
                  {this.state.showPostComments[index] === true ?<Panel.Body>
                  {this.state.postComments[index]?
                  this.state.postComments[index].data.map(comment =>
                  <div key={comment.id}>
                    {comment.name}
                  </div>)
                  : ''}
                  </Panel.Body>: ''}
                </Panel>
              </div>)
          : ''}
        </Panel.Body>: ''}
      </Panel>

      <Panel bsStyle="info" className="centeralign">
        <Panel.Heading>
          <Panel.Title componentClass="h3" onClick={() => {this.clickShowAlbum({})}}>Albums</Panel.Title>
        </Panel.Heading>
        {this.state.showAlbums == true ?<Panel.Body>
          {this.state.customerAlbums? 
            this.state.customerAlbums.data.map((album,index) => 
              <div key={album.id}>
                <div onClick={() => {this.showDetailAlbums(album.id,index)}}>{album.title}</div>
                <Panel bsStyle="info" className="centeralign">
                  {this.state.showAlbumImages[index] === true ?<Panel.Body>
                  {this.state.albumImages?
                  this.state.albumImages.data.map(albumImage =>
                  <div key={albumImage.id} className="flex-row">
                    <img src={albumImage.thumbnailUrl} alt="Image"/>
                  </div>)
                  : ''}
                  </Panel.Body>: ''}
                </Panel>
              </div>
              )
          : ''}
        </Panel.Body>: ''}
      </Panel>

    </div>)
  }
}