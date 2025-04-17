import React from "react";
import "./ScreenLogin.css";
import { Link , useNavigate} from "react-router-dom";
import { useState } from "react";
import { FaCircleUser } from "react-icons/fa6";
import { IoEyeSharp } from "react-icons/io5";
import axios from "axios";

function ScreenLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const ShowPassword = () => setShowPassword(!showPassword);
  
  const navigate = useNavigate();
  const login = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5080/api/AutenticacaoDeUsuario/Login",
        {
          Email: email,
          Senha: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("Logado com sucesso");
      console.log(response.data);
      navigate("/ScreenMain");
      
    } catch (error) {
      console.error(error);
      alert("Erro ao logar");
    }
    
  }

  return (
    <div className="Container">
      <div className="Login">
        <h1>Login</h1>
        <FaCircleUser className="iconUser" size={80} />
        <form>
          <input type="text" placeholder="E-mail" required onChange={(e) => setEmail(e.target.value)} className="email" />
          <br />
          <input type={showPassword ? "text" : "password"} placeholder="Senha" required  onChange={(e) => setPassword(e.target.value)}/>
          <IoEyeSharp
            className="iconsOlhos"
            size={25}
            onClick={ShowPassword}
            
          />
        </form>
        <button type="submit" onClick={login} >Entrar</button>
      </div>
    </div>
  );
}

export default ScreenLogin;
