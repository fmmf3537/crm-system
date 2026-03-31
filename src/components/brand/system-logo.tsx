import { cn } from "@/lib/utils"

type Props = {
  className?: string
  size?: number
}

/**
 * 辰航卓越 — 抽象标识：星轨与向上弧线，寓意导航、卓越与上升。
 */
export function SystemLogo({ className, size = 40 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient
          id="chenhang-logo-grad"
          x1="6"
          y1="42"
          x2="42"
          y2="8"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="oklch(0.35 0.12 260)" />
          <stop offset="0.5" stopColor="oklch(0.45 0.14 230)" />
          <stop offset="1" stopColor="oklch(0.55 0.16 200)" />
        </linearGradient>
        <linearGradient
          id="chenhang-logo-star"
          x1="22"
          y1="12"
          x2="34"
          y2="18"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="oklch(0.72 0.14 85)" />
          <stop offset="1" stopColor="oklch(0.82 0.12 70)" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" stroke="url(#chenhang-logo-grad)" strokeWidth="2" fill="oklch(0.98 0.01 260 / 0.4)" />
      <path
        d="M10 32c6-10 14-14 24-16"
        stroke="url(#chenhang-logo-grad)"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M14 36c7-6 15-9 24-10"
        stroke="url(#chenhang-logo-grad)"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity={0.65}
      />
      <path
        d="M28.5 8.5l1.2 3.8h3.9l-3.1 2.3 1.2 3.8-3.2-2.3-3.2 2.3 1.2-3.8-3.1-2.3h3.9z"
        fill="url(#chenhang-logo-star)"
      />
    </svg>
  )
}
