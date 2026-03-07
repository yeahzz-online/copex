import { Link } from "react-router-dom";

const AUTH_TABS = [
  { id: "login", label: "Sign In", to: "/login" },
  { id: "register", label: "Sign Up", to: "/register" }
];


    function AuthHeroIllustration() {
  return <img src="/auth-assets/002.svg" alt="Portal hero" className="w-full max-w-sm self-center" />;
}



export default function AuthShell({
  mode,
  title,
  subtitle,
  helperText,
  helperLinkLabel,
  helperLinkTo,
  children
}) {
  return (
    <div className="background flex min-h-screen items-center justify-center px-4 py-8 md:px-8">
      <div className="w-full max-w-6xl rounded-[30px] border border-white/10 bg-[#070e25]/85 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="grid gap-3 md:grid-cols-[92px_1.1fr_1fr]">
          <aside className="rounded-2xl border border-white/10 bg-[#080f24] p-2">
            <nav className="flex gap-2 md:h-full md:flex-col">
              {AUTH_TABS.map((tab) => {
                const active = tab.id === mode;
                return (
                  <Link
                    key={tab.id}
                    to={tab.to}
                    className={`flex flex-1 items-center justify-center rounded-xl px-3 py-3 text-sm font-semibold transition md:flex-none md:justify-start md:gap-2 ${
                      active
                        ? "bg-[#3055e0] text-white"
                        : "text-slate-400 hover:bg-[#151e3d] hover:text-white"
                    }`}
                  >
                    <span
                      className={`hidden h-6 w-1 rounded-full md:block ${
                        active ? "bg-cyan-300" : "bg-transparent"
                      }`}
                    />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <section className="relative hidden overflow-hidden rounded-2xl bg-gradient-to-b from-[#4a70ff] via-[#3f63f5] to-[#2f4fdd] p-8 md:flex md:flex-col md:justify-between">
            <div>
              <h1 className="font-display text-4xl text-white">{title}</h1>
              <p className="mt-2 text-sm text-blue-100">{subtitle}</p>
            </div>
            <AuthHeroIllustration />
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#090f24]/85 p-5 md:p-8">
            <div className="mb-6 md:hidden">
              <h1 className="font-display text-3xl text-white">{title}</h1>
              <p className="mt-2 text-sm text-soft">{subtitle}</p>
            </div>
            <p className="text-sm text-slate-300">
              {helperText}{" "}
              <Link className="font-semibold text-brand-300 hover:text-brand-100" to={helperLinkTo}>
                {helperLinkLabel}
              </Link>
            </p>
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
