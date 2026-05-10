import { AuthContainer } from "../components/auth/AuthContainer.jsx";
import { LoginForm } from "../components/auth/LoginForm.jsx";

export function LoginPage() {
  return (
    <AuthContainer>
      <LoginForm />
    </AuthContainer>
  );
}
