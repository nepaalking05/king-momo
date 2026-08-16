import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../services/auth";

import "./login.css";


export default function LoginPage() {

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      await login(
        email.trim(),
        password
      );

      navigate("/", {
        replace: true,
      });

    } catch (error) {

      console.error(error);

      setError(
        "Invalid email or password."
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-header">

          <div className="login-logo">
            🍽️
          </div>

          <h1>
            Restaurant POS
          </h1>

          <p>
            Sign in to continue
          </p>

        </div>


        <form
          onSubmit={handleLogin}
          className="login-form"
        >

          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />


          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />


          {error && (
            <div className="login-error">
              {error}
            </div>
          )}


          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

      </div>

    </div>
  );
}