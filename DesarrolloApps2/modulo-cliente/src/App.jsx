import React, { useState } from 'react';
import './styles/App.css';
import Login from './Login.jsx';
import Register from './Register.jsx';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/*
        <nav>
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/Login">Login</Link>
            </li>
          </ul>
        </nav> */}
        <Routes> 
          <Route path="/" element={<h1>Página de inicio</h1>} /> {/* Renderiza un componente diferente para la página de inicio */}
          <Route path="/Login" element={<Login />} />
          <Route path='/Register' element={<Register />} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
