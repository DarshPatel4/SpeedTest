import { forwardRef, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const InputField = forwardRef(function InputField(
  {
    id,
    label,
    type = "text",
    error,
    autoFocus,
    onBlur,
    onFocus,
    onChange,
    className = "",
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(
    props.value != null && String(props.value).length > 0
  );
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);
  const isPassword = type === "password";
  const isFilled = hasValue || (props.value != null && String(props.value).length > 0);
  const floatLabel = focused || isFilled;

  useEffect(() => {
    setHasValue(props.value != null && String(props.value).length > 0);
  }, [props.value]);

  useEffect(() => {
    const syncFromDom = () => {
      const raw = inputRef.current?.value ?? "";
      if (raw.length > 0) {
        setHasValue(true);
      }
    };
    const id = setTimeout(syncFromDom, 50);
    return () => clearTimeout(id);
  }, []);

  const setRefs = (node) => {
    inputRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    setHasValue(String(e.target.value || "").length > 0);
    onBlur?.(e);
  };

  const handleChange = (e) => {
    setHasValue(String(e.target.value || "").length > 0);
    onChange?.(e);
  };

  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-925/80"
        animate={{
          borderColor: error ? "rgba(248,113,113,0.5)" : floatLabel ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.1)",
          boxShadow: focused && !error ? "0 0 0 1px rgba(56,189,248,0.2), 0 0 20px rgba(56,189,248,0.06)" : "0 0 0 0 transparent",
        }}
        transition={{ duration: 0.2 }}
      >
        <input
          ref={setRefs}
          id={id}
          type={inputType}
          autoFocus={autoFocus}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className="peer w-full rounded-2xl border-0 bg-transparent px-4 pb-2 pt-6 font-mono text-sm text-mist-100 caret-accent outline-none placeholder:text-transparent transition-colors autofill:[-webkit-text-fill-color:theme(colors.mist.100)]"
          placeholder=" "
          autoComplete={type === "email" ? "email" : isPassword ? "current-password" : props.autoComplete}
          {...props}
        />
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-4 top-2 font-mono text-[11px] text-mist-500 transition-all duration-200
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm
            peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-accent
            ${floatLabel ? "top-2 translate-y-0 text-[11px]" : ""}`}
        >
          {label}
        </label>
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-mist-500 hover:text-mist-300"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 font-mono text-xs text-rose-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});
