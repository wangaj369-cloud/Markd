
import { useState } from "react";
import { supabase } from "../supabase";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordValid = password.length >= 6;

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (isSignUp && !passwordValid) {
      setError("Your password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          onLogin(data.user);
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) throw error;

        if (data.user) {
          onLogin(data.user);
        }
      }
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  function switchMode() {
    setIsSignUp(!isSignUp);
    setError("");
    setPassword("");
  }

  return (
    <div className="login-page">

      <div className="login-background-glow"></div>

      <div className="login-card">

        <div className="login-brand">
          <div className="login-logo">
            M
          </div>

          <h1>Markd</h1>
        </div>

        <div className="login-heading">

          <h2>
            {isSignUp
              ? "Create your account"
              : "Welcome back"}
          </h2>

          <p>
            {isSignUp
              ? "Create an account and start saving your revision progress."
              : "Log in to continue your revision."}
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="login-field">

            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>

          <div className="login-field">

            <label>Password</label>

            <div className="password-input-wrapper">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              <button
                type="button"
                className="show-password-button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

          {isSignUp && (

            <div
              className={`password-requirements ${
                passwordValid ? "valid" : ""
              }`}
            >

              <span>
                {passwordValid ? "✓" : "•"}
              </span>

              At least 6 characters

            </div>

          )}

          {error && (

            <div className="login-error">
              {error}
            </div>

          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >

            {loading
              ? "Please wait..."
              : isSignUp
                ? "Create Account"
                : "Log In"}

          </button>

        </form>

        <div className="login-divider">
          <span></span>
          <p>or</p>
          <span></span>
        </div>

        <button
          type="button"
          className="login-switch"
          onClick={switchMode}
        >

          {isSignUp
            ? "Already have an account? Log in"
            : "Don't have an account? Create one"}

        </button>

      </div>

    </div>
  );
}

