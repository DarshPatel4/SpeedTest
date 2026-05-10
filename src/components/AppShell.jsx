import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar.jsx";
import { PageWrapper } from "./PageWrapper.jsx";

export function AppShell() {
  return (
    <div className="min-h-screen bg-ink-950 text-mist-100">
      <div className="pointer-events-none fixed inset-0 bg-grid-faint bg-[length:48px_48px] opacity-25" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[420px] bg-radial-glow opacity-50" />
      <Navbar />
      <PageWrapper className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Outlet />
      </PageWrapper>
    </div>
  );
}
