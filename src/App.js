import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';
import axios from 'axios';
// Saving Data we scrape from pages to a new text file
//import fs from 'fs/promises';
// import $ from "jquery";

function App() {

useEffect(() => {
  let isMounted = false;
  var urlToLookAt = "http://omegajuicers.staging2.searchside.com/pages/juicer-index";
  
  async function axiosReqTest() {
    // axios.request({
    //   method: 'post',
    //   url: 'http://localhost:8000/test',
    //   headers: {
    //     'Content-Type': 'applicaton/json'
    //   }, 
    //   data: {
    //     url: "urlToLookAt"
    //     //foo: 'bar', // This is the body part
    //   }
    // })
    try {
    let result = await axios.post('http://localhost:8000/test', 
    {
      urlToLookAt
    });
    console.log(JSON.stringify(result?.data));
  } catch(err) {
    console.log(err);
  }  
}
if(!isMounted)
{
  axiosReqTest();
  isMounted = true;
}
},[])


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
