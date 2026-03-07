import { useState } from "react";
import GlassCard from "../components/GlassCard";

function buildOfficeViewerUrl(fileUrl) {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
}

export default function SmartboardViewPage() {
  const [fileUrl, setFileUrl] = useState("");

  const enterFullscreen = async () => {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  };

  return (
    <div className="h-full">
      <GlassCard className="flex h-full flex-col">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            className="min-w-[280px] flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-300 focus:border-brand-300"
            placeholder="Paste PPT public URL"
            value={fileUrl}
            onChange={(event) => setFileUrl(event.target.value)}
          />
          <button
            type="button"
            onClick={enterFullscreen}
            className="rounded-xl bg-gradient-to-r from-violetBrand-500 to-brand-500 px-4 py-3 text-sm font-semibold text-white"
          >
            Full Screen
          </button>
        </div>

        {fileUrl ? (
          <iframe
            title="Smartboard Presentation"
            src={buildOfficeViewerUrl(fileUrl)}
            className="h-[75vh] w-full rounded-xl border border-white/20 bg-white"
            allowFullScreen
          />
        ) : (
          <div className="flex h-[75vh] items-center justify-center rounded-xl border border-dashed border-white/25">
            <p className="text-sm text-soft">
              Smartboard role is view-only. Enter PPT URL to begin presentation.
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
