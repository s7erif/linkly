export function DesktopOuterChrome() {
  return (
    <div 
      className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 border-b border-black/5 z-30" 
      style={{ 
        height: 42,
        background: "linear-gradient(to bottom, #ffffff 0%, #f9f9fb 100%)",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
      }}
    >
      {/* macOS Traffic Lights */}
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner shadow-black/10" />
        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner shadow-black/10" />
        <div className="w-3 h-3 rounded-full bg-[#28CA41] shadow-inner shadow-black/10" />
      </div>
      
      {/* URL Bar */}
      <div className="flex-1 max-w-[280px] h-7 rounded-md bg-black/[0.03] shadow-inner shadow-black/5 flex items-center justify-center border border-black/[0.03]">
        <span className="text-[11px] font-medium tracking-wide text-black/40">link.ly/@username</span>
      </div>
      
      {/* Spacer to balance traffic lights */}
      <div className="w-[52px]" />
    </div>
  );
}
