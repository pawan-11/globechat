import logo from './logo.svg';
import './App.css';
import { AnimatedBackground, AnimatedText } from 'animated-backgrounds';
import axios from "axios";
import React, { useState, useMemo, useEffect } from 'react'
import Select from 'react-select'
import countryList from 'react-select-country-list'
import { countries } from 'country-flag-icons'
import { hasFlag } from 'country-flag-icons'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const server = "http://localhost:3001/";
function App() {
  const [locationData, setLocationData] = useState(null);
  const [showletter, setshowletter] = useState(false);
  const [to, setto] = useState(null);
  const [letters, setletters] = useState([]);

  
  async function getLocation() {
    // it will return the following attributes:
    // country, countryCode, regionName, city, lat, lon, zip and timezone
    const res = await axios.get("http://ip-api.com/json");
    if (res.status === 200) {
        setLocationData(res.data)
        if (to === null) {
          setto({"label":res.data.country, "value":res.data.countryCode});
        }
    }
  }

  useEffect(() => {
      getLocation();
  }, []);

  useEffect(()=>{
    getletters();
  }, [locationData]);


   async function deleteletter(id, e) {
    try {    
    console.log("deletingletter",id);
    let url = server+"delete?id="+id;

    fetch(url, { method: 'DELETE'}).
      then(res=>res.json()).
      then(data=>getletters()).
      catch(err=>{
          console.log("err delete fetch:",err)
        }
     );
     console.log("deleted!@!!????")
    }
    catch (err ) {
      console.log("err deleting letter"+id+":"+err);
    }
  }

  function getletters() {
    try {
      if (locationData !== null) {
        let url = server+"getletters?to="+locationData.countryCode;
        console.log("fetching ltrs from ",url);
        fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }).then(response => response.json())
        .then(data => { setletters(data); });
      }
    }
    catch (err) {
      console.log("error getting letters",err);
    }
  }

  function send(e) {
    e.preventDefault();
    let cntry = e.target.to.value;
    let msg = e.target.msg.value;
    let url = server+"send/";
    console.log("send", cntry, msg);
    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "from": locationData.countryCode,
        "to": cntry,
        "msg": msg,
      })
    }).then(res => res).then(data => getletters());
  }

  const countrieslist = useMemo(() => countryList().getData(), []);

  return (
    <div className="App">
      <div style={{color:"black"}}>
       <AnimatedBackground animationName="geometricShapes" style={{opacity:"0.1"}}
         blendMode="darken" />
       <h2 style={{fontWeight:"900"}}>✉️ GLOBE A LETTER ✉️</h2>
       <p>
       Send an online letter to people in another country</p>
    
      <button className="active btn" onClick={e=>setshowletter(true)}>
        Create+
        </button><br/><br/>
      {showletter?
      <div>
        <form onSubmit={e=>send(e)}>
        <div style={{width:"200px", margin:"0 auto"}}>
          <p style={{float:"left", paddingTop:"4px"}}>to: </p> 
          <Select type="input" name="to" focused={false} style={{float:"left"}} editable={false} options={countrieslist} 
          value={to} onChange={e=>setto(e)} />
        </div> 
        <br/>
        <textarea name="msg" type="input" style={{margin:"0 auto", width:"min(50%, 400px)"}} maxLength="1000" required={true} rows="5">

        </textarea><br/><br/>
        <button className="btn active" type="submit">Send</button>
        </form>
      </div>:<></>}
      <div style={{opacity:"0", height:"20px"}}>

      </div>
      <div style={{borderBottom:"1px solid black"}}>

      </div>
      <div style={{color:"black"}}>
        {locationData?
        <h5>Letters sent to {locationData.country} {getflag(locationData.countryCode)}
        { letters.map((l,i)=>
          <div className="letter" key={"letter"+i}>
            <p>A letter from {l.from?countryList().getLabel(l.from):"unknown"} {getflag(l.from)} {l.date}</p><br/>
          <p>{l.msg}</p><br/>
          <button className="btn active danger" onClick={e=>deleteletter(l._id,e)}>Delete</button>
          </div>
        )}
        </h5>
        :
        <p>Sorry we could not determine your country, please check location preferences</p>}
        <p>
        </p>
      </div>

    </div>
    </div>
  );
}


function getflag(countryCode) {
  return (<>{countries.includes(countryCode)?
    getUnicodeFlagIcon(countryCode)
    :
    <></>
    }</>);
}


export default App;
