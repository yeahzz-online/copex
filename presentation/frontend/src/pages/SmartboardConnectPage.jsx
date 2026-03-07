import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../services/api";
import { setAuthSession } from "../services/tokenStorage";

function formatSeconds(seconds) {
  const safe = Math.max(Number(seconds || 0), 0);
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function SmartboardConnectPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Preparing secure smartboard session...");
  const [mode, setMode] = useState("QR");
  const [facultyForm, setFacultyForm] = useState({ email: "", password: "" });
  const [otpForm, setOtpForm] = useState({ email: "", otp: "" });
  const [starting, setStarting] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpSessionToken, setOtpSessionToken] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const expiryLabel = useMemo(() => {
    if (!session?.expiresAt) return "--:--";
    return formatSeconds(secondsLeft);
  }, [secondsLeft, session?.expiresAt]);

  const startSession = useCallback(async () => {
    setError("");
    setStarting(true);
    setStatus("Creating smartboard QR session...");
    try {
      const response = await api.post("/auth/smartboard/session", {
        smartboardName: "CMR Smartboard Display"
      });
      const created = response.data || null;
      setSession(created);
      setOtpRequested(false);
      setOtpSessionToken("");
      setStatus("Scan this QR with faculty account to authorize.");

      if (created?.expiresAt) {
        const nextSeconds = Math.floor(
          (new Date(created.expiresAt).getTime() - Date.now()) / 1000
        );
        setSecondsLeft(Math.max(nextSeconds, 0));
      }
      return created;
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to start smartboard session");
      setStatus("Session could not be started.");
      return null;
    } finally {
      setStarting(false);
    }
  }, []);

  useEffect(() => {
    startSession();
  }, [startSession]);

  useEffect(() => {
    if (!session?.expiresAt) return undefined;

    const tick = () => {
      const nextSeconds = Math.floor(
        (new Date(session.expiresAt).getTime() - Date.now()) / 1000
      );
      setSecondsLeft(Math.max(nextSeconds, 0));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session?.expiresAt]);

  const completeSmartboardLogin = async (activeSession, fallbackEmail = "") => {
    const exchangeResponse = await api.post("/auth/smartboard/exchange", {
      sessionToken: activeSession.sessionToken
    });

    if (exchangeResponse.data?.status !== "AUTHORIZED") {
      throw new Error("Smartboard session was not authorized");
    }

    setStatus("Smartboard authorized. Opening presentation view...");
    setAuthSession({
      accessToken: exchangeResponse.data.accessToken,
      user: {
        id: `smartboard-${Date.now()}`,
        name: activeSession.smartboardName || "Smartboard",
        email: exchangeResponse.data.faculty?.email || fallbackEmail || "",
        role: "SMARTBOARD"
      }
    });
    navigate("/smartboard/view", { replace: true });
  };

  const getActiveSession = async () => {
    let activeSession = session;
    if (!activeSession?.sessionToken || secondsLeft <= 0) {
      activeSession = await startSession();
    }

    if (!activeSession?.sessionToken) {
      throw new Error("Unable to create smartboard session");
    }
    return activeSession;
  };

  useEffect(() => {
    if (mode !== "QR" || !session?.sessionToken) return undefined;

    const interval = setInterval(async () => {
      try {
        const response = await api.post("/auth/smartboard/exchange", {
          sessionToken: session.sessionToken
        });

        if (response.data.status === "AUTHORIZED") {
          setAuthSession({
            accessToken: response.data.accessToken,
            user: {
              id: `smartboard-${Date.now()}`,
              name: session.smartboardName || "Smartboard",
              email: response.data.faculty?.email || "",
              role: "SMARTBOARD"
            }
          });
          navigate("/smartboard/view", { replace: true });
        } else {
          setStatus("Waiting for faculty authorization...");
        }
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Session polling failed");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [mode, navigate, session]);

  const authorizeWithFacultyCredentials = async (event) => {
    event.preventDefault();
    setError("");
    setAuthorizing(true);
    setStatus("Verifying faculty credentials...");

    try {
      const email = facultyForm.email.trim();
      const password = facultyForm.password;
      if (!email || !password) {
        throw new Error("Faculty email and password are required");
      }

      const activeSession = await getActiveSession();

      const authBaseUrl = api.defaults.baseURL;
      const loginResponse = await axios.post(
        `${authBaseUrl}/auth/login`,
        { email, password },
        { timeout: 15000 }
      );

      const facultyUser = loginResponse.data?.user || {};
      const facultyAccessToken = loginResponse.data?.accessToken;
      if (facultyUser.role !== "FACULTY") {
        throw new Error("Only faculty accounts can authorize smartboard login");
      }
      if (!facultyAccessToken) {
        throw new Error("Faculty login did not return access token");
      }

      await axios.post(
        `${authBaseUrl}/auth/smartboard/authorize`,
        { sessionToken: activeSession.sessionToken },
        {
          headers: {
            Authorization: `Bearer ${facultyAccessToken}`
          },
          timeout: 15000
        }
      );

      await completeSmartboardLogin(activeSession, facultyUser.email || email);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Faculty authorization failed"
      );
      setStatus("Authorization failed.");
    } finally {
      setAuthorizing(false);
    }
  };

  const requestFacultyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setRequestingOtp(true);
    setStatus("Sending OTP to faculty email...");

    try {
      const email = otpForm.email.trim();
      if (!email) {
        throw new Error("Faculty email is required");
      }

      const activeSession = await getActiveSession();
      await api.post("/auth/smartboard/request-otp", {
        sessionToken: activeSession.sessionToken,
        facultyEmail: email
      });

      setOtpRequested(true);
      setOtpSessionToken(activeSession.sessionToken);
      setStatus("OTP sent. Enter OTP to authorize smartboard login.");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to request OTP"
      );
      setStatus("OTP request failed.");
    } finally {
      setRequestingOtp(false);
    }
  };

  const verifyFacultyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setVerifyingOtp(true);
    setStatus("Verifying OTP...");

    try {
      const email = otpForm.email.trim();
      const otp = otpForm.otp.trim();

      if (!email || !otp) {
        throw new Error("Faculty email and OTP are required");
      }
      if (!otpSessionToken) {
        throw new Error("Please request OTP first");
      }
      if (secondsLeft <= 0) {
        throw new Error("Session expired. Request OTP again");
      }

      await api.post("/auth/smartboard/verify-otp", {
        sessionToken: otpSessionToken,
        facultyEmail: email,
        otp
      });

      await completeSmartboardLogin(
        {
          sessionToken: otpSessionToken,
          smartboardName: session?.smartboardName || "Smartboard"
        },
        email
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "OTP verification failed"
      );
      setStatus("OTP verification failed.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#5a4bff] via-[#6e60ff] to-[#8a7bff] px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-16 h-12 w-12 rounded-full bg-white/10 blur-xl" />
        <div className="absolute right-12 bottom-10 h-16 w-16 rounded-full bg-[#ffd166]/30 blur-xl" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.2em]">
            Smartboard
            <span className="h-1 w-1 rounded-full bg-white/70" />
            Secure Login
          </div>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Connect your display
            <br />
            <span className="text-[#ffe27a]">with one QR</span>
          </h1>
          <p className="max-w-lg text-sm text-blue-50/90">
            Scan or authorize with faculty credentials to launch the smartboard session. Designed
            to feel as friendly as it is secure.
          </p>

          <div className="inline-flex rounded-2xl border border-white/15 bg-white/10 p-1 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
            <button
              type="button"
              onClick={() => setMode("QR")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                mode === "QR" ? "bg-white text-slate-900 shadow-lg shadow-black/10" : "text-blue-50/80"
              }`}
            >
              QR Code
            </button>
            <button
              type="button"
              onClick={() => setMode("PASSWORD")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                mode === "PASSWORD"
                  ? "bg-white text-slate-900 shadow-lg shadow-black/10"
                  : "text-blue-50/80"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode("OTP")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                mode === "OTP"
                  ? "bg-white text-slate-900 shadow-lg shadow-black/10"
                  : "text-blue-50/80"
              }`}
            >
              OTP
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            {mode === "PASSWORD" ? (
              <form className="space-y-3" onSubmit={authorizeWithFacultyCredentials}>
                <input
                  type="email"
                  placeholder="Faculty email"
                  value={facultyForm.email}
                  onChange={(event) =>
                    setFacultyForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-blue-100/70 focus:border-[#ffe27a]"
                  required
                />
                <input
                  type="password"
                  placeholder="Faculty password"
                  value={facultyForm.password}
                  onChange={(event) =>
                    setFacultyForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-blue-100/70 focus:border-[#ffe27a]"
                  required
                />
                <button
                  type="submit"
                  disabled={authorizing}
                  className="w-full rounded-xl bg-[#ffe27a] px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70"
                >
                  {authorizing ? "Authorizing..." : "Authorize Smartboard"}
                </button>
              </form>
            ) : mode === "OTP" ? (
              <form className="space-y-3" onSubmit={verifyFacultyOtp}>
                <input
                  type="email"
                  placeholder="Faculty email"
                  value={otpForm.email}
                  onChange={(event) => {
                    const nextEmail = event.target.value;
                    setOtpForm((prev) => ({ ...prev, email: nextEmail }));
                    setOtpRequested(false);
                    setOtpSessionToken("");
                  }}
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-blue-100/70 focus:border-[#ffe27a]"
                  required
                />
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter OTP"
                    value={otpForm.otp}
                    onChange={(event) =>
                      setOtpForm((prev) => ({
                        ...prev,
                        otp: event.target.value.replace(/\D/g, "").slice(0, 6)
                      }))
                    }
                    className="min-w-[160px] flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-blue-100/70 focus:border-[#ffe27a]"
                    required
                  />
                  <button
                    type="button"
                    onClick={requestFacultyOtp}
                    disabled={requestingOtp}
                    className="rounded-xl bg-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/30 disabled:opacity-70"
                  >
                    {requestingOtp ? "Sending..." : otpRequested ? "Resend OTP" : "Send OTP"}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={verifyingOtp || !otpRequested}
                  className="w-full rounded-xl bg-[#ffe27a] px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70"
                >
                  {verifyingOtp ? "Verifying..." : "Authorize with OTP"}
                </button>
              </form>
            ) : (
              <ol className="space-y-2 text-sm text-blue-50/90">
                <li>1. Scan the QR using a faculty device.</li>
                <li>2. Approve the session in Faculty Smartboard.</li>
                <li>3. We connect automatically after approval.</li>
              </ol>
            )}
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-blue-100/70">
              {status}
            </p>
            {error ? <p className="mt-1 text-sm text-[#ffd1d1]">{error}</p> : null}
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="absolute -left-10 top-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl md:flex">
            🏄‍♂️
          </div>
          <div className="absolute -right-12 top-16 hidden h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl md:flex">
            🇺🇦
          </div>
          <div className="absolute -left-6 bottom-12 hidden h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl md:flex">
            🧑‍🏫
          </div>
          <div className="absolute -right-6 bottom-6 hidden h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl md:flex">
            
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-white/90 p-6 text-slate-900 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <div className="absolute left-1/2 top-[-34px] h-10 w-10 -translate-x-1/2 rotate-6 rounded-2xl bg-white shadow-lg" />
            <div className="absolute left-12 top-[-20px] h-8 w-8 -rotate-6 rounded-2xl bg-white shadow-lg" />
            <div className="relative z-10 rounded-[22px] border border-slate-200 bg-white p-3 shadow-inner">
              {session?.qrDataUrl ? (
                <img
                  src={session.qrDataUrl}
                  alt="Smartboard authorization QR"
                  className="mx-auto w-full rounded-[18px] border border-slate-100"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-[18px] border border-dashed border-slate-300 text-sm text-slate-400">
                  QR loading...
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>Expires in {expiryLabel}</span>
              {mode === "QR" ? (
                <button
                  type="button"
                  onClick={startSession}
                  disabled={starting}
                  className="rounded-full bg-slate-900 px-3 py-1 text-white shadow transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {starting ? "..." : "Refresh"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
