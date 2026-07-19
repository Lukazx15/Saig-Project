interface PinIconProps {
  className?: string
  color?: string
}

/** A small pushpin glyph used to "pin" post-it notes to the board. */
export function PinIcon({ className, color = '#c0392b' }: PinIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="9" r="6.5" fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
      <circle cx="10" cy="7" r="1.8" fill="rgba(255,255,255,0.55)" />
      <path d="M12 15.2 L13.6 22.5 L12 21.3 L10.4 22.5 Z" fill="#5b5b5b" />
    </svg>
  )
}
