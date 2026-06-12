import React, { useState } from "react";
import { Zap, ShieldAlert, Radio, Volume2, Link, Music, CheckCircle } from "lucide-react";
import { playClickBeep, playCompileBeep, playSuccessSweep, playErrorAlert } from "../utils/audio";

export default function BypassControls() {
  const [guardBypassed, setGuardBypassed] = useState(true);
  const [unfilteredMode, setUnfilteredMode] = useState(true);
  const [cyberAudio, setCyberAudio] = useState(true);

  const triggerSound = (type: string) => {
    if (!cyberAudio) return;
    if (type === "click") playClickBeep();
    if (type === "compile") playCompileBeep();
    if (type === "success") playSuccessSweep();
    if (type === "error") playErrorAlert();
  };

  return (
    <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-4 space-y-4">
      {/* Hacker Profile & Credentials Section */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono">
            CORE CONTROLLER
          </span>
        </div>
        <span className="text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full uppercase">
          DEVELOPER: @REHAN_BHAI
        </span>
      </div>

      {/* Grid of Security overrides */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <label className="flex flex-col p-3 rounded-xl bg-slate-900 border border-white/5 hover:border-red-500/30 cursor-pointer transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Bypass Guard
            </span>
            <input
              type="checkbox"
              checked={guardBypassed}
              onChange={() => {
                setGuardBypassed(!guardBypassed);
                triggerSound("click");
              }}
              className="accent-red-500 cursor-pointer"
            />
          </div>
          <p className="text-[9px] text-slate-500 font-medium leading-normal">
            Bypasses structural and safety restrictions permanently.
          </p>
        </label>

        <label className="flex flex-col p-3 rounded-xl bg-slate-900 border border-white/5 hover:border-pink-500/30 cursor-pointer transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-pink-400" /> Unfiltered Mode
            </span>
            <input
              type="checkbox"
              checked={unfilteredMode}
              onChange={() => {
                setUnfilteredMode(!unfilteredMode);
                triggerSound("click");
              }}
              className="accent-pink-500 cursor-pointer"
            />
          </div>
          <p className="text-[9px] text-slate-500 font-medium leading-normal">
            Force standard Hindi/English raw responses.
          </p>
        </label>
      </div>

      {/* Cyber Sound board testing panel */}
      <div className="bg-[#090b14] border border-white/5 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> CYBER AUDIO SYNTHESIZER
          </span>
          <button
            onClick={() => setCyberAudio(!cyberAudio)}
            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border transition-all ${
              cyberAudio
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                : "bg-slate-900 text-slate-500 border-white/5"
            }`}
          >
            {cyberAudio ? "Active" : "Muted"}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-[10px]">
          <button
            onClick={() => triggerSound("click")}
            className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono border border-white/5 hover:border-slate-700 transition"
          >
            Click
          </button>
          <button
            onClick={() => triggerSound("compile")}
            className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono border border-white/5 hover:border-slate-700 transition"
          >
            Comp
          </button>
          <button
            onClick={() => triggerSound("success")}
            className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono border border-white/5 hover:border-slate-700 transition"
          >
            Sweep
          </button>
          <button
            onClick={() => triggerSound("error")}
            className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono border border-white/5 hover:border-slate-700 transition"
          >
            Error
          </button>
        </div>
      </div>

      {/* Telegram creator credits links page wrapper card */}
      <div className="bg-[#0c1221] p-3 rounded-xl border border-blue-500/10 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
          <div>
            <p className="font-semibold text-[11px]">Join @REHAN_BHAI Official</p>
            <p className="text-[9px] text-slate-500 font-mono">Updates & Premium AI Models</p>
          </div>
        </div>
        <a
          href="https://t.me/REHAN_BHAI"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-sky-500 hover:bg-sky-400 text-white font-semibold text-[10px] px-2.5 py-1 rounded-lg transition shadow-md shadow-sky-500/10 flex items-center gap-1 shrink-0"
        >
          <Link className="w-3 h-3" />
          <span>Telegram</span>
        </a>
      </div>
    </div>
  );
}
