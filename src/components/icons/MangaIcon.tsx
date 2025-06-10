interface MangaIconProps {
  className?: string;
  size?: number;
}

export default function MangaIcon({ className = "", size = 24 }: MangaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="spineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Main Book Cover */}
      <rect
        x="6"
        y="4"
        width="20"
        height="24"
        rx="2"
        fill="url(#bookGradient)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />

      {/* Book Spine with gradient */}
      <rect
        x="6"
        y="4"
        width="3"
        height="24"
        rx="2"
        fill="url(#spineGradient)"
      />

      {/* Manga Panel Frames */}
      <rect
        x="11"
        y="8"
        width="12"
        height="6"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <rect
        x="11"
        y="16"
        width="5.5"
        height="4"
        rx="0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <rect
        x="17.5"
        y="16"
        width="5.5"
        height="4"
        rx="0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.5"
      />

      {/* Manga Character Elements */}
      {/* Eyes */}
      <circle cx="15" cy="11" r="1" fill="currentColor" fillOpacity="0.6" />
      <circle cx="19" cy="11" r="1" fill="currentColor" fillOpacity="0.6" />

      {/* Speech Bubble */}
      <ellipse
        cx="14"
        cy="18"
        rx="2"
        ry="1.5"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <path
        d="M13 19 L12.5 20 L14 19.5 Z"
        fill="currentColor"
        fillOpacity="0.3"
      />

      {/* Action Lines */}
      <path
        d="M19 17.5 L21 16.5 M20 19 L22 18.5 M19.5 20.5 L21.5 20"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.4"
      />

      {/* Page Corner Fold */}
      <path
        d="M24 6 L22 4 L24 4 Z"
        fill="currentColor"
        fillOpacity="0.3"
      />

      {/* Decorative Stars */}
      <path
        d="M21 9 L21.5 10 L22.5 10 L21.7 10.7 L22 11.5 L21 11 L20 11.5 L20.3 10.7 L19.5 10 L20.5 10 Z"
        fill="currentColor"
        fillOpacity="0.4"
        transform="scale(0.4) translate(30, 5)"
      />
    </svg>
  );
}
