import React, { useState } from 'react';
import './BillingAuth.css';

const BillingAuth = ({ onAuthenticate }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Senhas permitidas
  const MASTER_PASSWORD = 'P@55w.rd781560';
  const ADDITIONAL_PASSWORD = 'senha123';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password === MASTER_PASSWORD || password === ADDITIONAL_PASSWORD) {
      onAuthenticate(true);
    } else {
      setError('Senha incorreta. Tente novamente.');
      setPassword('');
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onAuthenticate(false);
  };

  return (
    <div className="billing-auth-overlay">
      <div className="billing-auth-modal">
        <div className="billing-auth-header">
          <h2>🔒 Acesso Restrito</h2>
          <p className="billing-auth-subtitle">Área de Faturamento</p>
        </div>
        
        <div className="billing-auth-body">
          <p className="billing-auth-description">
            Esta seção contém informações sensíveis de faturamento.
            Por favor, insira a senha para continuar.
          </p>
          
          <form onSubmit={handleSubmit} className="billing-auth-form">
            <div className="billing-auth-input-group">
              <label htmlFor="billing-password">Senha:</label>
              <div className="billing-auth-password-wrapper">
                <input
                  id="billing-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="billing-auth-input"
                  autoFocus
                />
                <button
                  type="button"
                  className="billing-auth-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="billing-auth-error">
                {error}
              </div>
            )}

            <div className="billing-auth-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="billing-auth-button billing-auth-button-cancel"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="billing-auth-button billing-auth-button-submit"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BillingAuth;

