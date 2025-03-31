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
import getUserCountry from "js-user-country";
import { set } from 'mongoose';

var server = "http://localhost:3001/";
//server = "https://beglobachat-1.onrender.com/";
const countryCode = getUserCountry().id;
const countryName = getUserCountry().name;

function App() {
  const [showletter, setshowletter] = useState(false);
  const [to, setto] = useState({"label":countryName, "value":countryCode});
  const [letters, setletters] = useState([]);
  const [logmsg, setlogmsg] = useState("");

  useEffect(()=>{
    getletters();
  }, []);


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

  async function getletters() {
    try {
        let url = server+"getletters?to="+countryCode;
        console.log("fetching ltrs from ",url);
        setlogmsg("loading letters sent to "+countryName+"...");
        await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }).then(response => response !== null?response.json():{})
        .then(data => { setletters(data); setlogmsg("") }).catch(err=>{
          setlogmsg("error loading letters");
        });
      
    }
    catch (err) {
      console.log("error getting letters",err);
    }
  }

  async function send(e) {
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
        "from": countryCode,
        "to": cntry,
        "msg": msg,
      })
    }).then(res => res).then(data => { 
      getletters(); 
      setlogmsg("Letter successfully sent to "+countryList().getLabel(cntry));
      setshowletter(false);
      e.target.msg.value = "";
    }).catch(
      err=> console.log("error sending da msg:",err)
    );
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
        <p>{logmsg}</p>
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
        <h5>Letters sent to {countryName} {getflag(countryCode)}
        { letters.map((l,i)=>
          <div className="letter" key={"letter"+i}>
            <p>A letter from {l.from?countryList().getLabel(l.from):"unknown"} {getflag(l.from)} {l.date}</p><br/>
          <p>{l.msg}</p><br/>
          <button className="btn active danger" onClick={e=>deleteletter(l._id,e)}>Delete</button>
          </div>
        )}
        </h5>
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
