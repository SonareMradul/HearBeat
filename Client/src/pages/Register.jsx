import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      const redirect =
        new URLSearchParams(location.search).get("redirect") || "/";

      navigate(
        `/login?redirect=${encodeURIComponent(redirect)}&registered=true`
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8"
      >
        <h1 className="text-3xl font-bold">Create your HearBeat account</h1>

        <p className="text-zinc-400 mt-2 mb-6">
          Join HearBeat and start listening.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <input
          type="text"
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 p-3 rounded-lg bg-zinc-800 text-white outline-none border border-transparent focus:border-zinc-600"
        />

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 rounded-lg bg-zinc-800 text-white outline-none border border-transparent focus:border-zinc-600"
        />

        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-3 rounded-lg bg-zinc-800 text-white outline-none border border-transparent focus:border-zinc-600"
        />

        <input
          type="password"
          required
          minLength={6}
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-800 text-white outline-none border border-transparent focus:border-zinc-600"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 py-3 rounded-lg font-semibold"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-zinc-400 mt-6">
          Already have an account?{" "}
          <Link
            to={`/login${
              location.search
                ? location.search
                : ""
            }`}
            className="text-green-400 hover:text-green-300"
          >
            Log in
          </Link>
        </p>

        <Link
          to="/"
          className="block text-center text-zinc-500 hover:text-white mt-4 text-sm"
        >
          Continue without login
        </Link>
      </form>
    </div>
  );
}