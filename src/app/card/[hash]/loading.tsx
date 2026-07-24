export default function Loading() {
  return (
    <div className="min-h-dvh w-full bg-bg-page flex flex-col items-center pt-10 pb-24 px-6 animate-pulse">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        {/* Avatar skeleton */}
        <div className="w-32 h-32 rounded-full bg-bg-elevated border-4 border-bg-card mb-6" />

        {/* Name skeleton */}
        <div className="h-8 bg-bg-elevated rounded-lg w-48 mb-3" />
        
        {/* Title skeleton */}
        <div className="h-4 bg-bg-elevated rounded w-32 mb-8" />

        {/* Contact actions skeleton */}
        <div className="w-full flex flex-col gap-3 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-full h-[76px] rounded-2xl bg-bg-elevated" />
          ))}
        </div>

        {/* Social grid skeleton */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-12 h-12 rounded-2xl bg-bg-elevated" />
          ))}
        </div>

        {/* About skeleton */}
        <div className="w-full h-32 rounded-2xl bg-bg-elevated" />
      </div>

      {/* Action Bar skeleton */}
      <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center pointer-events-none">
        <div className="w-full max-w-sm h-[72px] rounded-3xl bg-bg-elevated border border-divider shadow-2xl" />
      </div>
    </div>
  );
}
