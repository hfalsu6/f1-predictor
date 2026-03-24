import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "red" | "orange" | "green" | "ghost";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase font-mono",
        variant === "default" && "bg-white/8 text-white/60 border border-white/10",
        variant === "red"     && "bg-[#e8002d]/15 text-[#e8002d] border border-[#e8002d]/25",
        variant === "orange"  && "bg-[#ff8000]/15 text-[#ff8000] border border-[#ff8000]/25",
        variant === "green"   && "bg-[#39d353]/15 text-[#39d353] border border-[#39d353]/25",
        variant === "ghost"   && "bg-transparent text-white/40",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-[#0f0f11]",
        "border-white/[0.06]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded bg-gradient-to-r from-white/4 via-white/8 to-white/4 bg-[length:200%_100%]",
        "animate-[shimmer_1.5s_ease-in-out_infinite]",
        className
      )}
    />
  );
}

export function Button({
  children,
  className,
  variant = "default",
  size = "md",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-150",
        "focus:outline-none focus-visible:ring-1 focus-visible:ring-[#e8002d]/60 disabled:opacity-40",
        variant === "default" &&
          "bg-[#e8002d] text-white hover:bg-[#c8001f] active:scale-[0.98] shadow-[0_0_20px_rgba(232,0,45,0.25)]",
        variant === "ghost" &&
          "bg-transparent text-white/50 hover:text-white hover:bg-white/6",
        variant === "outline" &&
          "border border-white/10 bg-transparent text-white/70 hover:border-white/20 hover:bg-white/5",
        variant === "danger" &&
          "bg-[#e8002d]/10 text-[#e8002d] border border-[#e8002d]/20 hover:bg-[#e8002d]/20",
        size === "sm" && "px-3 py-1.5 text-xs rounded gap-1.5",
        size === "md" && "px-4 py-2 text-sm rounded-md gap-2",
        size === "lg" && "px-6 py-3 text-base rounded-lg gap-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
