import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar.jsx";
import { PageWrapper } from "./PageWrapper.jsx";

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 antialiased selection:bg-accent selection:text-ink-950">
      {/* Subtle modern background gradient & radial ambient lights */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(56,189,248,0.1),rgba(11,14,20,0))]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(245,158,11,0.04),transparent)]" />
      
      <Navbar />

      <PageWrapper className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <Outlet />
      </PageWrapper>
    </div>
  );
}
