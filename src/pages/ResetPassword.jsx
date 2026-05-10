import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../api/auth.js";
import { AuthContainer } from "../components/auth/AuthContainer.jsx";
import { InputField } from "../components/auth/InputField.jsx";

export function ResetPasswordPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Reset failed");
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-5">
        <h2 className="font-sans text-2xl font-semibold tracking-tight text-mist-50">
          Reset password
        </h2>
        {error && <p className="rounded-xl bg-rose-950/40 p-3 text-sm text-rose-200">{error}</p>}
        <InputField
          id="new-password"
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <InputField
          id="confirm-password"
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-accent py-4 font-semibold text-ink-950 disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
        <Link to="/login" className="text-center text-sm text-accent hover:underline">
          Back to login
        </Link>
      </form>
    </AuthContainer>
  );
}
