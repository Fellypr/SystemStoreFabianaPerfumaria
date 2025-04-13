import React from "react";
import "./ScreenLogin.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { FaCircleUser } from "react-icons/fa6";
import { IoEyeSharp } from "react-icons/io5";

function ScreenLogin() {
  const [showPassword, setShowPassword] = useState(true);
  const ShowPassword = () => setShowPassword(!showPassword);
  return (
    <div className="Container">
      <div className="Login">
        <h1>Login</h1>
        <FaCircleUser className="iconUser" size={80} />
        <form>
          <input type="email" placeholder="E-mail" required />
          <br />
          <input type={showPassword ? "text" : "password"} placeholder="Senha" required minLength={6} />
          <IoEyeSharp
            className="iconsOlhos"
            size={25}
            onClick={ShowPassword}
            
          />
        </form>
        <button><Link to={"/ScreenMain"}>Entrar</Link></button>
      </div>
    </div>
  );
}

export default ScreenLogin;
