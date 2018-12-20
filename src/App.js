import React, { Component } from 'react';
import './App.scss'
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import About from './About'
import Education from './Education'
import Projects from './Projects'
import Contact from './Contact'
import BehindTheScenes from './components/BehindTheScenes'
import Footer from './components/Footer'

class App extends Component {
  render() {
    return (
      <div>
          <Navbar/>
          <Header/>
          <About/>
          {/*<BehindTheScenes/>*/}
          {/* <Education/> */}
          {/*<Projects/>*/}
          {/*<Skills/>*/}
          {/*<Contact/>*/}
          <Footer/>
      </div>
    );
  }
}

export default App;
