import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      const redirect = new URLSearchParams(location.search).get("redirect") || "/";
      navigate(redirect);
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-8 bg-black">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white">Welcome to HearBeat</h1>
        <p className="text-zinc-400 mt-2 mb-6">Log in to manage playlists.</p>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-3 p-3 rounded bg-zinc-800 text-white outline-none" />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded bg-zinc-800 text-white outline-none" />
        <button disabled={loading} className="mt-5 w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 py-3 rounded-lg">{loading ? "Logging in..." : "Log In"}</button>
<p className="text-center text-sm text-zinc-400 mt-5">
  Don't have an account?{" "}
  <Link
    to={`/register${
      location.search ? location.search : ""
    }`}
    className="text-green-400 hover:text-green-300"
  >
    Create account
  </Link>
</p>

<Link
  to="/"
  className="block text-center text-zinc-500 hover:text-white mt-4 text-sm"
>
  Continue without login
</Link>      </form>
    </div>
  );
}
