import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles/LoginStyles.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Enviando formulario', email, password, rememberMe);
    };

    const handleRememberMeChange = (event) => {
        setRememberMe(event.target.checked);
    };

    return (
        <div className="login">
        <div className="login-header">
            <img src="https://static.vecteezy.com/system/resources/previews/009/267/561/original/user-icon-design-free-png.png" alt="icono usuario" width='120px'/>
            <h3>Iniciar Sesión</h3>
            <p>¿No tienes una cuenta? <Link to="/register">Regístrate</Link></p>
        </div>
        <form onSubmit={handleSubmit}>
            <div>
            <input
                type="email"
                placeholder="Email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
            />
            </div>
            <div>
            <input
                type="password"
                placeholder="Contraseña..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
            />
            </div>
            <div className="recpass-container">
            <div className="remember-me">
                <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                />
                <label htmlFor="rememberMe">Recordarme</label>
            </div>
            <a href="">¿Olvidaste tu contraseña?</a>
            </div>
            <div>
            <button type="submit" className="login-btn"> Iniciar Sesión</button>
            </div>
        </form>
        </div>
    );
}

export default Login;
