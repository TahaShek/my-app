interface VintageStampProps {
  text: string
  rotation?: number
  variant?: "available" | "pending" | "completed" | "good-condition"
}

export function VintageStamp({ text, rotation = 0, variant = "available" }: VintageStampProps) {
  const colors = {
    available: "border-[#B23A48] bg-[#B23A48]/20 text-[#B23A48]",
    pending: "border-[#D4A028] bg-[#D4A028]/20 text-[#D4A028]",
    completed: "border-[#9CAF88] bg-[#9CAF88]/20 text-[#9CAF88]",
    "good-condition": "border-[#C65D3B] bg-[#C65D3B]/20 text-[#C65D3B]",
  }

  return (
    <div
      className={`stamp-border ${colors[variant]} px-3 py-1.5 inline-block font-mono text-xs font-bold tracking-wider`}
      style={{
        transform: `rotate(${rotation}deg)`,
        boxShadow: `inset -2px -2px 0 rgba(0,0,0,0.1)`,
      }}
    >
      {text}
    </div>
  )
}
