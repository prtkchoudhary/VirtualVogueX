import React, { useState } from "react";
import Axios from "axios"; // for making http requests
import GoogleButton from "react-google-button";
import { useHistory } from "react-router-dom"; // Import for navigation in React Router v5

export default function Login() {
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerMobile, setRegisterMobile] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [adminCode, setAdminCode] = useState(""); // New field for admin access code

  const history = useHistory();

  // Register function
  const register = () => {
    Axios({
      method: "POST",
      data: {
        username: registerUsername,
        password: registerPassword,
        mobile: registerMobile,
        email: registerEmail,
      },
      withCredentials: true,
      url: "http://localhost:5000/register",
    }).then((res) => {
      console.log(res);
      alert(res.data);
    });
  };

  // Login function with admin check
  const login = () => {
    Axios({
      method: "POST",
      data: {
        username: loginUsername,
        password: loginPassword,
        adminCode: adminCode, // Send the admin code for validation
      },
      withCredentials: true,
      url: "http://localhost:5000/login",
    })
      .then((res) => {
        console.log(res);
        if (res.data.isAdmin) {
          alert("Admin login successful!");
          history.push("/editproduct"); // Redirect to EditProduct page if admin
        } else if (res.data.message === "User logged in") {
          alert("Login successful!");
        } else {
          alert(res.data.message); // Display any errors
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        alert("Login failed. Please check your credentials.");
      });
  };

  const googleAuth = () => {
    window.open("http://localhost:5000/google");
  };

  return (
    <div className="login">
      <div>
        <h1>Register Now!</h1>
        <input
          placeholder="Username"
          onChange={(e) => setRegisterUsername(e.target.value)}
        />
        <br />
        <input
          placeholder="Mobile Number"
          onChange={(e) => setRegisterMobile(e.target.value)}
        />
        <br />
        <input
          placeholder="Email ID"
          onChange={(e) => setRegisterEmail(e.target.value)}
        />
        <br />
        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setRegisterPassword(e.target.value)}
        />
        <br />
        <button onClick={register}>Submit</button>
      </div>
      <br /><br />

      <div>
        <h1>Login</h1>
        <input
          placeholder="Username"
          onChange={(e) => setLoginUsername(e.target.value)}
        />
        <br />
        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setLoginPassword(e.target.value)}
        />
        <br />
        <input
          placeholder="Admin Code (if admin)"
          onChange={(e) => setAdminCode(e.target.value)}
        />
        <br />
        <button onClick={login}>Continue</button><br/>

        <center>
          <GoogleButton onClick={googleAuth}/>
        </center>

      </div>
      <br /><br />
    </div>
  );
}
