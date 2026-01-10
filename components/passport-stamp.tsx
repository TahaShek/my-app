interface PassportStampProps {
  text: string
  city?: string
  date?: string
  variant?: "circular" | "rectangular" | "diagonal"
  rotation?: number
}

export function PassportStamp({ text, city, date, variant = "circular", rotation = 0 }: PassportStampProps) {
  if (variant === "circular") {
    return (
      <div
        className="inline-flex items-center justify-center visa-stamp-circular bg-transparent relative"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="text-center font-mono uppercase text-[#1A1613]">
          <div className="text-[9px] font-bold leading-tight">{city || text}</div>
          {date && <div className="text-[7px] mt-0.5">{date}</div>}
        </div>
      </div>
    )
  }

  if (variant === "rectangular") {
    return (
      <div
        className="inline-block border-2 border-[#1B3A57] px-3 py-1.5 bg-[#F4ECD8]/50"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="text-center font-mono text-[9px] font-bold uppercase tracking-wide text-[#1B3A57] leading-tight">
          {text}
          {city && <div className="text-[8px] mt-0.5">{city}</div>}
          {date && <div className="text-[7px] text-[#1A1613]/60">{date}</div>}
        </div>
      </div>
    )
  }

  // diagonal customs stamp
  return (
    <div
      className="inline-block customs-stamp-diagonal stamp-ink-smudge bg-transparent"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {text}
    </div>
  )
}
