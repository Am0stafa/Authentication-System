import "./app.css";
import {  Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Post from "./pages/Post";
import Login from "./pages/Login";

function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = () => {
      fetch("http://localhost:5001/auth/login/success", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
      })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error("authentication has been failed!");
      })
      .then((resObject) => {
        setUser(resObject.user);
      })
      .catch((err) => {
        console.log(err);
      });
    };
    getUser();
  }, []);

  return (
    <div>
      <NavBar user={user}/>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route
        path="/post/:id"
        element={user ? <Post /> : <Navigate to="/login" replace />}
        />
        
        <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
        />
        
      </Routes>
    </div>
  );
}

export default App;
