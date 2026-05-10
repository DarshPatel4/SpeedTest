import { AuthContainer } from "../components/auth/AuthContainer.jsx";
import { SignupForm } from "../components/auth/SignupForm.jsx";

export function SignupPage() {
  return (
    <AuthContainer>
      <SignupForm />
    </AuthContainer>
  );
}
