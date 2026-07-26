export function PhoneOuterChrome() {
  return (
    <>
      {/* Subtle Metallic Chassis Highlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: 48,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.04) 100%)",
        }}
      />

      {/* Hardware side button accents */}
      <div className="absolute -left-[2px] top-28 w-[2px] h-7 bg-[#3a3a40] rounded-l-xs shadow-xs" />
      <div className="absolute -left-[2px] top-40 w-[2px] h-7 bg-[#3a3a40] rounded-l-xs shadow-xs" />
      <div className="absolute -right-[2px] top-32 w-[2px] h-11 bg-[#3a3a40] rounded-r-xs shadow-xs" />
    </>
  );
}

export function PhoneInnerChrome() {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none select-none">
      {/* Status Bar Header */}
      <div className="flex justify-between items-center px-7 pt-3 text-[12px] font-semibold tracking-tight text-white/90 drop-shadow-xs">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 opacity-90">
          {/* Signal */}
          <svg width="14" height="11" viewBox="0 0 18 12" fill="currentColor">
            <path d="M1 11h2.5V9H1v2zm4 0h2.5V6.5H5V11zm4 0h2.5V4H9v7zm4 0h2.5V1.5H13V11z" />
          </svg>
          {/* Wifi */}
          <svg width="14" height="11" viewBox="0 0 16 12" fill="currentColor">
            <path d="M8 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-3.8-3.2l1.1 1.1C6.2 9.1 7.1 8.7 8 8.7s1.8.4 2.7 1.2l1.1-1.1C10.6 7.6 9.3 7.1 8 7.1s-2.6.5-3.8 1.7zm-2.8-2.8l1.1 1.1C4.1 5.5 6 4.7 8 4.7s3.9.8 5.5 2.4l1.1-1.1C12.8 4.2 10.5 3.3 8 3.3S3.2 4.2 1.4 6z" />
          </svg>
          {/* Battery */}
          <div className="w-5 h-2.5 rounded-[3px] border border-current p-[1px] flex items-center">
            <div className="h-full w-[75%] bg-current rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Proportional Dynamic Island Pill */}
      <div
        className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center justify-between px-2.5"
        style={{
          width: 90,
          height: 24,
          backgroundColor: "#000000",
          borderRadius: 14,
          boxShadow:
            "0 0 0 1px rgba(255, 255, 255, 0.06), 0 2px 8px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Camera Lens */}
        <div className="w-2.5 h-2.5 rounded-full bg-[#111111] shadow-inner shadow-white/10" />
        {/* Sensor */}
        <div className="w-1.5 h-1.5 rounded-full bg-[#111111] shadow-inner shadow-white/5 opacity-80" />
      </div>
    </div>
  );
}
