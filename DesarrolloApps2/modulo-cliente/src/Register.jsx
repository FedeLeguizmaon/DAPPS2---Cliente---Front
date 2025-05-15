import { useState } from "react";
import { Link } from "react-router-dom";
import './styles/LoginStyles.css';


function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
    
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Enviando formulario', email, password, rememberMe);
    };
    
    return (
        <>
            <div className="login">
                <div className="login-header">
                    <img src="https://static.vecteezy.com/system/resources/previews/009/267/561/original/user-icon-design-free-png.png" alt="icono usuario" width='120px'/>
                    <h3>Registrarse</h3>
                    <p>¿Ya tenés una cuenta? <Link to="/Login">Iniciá sesion</Link></p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <input type="email" placeholder="Email..." value={email} onChange={(e) => setEmail(e.target.value)} className="login-input"/>
                    </div>
                    <div>
                        <input type="password" placeholder="Contraseña..." value={password} onChange={(e) => setPassword(e.target.value)} className="login-input"/>
                    </div>
                    <div>
                        <input type="phoneNumber" placeholder="Teléfono..." value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="login-input"/>
                    </div>
                    <div className="btn-container">
                        <button type="submit" className="login-btn">Registrarse</button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default Register;