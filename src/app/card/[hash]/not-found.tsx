import Link from "next/link";
import { IdCard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-bg-page flex flex-col items-center justify-center p-6 text-primary-text font-sans text-center">
      <IdCard className="text-primary text-5xl mb-4 animate-pulse" />
      <h1 className="text-2xl font-extrabold tracking-tight mb-2">Card Not Found</h1>
      <p className="text-sm text-secondary-text max-w-sm mb-6 leading-relaxed">
        The digital business card you are trying to view does not exist or has been removed by the owner.
      </p>
      <Link
        href="/"
        className="bg-primary hover:bg-primary-hover text-primary-btn-text rounded-xl px-6 py-3 text-sm font-bold shadow-md hover:shadow-primary/20 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-primary"
      >
        Create Your Own Card
      </Link>
    </div>
  );
}
