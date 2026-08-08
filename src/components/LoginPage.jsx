import { useState } from "react";
import { supabase } from "../supabase";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      let result;

      if (isSignup) {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (result.error) {
        throw result.error;
      }

      if (isSignup && !result.data.session) {
        setMessage(
          "Account created. Check your email to confirm your account."
        );
      } else {
        onLogin(result.data.user);
      }

    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>Markd</h1>

        <p>
          {isSignup
            ? "Create your student account"
            : "Log in to continue"}
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          {message && (
            <p className="login-message">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Log In"}
          </button>

        </form>

        <button
          className="login-switch"
          onClick={() => {
            setIsSignup(!isSignup);
            setError("");
            setMessage("");
          }}
        >
          {isSignup
            ? "Already have an account? Log in"
            : "Don't have an account? Sign up"}
        </button>

      </div>

    </div>
  );
}