import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username, 
          password: password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("user_type", data.user_type);
  
        // Redirect sesuai role
        if (data.user_type === "1") {
          navigate("/admin_dashboard");
        } else if (data.user_type === "2") {
          navigate("/dosen_dashboard");
        } else if (data.user_type === "3") {
          navigate("/mahasiswa_dashboard");
        } else {
          setErrorMsg("Role tidak dikenali");
        }
      } else {
        setErrorMsg(data.detail || "Login gagal");
        console.error("Login gagal:", data);
      }
    } catch (error) {
      setErrorMsg("Login error");
      console.error("Error login:", error);
    }
  };

  return (
    <div className="container">
      <div className="left-section">
        <div className="text-wrapper">
          <h1>
            <div className="welcome-text">Selamat Datang</div>
            <div className="portal-text">
              di <span className="highlight">Student Portal</span>
            </div>
          </h1>
        </div>
      </div>

      <div className="right-section">
        <div className="login-box">
          <h1 className="login-title">Login Student Portal</h1>
          <div className="inputs">
            <label className="input-label">ID Pengguna</label>
            <input
              type="text"
              placeholder="Username"
              className="username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label className="input-label password">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          <div className="form-extras">
            <div className="remember-forgot">
              <label className="remember-label">
                <input type="checkbox" className="checkbox" />
                Remember me
              </label>
              <a href="/" className="forgot-password">
                Lupa Kata Sandi?
              </a>
            </div>
            <button className="login-button" onClick={handleLogin}>
              Masuk
            </button>
            <div className="version-label">Versi 20250411.2</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
