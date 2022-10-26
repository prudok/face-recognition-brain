import React, { Component } from 'react';
import ParticlesBackground from './components/Particles/ParticlesBackground';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import './App.css';


const app = new Clarifai.App({
  apiKey: 'cde3239c75ca4c0fa4e099c7af8ca9ec'
 });

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '', 
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        email: '',
        name: '', 
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name, 
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }
  
  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height); 
    return {
      leftCol: clarifaiFace.left_col * width, 
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * width)
    }
  }



  displayFaceBox = (box) => {
    this.setState({ box: box});
  }

  onRouteChange = (route) => {
    if(route === 'register') {
      this.setState({isSignedIn: false})
    } else if (route === 'home') {
        this.setState({isSignedIn: true})
      } 
    this.setState({route: route});
  }

  onButtonSubmit = () => {
  // const USER_ID = "merfee";
  // const PAT = "e7e22bd321814218896dd9f6db7803f7"; 
  // const APP_ID = "my-first-application"; 
  // const MODEL_ID = "face-detection";
  // const MODEL_VERSION_ID = "45fb9a671625463fa646c3523a3087d5";
  // const IMAGE_URL = this.state.input;
  this.setState({ imageUrl: this.state.input });
  app.models.predict(
    Clarifai.FACE_DETECT_MODEL, 
    this.state.input)
  .then(response => {
    if(response) {
      fetch('http://localhost:3000/image', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
          id: this.state.user.id
      }) 
    })
    .then(response => response.json())
    .then(count => { 
      this.setState({user: {
        entries: count
      }})
    })
    }
    this.displayFaceBox(this.calculateFaceLocation(response));
    console.log(this.state.user.id);
  })
  .catch( error => console.log(error));
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
      <ParticlesBackground />
        <Navigation onRouteChange = {this.onRouteChange} isSignedIn = {isSignedIn} />
        {
          route === 'home'
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <ImageLinkForm 
                onInputChange = { this.onInputChange }
                onButtonSubmit = { this.onButtonSubmit }
              />
              <FaceRecognition box = {box} imageUrl={ imageUrl }/> 
            </div>
          : ( route === 'signin' 
            ? <SignIn loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
        }

      </div>
    );
  }
}

export default App;
