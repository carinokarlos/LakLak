import { useState } from "react";
import { Brand } from "../ui/Brand";

const Login = ({ onLogin, loginEmail, setLoginEmail, loginError, isLoggingIn }) => {
  const handleLogin = (event) => {
    event.preventDefault();
    onLogin(loginEmail.trim());
  };

  return (
    <section className="login-screen">
      <form className="login-panel" onSubmit={handleLogin}>
        <div className="login-brand">
          <Brand />
        </div>

        <div>
          <h1>Sign In</h1>
          <p className="login-copy">Use your local admin account.</p>
        </div>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={loginEmail}
            autoComplete="email"
            onChange={(event) => setLoginEmail(event.target.value)}
            required
          />
        </label>

        <button className="button" type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? "Signing in" : "Continue"}
        </button>
        <p className="form-message error" role="status">
          {loginError}
        </p>
      </form>
    </section>
  );
};

export default Login;