import React, {Component} from 'react';
import Panel from 'react-bootstrap/lib/Panel'
import axios from 'axios'
import { Modal, Button } from 'react-bootstrap';

export default class CustomerDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showAlbums: false,
      showUpdatePost: false,
      showComment: false,
      commentStrName: '',
      commentStrBody: '',
      searchStr: '',
      postTitle: '',
      postContent: '',
      allPosts: [],
    }
    this.selectedPostId = 0;
    this.selectedIndex = 0;
    this.handleCloseComment = this.handleCloseComment.bind(this);
    this.handleClosePost = this.handleClosePost.bind(this);
    this.updatePost = this.updatePost.bind(this);
    
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
      this.setState({allPosts: response.data})
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

  deletePost(postId, ind){
    axios.delete('https://jsonplaceholder.typicode.com/posts/' + postId).then(response => {
      if(response.status === 200){
        let arr1 = [...this.state.customerPosts];
        arr1.splice(ind, 1);
        let arr2 = [...this.state.showPostComments];
        arr2.splice(ind, 1);
        let arr3 = [...this.state.postComments];
        arr3 = arr3.filter(function(value, index, arr){ return index!=ind;});
        this.setState({customerPosts: [...arr1], showPostComments: [...arr2], postComments: [...arr3]})
        // console.log(this.state.customerPosts)
      }
    });
  }

  showCreateComment(postId, index) {
    console.log(postId + ":" + index);
    this.selectedIndex = index
    this.selectedPostId = postId;
    this.setState({showComment: true});
  }

  handleCloseComment() {
    this.setState({showComment: false});
  }

  addComment() {
    axios.post('https://jsonplaceholder.typicode.com/posts/'+this.selectedPostId+'/comments', {
      name: this.state.commentStrName,
      body: this.state.commentStrBody,
      email: this.state.customerDetails.data.email
    }).then(
      response =>{
        let arr2 = [... this.state.postComments];
        if(!arr2[this.selectedIndex].data) {
          arr2[this.selectedIndex].data = [];
        }
        arr2[this.selectedIndex].data.push(response.data);
        this.setState({postComments:arr2});
      });
    this.setState({showComment: false, commentStrName:'', commentStrBody:''});
  }

  updateCommentStrName(e) {
    this.setState({commentStrName: e.target.value})
  }
  
  updateCommentStrBody(e) {
    this.setState({commentStrBody: e.target.value})
  }

  checkContainStr(body, search) {
    let result = body.includes(search);
    console.log(body + ":" + search + ":" + result);
    return result;
  }

  updateSearchStr(e) {
    this.setState({searchStr: e.target.value});
    let customerPosts = [];
    this.state.allPosts.forEach(post => {
      if(this.checkContainStr(post.body, e.target.value)) {
        customerPosts.push(post);
      }
    });
    this.setState({customerPosts: customerPosts});
  }

  showUpdatePost(postId) {
    this.selectedPostId = postId;
    let postContent = '';
    let postTitle = '';
    this.state.allPosts.forEach(post => {
      if(postId == post.id) {
        postContent = post.body;
        postTitle = post.title;
      }
    });
    this.setState({postContent: postContent});
    this.setState({postTitle: postTitle});
    this.setState({showUpdatePost: true});
  }

  handleClosePost() {
    this.setState({showUpdatePost: false});
  }

  updatePost() {
    fetch('https://jsonplaceholder.typicode.com/posts/1', {
      method: 'PUT',
      body: JSON.stringify({
        id: this.selectedPostId,
        title: this.state.postTitle,
        body: this.state.postContent,
        userId: this.state.userId,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
    .then((response) => response.json())
    .then((json) => {
      let allPosts = this.state.allPosts;
      allPosts.forEach(post => {
        if(post.id == this.selectedPostId) {
          post.title = this.state.postTitle;
          post.body = this.state.postContent;
        }
      })
      this.setState({allPosts: allPosts});

      let customerPosts = this.state.customerPosts;
      customerPosts.forEach(post => {
        if(post.id == this.selectedPostId) {
          console.log(post);
          console.log("Changed Post data " + this.state.selectedPostId);
          post.title = this.state.postTitle;
          post.body = this.state.postContent;
        }
      });
      this.setState({customerPosts: customerPosts});

      this.setState({showUpdatePost: false});
    });
  }

  updatePostContent(e) {
    this.setState({postContent: e.target.value})
  }

  updatePostTitle(e) {
    this.setState({postTitle: e.target.value})
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
          <input value={this.state.searchStr} onChange={e => this.updateSearchStr(e)} placeholder="Insert search"></input>
          {this.state.customerPosts? 
            this.state.customerPosts.map((post,index) =>
              <div key={post.id}>
                  <div>
                    <Panel.Body onClick={() => {this.showComments(post.id,index)}}>{post.title}</Panel.Body>
                    {/* <button className='btn btn-primary' onClick={() => {this.updatePost(post.id)}}>Update Post</button> */}
                    <button className='btn btn-primary' onClick={() => {this.deletePost(post.id, index)}}>Delete Post</button>
                    <button className='btn btn-primary' onClick={() => {this.showUpdatePost(post.id)}}>Update Post</button>
                    <button className='btn btn-primary' onClick={() => {this.showCreateComment(post.id, index)}}>Add Comment</button>
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

      <Modal show={this.state.showComment} onHide={()=>{this.handleCloseComment()}}>
        <Modal.Header closeButton>
          <Modal.Title>Create Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Comment Name</p><input value={this.state.commentStrName} onChange={e => this.updateCommentStrName(e)}></input>
          <br/>
          <p>Comment Body</p><input value={this.state.commentStrBody} onChange={e => this.updateCommentStrBody(e)}></input>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>{this.handleCloseComment()}}>
            Close
          </Button>
          <Button variant="primary" onClick={()=>{this.addComment()}}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={this.state.showUpdatePost} onHide={this.handleClosePost}>
        <Modal.Header closeButton>
          <Modal.Title>Update Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <label className="col-md-2">Title: </label>
            <input className="col-md-8" value={this.state.postTitle} onChange={e => this.updatePostTitle(e)}></input>
          </div>
          <div className="row mt-10" style={{"marginTop": "10px"}}>
            <label className="col-md-2">Body: </label>
            <input className="col-md-8" value={this.state.postContent} onChange={e => this.updatePostContent(e)}></input>
          </div>
          
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleClosePost}>
            Close
          </Button>
          <Button variant="primary" onClick={this.updatePost}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>

    </div>)
  }
}