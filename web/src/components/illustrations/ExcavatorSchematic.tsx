const label = "fill-ink-medium font-mono text-[10px]";
const line = "fill-none stroke-ink";

/** Line drawing of a hydraulic excavator, side elevation. Schematic, not to scale; symbols only (no invented specs). */
export function ExcavatorSchematic() {
  return (
    <svg viewBox="0 0 640 330" role="img" aria-labelledby="exc-t exc-d" className="h-auto w-full text-ink">
      <title id="exc-t">Excavator schematic, side elevation</title>
      <desc id="exc-d">Line drawing of a crawler excavator with labelled undercarriage, house, cab, counterweight, boom, arm and bucket. Maximum reach R max and operating weight W op are shown symbolically.</desc>
      {/* ground */}
      <line x1="40" y1="272" x2="600" y2="272" className="stroke-ink" strokeWidth="1.5" />
      {/* undercarriage: track frame, sprocket, idler, rollers */}
      <rect x="110" y="236" width="270" height="36" className={line} strokeWidth="1" />
      <circle cx="132" cy="254" r="17" className={line} strokeWidth="1" />
      <circle cx="132" cy="254" r="6" className={line} strokeWidth="1" />
      <circle cx="358" cy="254" r="17" className={line} strokeWidth="1" />
      <circle cx="358" cy="254" r="6" className={line} strokeWidth="1" />
      {[180, 220, 260, 300].map((x) => (
        <circle key={x} cx={x} cy="259" r="7" className={line} strokeWidth="1" />
      ))}
      {/* slew ring */}
      <rect x="150" y="226" width="190" height="10" className={line} strokeWidth="1" />
      {/* upper house + counterweight */}
      <polygon points="130,226 130,176 175,168 330,168 352,196 352,226" className={line} strokeWidth="1" />
      <rect x="112" y="178" width="22" height="48" className={line} strokeWidth="1" />
      {/* cab */}
      <polygon points="232,168 232,120 296,120 312,168" className={line} strokeWidth="1" />
      <polygon points="242,160 242,130 288,130 300,160" className={line} strokeWidth="0.5" />
      {/* boom */}
      <polygon points="302,178 428,82 446,98 322,196" className={line} strokeWidth="1" />
      {/* arm */}
      <polygon points="420,92 438,80 532,206 514,220" className={line} strokeWidth="1" />
      {/* bucket */}
      <polygon points="508,214 544,198 572,240 534,264 498,246" className={line} strokeWidth="1" />
      {/* hydraulic cylinders */}
      <line x1="318" y1="186" x2="396" y2="104" className={line} strokeWidth="1.5" />
      <line x1="440" y1="104" x2="500" y2="190" className={line} strokeWidth="1.5" />
      <line x1="500" y1="196" x2="530" y2="222" className={line} strokeWidth="1.5" />
      {/* pivots */}
      {[[312, 187], [437, 90], [521, 213]].map(([x, y]) => (
        <circle key={`${x}`} cx={x} cy={y} r="4" className="fill-paper stroke-ink" strokeWidth="1" />
      ))}
      {/* leaders + labels */}
      <g className="stroke-ink-faint" strokeWidth="0.5">
        <line x1="240" y1="120" x2="240" y2="70" /><line x1="150" y1="200" x2="60" y2="140" />
        <line x1="236" y1="236" x2="236" y2="300" /><line x1="380" y1="140" x2="380" y2="60" />
        <line x1="480" y1="150" x2="520" y2="60" /><line x1="566" y1="240" x2="606" y2="300" />
      </g>
      <text x="224" y="64" className={label}>CAB</text>
      <text x="22" y="134" className={label}>COUNTERWEIGHT</text>
      <text x="196" y="314" className={label}>UNDERCARRIAGE</text>
      <text x="364" y="54" className={label}>BOOM</text>
      <text x="508" y="54" className={label}>ARM</text>
      <text x="566" y="314" className={label}>BUCKET</text>
      {/* dimension: maximum reach */}
      <g className="stroke-crimson" strokeWidth="0.75" strokeDasharray="3 2">
        <line x1="236" y1="288" x2="574" y2="288" />
      </g>
      <g className="stroke-crimson" strokeWidth="0.75">
        <line x1="236" y1="283" x2="236" y2="293" /><line x1="574" y1="283" x2="574" y2="293" />
      </g>
      <text x="360" y="284" className="fill-crimson font-mono text-[10px]">R_max</text>
      <text x="40" y="24" className={label}>W_op = operating weight · V_b = bucket capacity · symbols only, values in Table 1</text>
    </svg>
  );
}
