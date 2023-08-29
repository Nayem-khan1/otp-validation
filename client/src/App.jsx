import React, { useState } from 'react';
import './App.css';
import { toast } from 'react-toastify';

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  const requestOtp = async () => {
    try {
      const response = await fetch('http://localhost:5000/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      if(data.error){
          toast.error(`${data.error}`)
      }else{
        toast.success(`${data.otp}`)
      }
      
      console.log(data)
      if (response.ok) {
        setMessage(`OTP sent to ${phoneNumber}`);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };

  return (
    <div className="App">
      <h1>OTP Login</h1>
      <input
        type="text"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <br />
      <button onClick={requestOtp}>Request OTP</button>
      <br />
      <input
        type="text"
        placeholder="OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <br />
      <button onClick={verifyOtp}>Verify OTP</button>
      <p>{message}</p>
    </div>
  );
}

export default App;
