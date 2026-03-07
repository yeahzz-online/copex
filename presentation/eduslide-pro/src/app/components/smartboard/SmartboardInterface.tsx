import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  ChevronLeft,
  Layers,
  LogOut,
  Monitor,
  Pause,
  Play,
  Settings,
  SkipBack,
  SkipForward,
  Volume2,
  Wifi,
} from "lucide-react";
import { presentations, subjects, type PresentationRecord, type SubjectRecord } from "../../mockData";

type Screen = "qr-login" | "home" | "subject" | "presentation";

const slideSubtitles = ["Introduction", "Key Concepts", "Implementation", "Examples"];

function SmartboardInterface() {
  const [screen, setScreen] = useState<Screen>("qr-login");
  const [selectedSubject, setSelectedSubject] = useState<SubjectRecord | null>(null);
  const [selectedPresentation, setSelectedPresentation] = useState<PresentationRecord | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isPresenting, setIsPresenting] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    };
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (screen !== "presentation" || !isPresenting) {
      setShowControls(true);
      return;
    }

    let hideTimer = window.setTimeout(() => setShowControls(false), 3000);

    const moveHandler = () => {
      setShowControls(true);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener("mousemove", moveHandler);
    return () => {
      window.clearTimeout(hideTimer);
      window.removeEventListener("mousemove", moveHandler);
    };
  }, [screen, isPresenting, currentSlide]);

  const connectWithoutQr = () => {
    setIsConnecting(true);
    window.setTimeout(() => {
      setIsConnecting(false);
      setScreen("home");
    }, 2000);
  };

  const subjectPresentations = useMemo(() => {
    if (!selectedSubject) {
      return presentations;
    }
    return presentations.filter((item) => item.subject === selectedSubject.code || item.subject === "CS302");
  }, [selectedSubject]);

  const totalSlides = selectedPresentation?.slides ?? 28;
  const slideColor = ["#0f4c81", "#1d4ed8", "#0284c7", "#0e7490"][currentSlide % 4];

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "linear-gradient(135deg,#07132a,#081f3d,#0f2748)" }}>
      <AnimatePresence mode="wait">
        {screen === "qr-login" ? (
          <motion.section
            key="qr-login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex h-full items-center justify-center p-6"
          >
            <div className="absolute -left-28 top-10 h-80 w-80 bg-sky-500/10 blur-3xl" style={{ borderRadius: "999px" }} />
            <div className="absolute right-10 top-20 h-72 w-72 bg-cyan-400/10 blur-3xl" style={{ borderRadius: "999px" }} />

            <div className="w-full max-w-[640px] border border-white/15 bg-white/8 p-7 text-center backdrop-blur" style={{ borderRadius: "24px" }}>
              <div className="mb-5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center bg-cyan-400/20 text-cyan-300" style={{ borderRadius: "14px" }}>
                  <Monitor size={30} />
                </div>
                <h1 className="mt-3 text-4xl font-semibold text-white">EduSlide Pro</h1>
                <p className="text-sm text-slate-300">Smartboard Interface</p>
              </div>

              <h2 className="text-2xl font-semibold text-white">Scan to connect your session</h2>
              <div className="mx-auto mt-4 h-[220px] w-[220px] bg-white p-4" style={{ borderRadius: "18px" }}>
                <svg viewBox="0 0 220 220" className="h-full w-full">
                  <rect width="220" height="220" fill="white" />
                  <rect x="16" y="16" width="48" height="48" fill="#0f172a" />
                  <rect x="26" y="26" width="28" height="28" fill="white" />
                  <rect x="34" y="34" width="12" height="12" fill="#0f172a" />
                  <rect x="156" y="16" width="48" height="48" fill="#0f172a" />
                  <rect x="166" y="26" width="28" height="28" fill="white" />
                  <rect x="174" y="34" width="12" height="12" fill="#0f172a" />
                  <rect x="16" y="156" width="48" height="48" fill="#0f172a" />
                  <rect x="26" y="166" width="28" height="28" fill="white" />
                  <rect x="34" y="174" width="12" height="12" fill="#0f172a" />
                  {Array.from({ length: 100 }).map((_, index) => {
                    const x = (index * 13) % 176 + 22;
                    const y = Math.floor(index * 2.3) % 176 + 22;
                    if ((x < 74 && y < 74) || (x > 146 && y < 74) || (x < 74 && y > 146)) {
                      return null;
                    }
                    return <rect key={`module-${index}`} x={x} y={y} width="5" height="5" fill="#111827" />;
                  })}
                  <rect x="86" y="86" width="48" height="48" fill="#0f172a" rx="12" />
                </svg>
              </div>
              <p className="mt-3 text-sm text-slate-300">Room ID: <span className="font-semibold text-cyan-300">ROOM-304-A</span></p>
              <p className="mt-2 text-sm text-slate-400">Open EduSlide Pro on your device and scan.</p>

              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white"
                style={{ borderRadius: "12px", background: "linear-gradient(90deg,#0f4c81,#00b4d8)", boxShadow: "0 4px 20px rgba(15,76,129,0.3)" }}
                onClick={connectWithoutQr}
              >
                {isConnecting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/40 border-t-white" style={{ borderRadius: "999px", animation: "spin 1s linear infinite" }} />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wifi size={15} />
                    Connect Without QR
                  </>
                )}
              </button>
              <p className="mt-6 text-xs text-slate-400">EduSlide Pro · Smartboard v2.1 · Room 304</p>
            </div>
          </motion.section>
        ) : null}

        {screen === "home" ? (
          <motion.section key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <Monitor size={26} />
                <div>
                  <p className="text-xl font-semibold">EduSlide Pro</p>
                  <p className="text-xs text-slate-300">Smartboard Interface · Room 304-A</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 bg-green-500/20 px-3 py-1 text-xs text-green-300" style={{ borderRadius: "999px" }}>
                  <Wifi size={12} />
                  Connected
                </span>
                <span className="font-mono text-2xl text-white">{currentTime}</span>
                <button type="button" className="inline-flex items-center gap-2 bg-red-500/20 px-3 py-1 text-xs text-red-200" style={{ borderRadius: "999px" }} onClick={() => setScreen("qr-login")}>
                  <LogOut size={12} />
                  Exit
                </button>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-6 text-white">
              <h2 className="text-4xl font-semibold">Select a Subject</h2>
              <p className="mt-1 text-slate-300">Computer Science Engineering · Semester 6</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    type="button"
                    className="border border-white/10 bg-white/6 p-4 text-left"
                    style={{ borderRadius: "16px", transition: "all 0.2s ease" }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform = "scale(1.02)";
                      event.currentTarget.style.borderColor = `${subject.color}99`;
                      event.currentTarget.style.background = `${subject.color}1f`;
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "scale(1)";
                      event.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      event.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    }}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setScreen("subject");
                    }}
                  >
                    <div className="flex h-16 w-16 items-center justify-center" style={{ borderRadius: "14px", background: `${subject.color}28`, color: subject.color }}>
                      <BookOpen size={30} />
                    </div>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.15em]" style={{ color: subject.color }}>{subject.code}</p>
                    <h3 className="mt-1 text-2xl font-semibold text-white">{subject.name}</h3>
                    <p className="text-sm text-slate-300">{subject.faculty}</p>
                    <p className="mt-2 flex items-center gap-1 text-sm text-slate-300"><Layers size={14} />{subject.pptCount} Presentations</p>
                  </button>
                ))}
              </div>
            </main>
          </motion.section>
        ) : null}
        {screen === "subject" ? (
          <motion.section key="subject" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col text-white">
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <button type="button" className="inline-flex items-center gap-2 text-sm text-slate-300" onClick={() => setScreen("home")}>
                <ChevronLeft size={16} />
                Back
              </button>
              <div>
                <p className="text-xs text-slate-400">{selectedSubject?.code}</p>
                <p className="text-xl font-semibold">{selectedSubject?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 bg-green-500/20 px-3 py-1 text-xs text-green-300" style={{ borderRadius: "999px" }}>
                  <Wifi size={12} />
                  Room 304-A
                </span>
                <span className="font-mono text-xl">{currentTime}</span>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-6">
              <h2 className="text-3xl font-semibold">Available Presentations</h2>
              <p className="text-sm text-slate-300">{selectedSubject?.faculty} · {subjectPresentations.length} files</p>
              <div className="mt-5 space-y-3">
                {subjectPresentations.map((presentation) => (
                  <button
                    key={presentation.id}
                    type="button"
                    className="flex w-full items-center justify-between border border-white/10 bg-white/6 p-4 text-left"
                    style={{ borderRadius: "14px", transition: "all 0.2s ease" }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform = "translateX(8px)";
                      event.currentTarget.style.borderColor = `${selectedSubject?.color ?? "#00b4d8"}88`;
                      event.currentTarget.style.background = `${selectedSubject?.color ?? "#00b4d8"}22`;
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "translateX(0)";
                      event.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      event.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    }}
                    onClick={() => {
                      setSelectedPresentation(presentation);
                      setCurrentSlide(1);
                      setIsPresenting(true);
                      setShowControls(true);
                      setScreen("presentation");
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center" style={{ borderRadius: "14px", background: `${selectedSubject?.color ?? "#00b4d8"}26`, color: selectedSubject?.color ?? "#00b4d8" }}>
                        <Monitor size={30} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-white">{presentation.title}</h3>
                        <p className="text-sm text-slate-300">{presentation.uploadedBy} · {presentation.slides} slides</p>
                      </div>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center text-white" style={{ borderRadius: "999px", background: "linear-gradient(90deg,#0f4c81,#00b4d8)", boxShadow: "0 0 30px rgba(15,76,129,0.45)" }}>
                      <Play size={24} fill="currentColor" />
                    </div>
                  </button>
                ))}
              </div>
            </main>
          </motion.section>
        ) : null}

        {screen === "presentation" ? (
          <motion.section key="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex h-full flex-col text-white" onMouseMove={() => setShowControls(true)}>
            <div className="flex-1 p-6">
              <div className="relative mx-auto flex h-full max-h-[760px] max-w-[1200px] items-center justify-center overflow-hidden" style={{ borderRadius: "18px", background: `linear-gradient(135deg, ${slideColor}, #0b2444)` }}>
                <div className="absolute -left-16 -top-20 h-72 w-72 bg-white/12" style={{ borderRadius: "999px" }} />
                <div className="absolute bottom-[-140px] right-[-80px] h-80 w-80 bg-white/10" style={{ borderRadius: "999px" }} />

                <div className="relative z-10 px-8 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">Slide {currentSlide} of {totalSlides}</p>
                  <h2 className="mt-2 text-5xl font-semibold text-white" style={{ textShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>{selectedPresentation?.title}</h2>
                  <p className="mt-2 text-xl text-white/85">{slideSubtitles[currentSlide % slideSubtitles.length]}</p>
                </div>

                <div className="absolute bottom-5 left-6 text-sm text-white/70">EduSlide Pro College</div>
                <div className="absolute bottom-5 right-6 text-sm text-white/70">CS Department · 2025-26</div>
              </div>
            </div>

            <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2">
              <span className="bg-slate-900/60 px-3 py-1 text-xs text-slate-200 backdrop-blur" style={{ borderRadius: "999px" }}>Slide {currentSlide} / {totalSlides}</span>
            </div>

            <div
              className="border-t border-white/10 bg-slate-900/65 px-5 py-3 backdrop-blur"
              style={{
                opacity: showControls ? 1 : 0,
                transform: showControls ? "translateY(0)" : "translateY(100%)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => setScreen("subject")}>
                    <ChevronLeft size={14} />
                    Back
                  </button>
                  <div>
                    <p className="font-medium text-white">{selectedPresentation?.title}</p>
                    <p className="text-xs text-slate-400">{selectedPresentation?.uploadedBy}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setCurrentSlide(1)}><SkipBack size={17} /></button>
                  <button type="button" disabled={currentSlide <= 1} onClick={() => setCurrentSlide((current) => Math.max(1, current - 1))}><ChevronLeft size={18} /></button>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center text-white"
                    style={{ borderRadius: "999px", background: isPresenting ? "linear-gradient(90deg,#0f4c81,#00b4d8)" : "#7f1d1d" }}
                    onClick={() => setIsPresenting((current) => !current)}
                  >
                    {isPresenting ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button type="button" disabled={currentSlide >= totalSlides} onClick={() => setCurrentSlide((current) => Math.min(totalSlides, current + 1))}><ChevronLeft size={18} className="rotate-180" /></button>
                  <button type="button" onClick={() => setCurrentSlide(totalSlides)}><SkipForward size={17} /></button>
                </div>

                <div className="flex items-center gap-3">
                  <button type="button"><Volume2 size={16} /></button>
                  <button type="button"><Settings size={16} /></button>
                  <button type="button" className="bg-red-500/20 px-3 py-1 text-xs text-red-200" style={{ borderRadius: "999px" }} onClick={() => setScreen("home")}>Exit</button>
                </div>
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default SmartboardInterface;
