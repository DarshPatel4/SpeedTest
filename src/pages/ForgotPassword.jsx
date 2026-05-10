import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth.js";
import { AuthContainer } from "../components/auth/AuthContainer.jsx";
import { InputField } from "../components/auth/InputField.jsx";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setMessage(data.message || "If this email exists, reset instructions were sent");
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-5">
        <h2 className="font-sans text-2xl font-semibold tracking-tight text-mist-50">
          Forgot password
        </h2>
        {message && <p className="rounded-xl bg-emerald-950/40 p-3 text-sm text-emerald-200">{message}</p>}
        {error && <p className="rounded-xl bg-rose-950/40 p-3 text-sm text-rose-200">{error}</p>}
        <InputField
          id="forgot-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-accent py-4 font-semibold text-ink-950 disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
        <Link to="/login" className="text-center text-sm text-accent hover:underline">
          Back to login
        </Link>
      </form>
    </AuthContainer>
  );
}
