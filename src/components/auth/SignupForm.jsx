import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";
import { InputField } from "./InputField.jsx";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password, confirmPassword);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Signup failed");
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div>
        <h2 className="font-sans text-2xl font-semibold tracking-tight text-mist-50">
          Create account
        </h2>
        <p className="mt-2 font-mono text-sm text-mist-500">
          Join and track your typing journey
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 font-mono text-sm text-rose-200"
        >
          {error}
        </motion.div>
      )}

      <InputField
        id="signup-name"
        label="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        required
      />
      <InputField
        id="signup-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <InputField
        id="signup-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <InputField
        id="signup-confirm"
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <motion.button
        type="submit"
        disabled={loading}
        className="relative overflow-hidden rounded-2xl bg-accent py-4 font-semibold text-ink-950 shadow-lg shadow-accent/25 transition hover:brightness-110 disabled:opacity-60"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden>
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Creating account…
          </span>
        ) : (
          "Create account"
        )}
      </motion.button>

      <p className="text-center font-mono text-sm text-mist-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-accent transition hover:underline"
        >
          Sign in
        </Link>
      </p>
    </motion.form>
  );
}
