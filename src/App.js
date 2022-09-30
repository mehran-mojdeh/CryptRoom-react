import axios from 'axios';
import {SHA3, AES, enc} from 'crypto-js';
import {useState, useEffect} from 'react';

import Bubble from './bubble';

const host = process.env.REACT_APP_API;

function App() {
  const [isHeaderClosed, setHeaderState] = useState(true);
  const [loaded, setLoaded] = useState([]);
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [timer, setTimer] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [secret, setSecret] = useState(null);
  const [sign, setSign] = useState(null);
  
  const toggleHeader = (e) => {
    e.preventDefault();
    setHeaderState(!isHeaderClosed);
  } 
  const scrollToEnd = (e) => {
    document.getElementById('bottom').scrollIntoView({option:'smooth'});
  }

  useEffect(() => {
    loadMessages();
  },[]);
  useEffect(() => {
    decryptMessages();
  },[loaded, sign]);
  useEffect(() => {
    scrollToEnd();
  }, [messages]);
  useEffect(() => {
    if (!password || password === '') {
      setSecret(null);
      return;
    }
    let scrt = password;
    for(let i=0; i<1000; i++) {
      scrt = SHA3(scrt, {salt:'', outputLength:256}).toString();
    }
    setSecret(scrt);
    decryptMessages();
  }, [password]);
  useEffect(() => {
    if (!secret) {
      setSign(null);
      return;
    }
    setSign(SHA3(password+secret, {salt:secret, outputLength:256}).toString())
  }, [secret, password]);
  const changeName = (e) => {
    setName(e.target.value);
  }
  const changePassword = (e) => {
    clearTimeout(timer);
    e.target.type = 'text';
    setTimer(setTimeout(() => {
      e.target.type = 'password';
      setPassword(e.target.value);
    }, 2500))
  }
  const changeMessage = (e) => {
    setNewMessage(e.target.innerText);
  }
  const loadMessages = () => {
    axios.get(`${host}/api/messages`)
    .then(r => {
      setLoaded(r.data.data)
      // scrollToEnd();
    })
    .catch( e => console.log(e));
  }
  const decryptMessages = () => {
    const dms = loaded.map((m) => {
      if(sign !== m.signiture) return m;
      return {
        name: m.name,
        message: AES.decrypt(m.message, secret).toString(enc.Utf8),
        signiture: m.signiture
      }
    });
    setMessages(dms);
  }
  const sendMessage = async() => {
    let errors = [];
    console.dir({
      name,
      password,
      newMessage
    })
    if(!name || name.length < 1) errors.push('Name is required');
    if(!password || password.length < 1) errors.push('Password is required');
    if(!newMessage || newMessage.length < 1) errors.push('Message is required')
    if(errors.lenght > 0){
      alert(errors.join('\n\n'));
      return;
    }
    if(!secret || !sign) {
      alert('Something went wrong.\nPlease enter your password again.');
      return;
    }
    const encMessage = AES.encrypt(newMessage, secret).toString();
    const data = {
      name: name,
      message: encMessage,
      signiture: sign
    }
    await axios.post(`${host}/api/messages`, data)
      .then((r) => {
        if(r.status === 200) {
          data['message'] = newMessage;
          setMessages([...messages, data]);
          loadMessages();
        };
      })
      .catch((e) => console.error('Send Message:\n',e.message));
    scrollToEnd();
  }
  return (
    <>
      <div className={`header ${isHeaderClosed?"closed":""}`}>
        <div className="brand">
          <svg className="logo" viewBox="0 50 600 500">
            <path fill="rgba(0, 0, 0, 1.0)" d="M436.123,152.511L436.123,152.511c0,6.266-5.079,11.345-11.345,11.345h-15.127    c-6.266,0-11.345-5.079-11.345-11.345l0,0c0-6.266,5.079-11.345,11.345-11.345h15.127    C431.044,141.165,436.123,146.245,436.123,152.511z M197.871,202.934c-7.646,0-13.867,6.221-13.867,13.867    c0,7.646,6.221,13.867,13.867,13.867s13.867-6.221,13.867-13.867C211.738,209.155,205.517,202.934,197.871,202.934z     M340.831,297.479c-7.646,0-13.866,6.221-13.866,13.866s6.221,13.867,13.866,13.867c7.646,0,13.867-6.221,13.867-13.867    S348.477,297.479,340.831,297.479z M599.309,281.215c4.602,24.802-14.404,46.518-38.386,46.518    c-17.602,0-32.512-11.703-37.386-27.733H378.217c-4.874-16.03-19.784-27.733-37.386-27.733c-23.988,0-42.997,21.724-38.384,46.532    c2.888,15.534,15.362,28.023,30.894,30.924c20.747,3.875,39.323-8.77,44.876-27.032h73.033L249.195,524.747    c-9.548,9.548-25.028,9.548-34.575,0L7.161,317.287c-9.548-9.547-9.548-25.027,0-34.574L214.62,75.253    c9.548-9.548,25.028-9.548,34.576,0l65.911,65.912h56.727c6.469,0,11.673,5.413,11.33,11.956    c-0.321,6.135-5.828,10.735-11.971,10.735h-90.121c-6.469,0-11.672,5.412-11.329,11.955c0.321,6.135,5.827,10.735,11.97,10.735    l186.615,0c6.266,0,11.345,5.08,11.345,11.345l0,0c0,6.266-5.079,11.345-11.345,11.345H236.201    c-1.789-9.081-6.727-17.042-13.634-22.691c-6.736-5.509-15.334-8.824-24.695-8.824c-23.021,0-41.456,20.009-38.828,43.551    c1.954,17.502,15.949,31.875,33.4,34.238c18.45,2.498,34.878-7.977,41.456-23.583h183.314c6.469,0,11.672,5.412,11.329,11.955    c-0.321,6.135-5.827,10.735-11.97,10.735h-22.797c-7,0-12.521,6.34-11.13,13.592c1.033,5.389,6.063,9.099,11.55,9.099h129.34    c0.832-2.738,1.968-5.342,3.35-7.791c7.743-13.714,23.499-22.33,40.889-19.355C583.58,252.868,596.383,265.45,599.309,281.215z     M574.788,288.655c0-7.646-6.22-13.866-13.866-13.866s-13.867,6.221-13.867,13.866c0,7.646,6.221,13.867,13.867,13.867    S574.788,296.3,574.788,288.655z"></path>
          </svg>
          <span>CryRoom</span>
          <p>Encrypted chatroom</p>
        </div>
        <div className="user">
          <input type="text" placeholder="Name" onChange={changeName}/>
          <input type="password" placeholder="Password" onChange={changePassword}/>
        </div>
        <div className="info">
          <p>You only can read messages which your password can unlock.</p>
          <p>Messages will be deleted after 48 hours.</p>
        </div>
        <div className="toggle">
          <button onClick={toggleHeader}>
            <img alt="arrow" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAADHUlEQVRIic2VP2wcRRTGf2/Op5ws9oLufJJ3Vg5OghKlTBpKJPKnQWDR4i4pEEQJIFCiIOWPhEIBirAQDSmSyq4xraFJAQ3QxAUUscDyTbx3J5vcGZzz3exQ7GyyNmc7FhLik066/ebN9817M/MG/k/QWo9orUf2Mkd2GhwdHa0ppc4BE8BxYJ8f6gI/A7NJktxZXl5u7tVAhWF4WUSuAMEui2wDnxhjPgOSXQ1qtdpzxWJxBnjNU00RmRaRuV6vtwgwNDT0AnDaOTcJZCX7ptfrTTabzbWdDJTW+utMXESmut3utVar1Rm09EqlUi6VSh8DFzMTY8wbgzIBIAzDK1prp7V2YRi+NTBoAKIoejubp7W+NDADv6EPgEBEpur1+vvPagCgtf4CuAA8Al40xrQAVBbgT0sANNfX16/vRRygVCpdBVrAfuBsxg/lYiYARGR6ZWWlPTY2dtha+66I7GMHOOe61tqphYWFBa31DOl+TACf5g2E9JwjInMA/X7/vIhccM7tunqlVA/4QETmnHMXgRNe0ymAKIoq+EuUHUUR+Qpo5HTuichtEbkN3MvxDc8hIr97ruQ1n+7BVhhjfgVeBh566piIfOmc+xw44rmmUuqUj80qAUChUEieGNTr9RXS60+xWDyQM/nFWnvGZ1JLkuQ7v/pRoGGtfWVpael+Fu+cy+Y+Xlxc/COfgSPtLTjnzuQzieN43lp7MjPxv4a19mQcx/P52Nzcn7zmphLN+qDJSqVS3sZkGXg4SHx8fPx54M281iaDJEnukDauEX/9NyGO43ml1CGl1OGt4gAbGxs3gSrpRbub8YXsz9ra2l9BEDjgFPBSuVxudDqdH/Mi7Xa73263+1vFtdbvADf85zVjzLf/MADodDo/BEFwHDgKvBoEQbVWq32/urra3SoKaVmGh4dv5cRnjTHv4esP27fraeB1T7WAGRGZ6/f7vwEUCoWDwGnSmlczcWvtZBzHf+b1tn1wtNYfAh+R9pad8Ai4aYy5xbM8OHn49/csaW85AZT80GPSozgL3M06579GFEXVKIqqu0f+h/gbIOY1BAkIaQYAAAAASUVORK5CYII="/>
          </button>
        </div>
      </div>
      <div className="container">
        <p onClick={scrollToEnd}>...</p>
        { messages.map((m) => 
          <Bubble name={m.name} message={m.message} unlocked={(m.signiture === sign)} key={messages.indexOf(m)}/>
        )}
        <div id='bottom'></div>
      </div>
      <div className='footer'>
        <div className='inputForm'>
          <div className='textbox' contentEditable placeholder="Type your message here..." onKeyUp={changeMessage}></div>
          <button type="submit" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </>
  );
}

export default App;
