"use client";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  fontSize?: "sm" | "md" | "lg";
}

const FONT_SIZE_MAP = {
  sm: { text: "11px", lineH: "20px" },
  md: { text: "13px", lineH: "24px" },
  lg: { text: "15px", lineH: "28px" },
};

export function CodeEditor({ code, onChange, fontSize = "md" }: CodeEditorProps) {
  const lines = code.split("\n");
  const { text, lineH } = FONT_SIZE_MAP[fontSize];

  return (
    <section className="w-3/5 flex flex-col bg-surface-container-lowest border-r border-outline-variant">
      {/* Tab bar */}
      <div className="flex items-center justify-between h-8 bg-surface-container px-3 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">description</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant">MAIN.S</span>
        </div>
        <span className="font-code-sm text-[10px] text-outline">{lines.length} lines</span>
      </div>

      {/* Editor body */}
      <div
        className="flex-1 overflow-hidden flex bg-surface-bright relative"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: text }}
      >
        {/* Line numbers */}
        <div
          className="w-12 bg-surface-container-low text-right pr-3 py-4 text-outline select-none border-r border-outline-variant overflow-hidden flex-shrink-0"
          style={{ lineHeight: lineH }}
          aria-hidden="true"
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 py-4 px-4 bg-transparent resize-none outline-none text-primary w-full"
          style={{ lineHeight: lineH, fontSize: text }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          wrap="off"
          aria-label="RISC-V assembler code editor"
        />
      </div>
    </section>
  );
}
