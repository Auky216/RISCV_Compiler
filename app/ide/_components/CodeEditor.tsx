"use client";

import React, { useRef } from "react";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  fontSize?: "sm" | "md" | "lg";
  isBinaryMode?: boolean;
  currentLine?: number;
}

const FONT_SIZE_MAP = {
  sm: { text: "11px", lineH: "20px" },
  md: { text: "13px", lineH: "24px" },
  lg: { text: "15px", lineH: "28px" },
};

function HighlightedCodePart({ text }: { text: string }) {
  // Dividir manteniendo los delimitadores
  const tokens = text.split(/([ \t,()]+)/);
  
  return (
    <>
      {tokens.map((token, i) => {
        if (/^[ \t,()]+$/.test(token)) {
          return <span key={i}>{token}</span>;
        }
        
        const lower = token.toLowerCase();
        
        const instructions = ["add", "addi", "sub", "and", "or", "xor", "slt", "sll", "srl", "lw", "sw", "sb", "sh", "beq", "bne", "jal", "jalr"];
        if (instructions.includes(lower)) {
          return <span key={i} className="text-[#0000ff] font-semibold">{token}</span>; // Azul VS Code Light
        }
        
        if (/^(x[0-9]{1,2}|zero|ra|sp|gp|tp|fp|a[0-7]|t[0-6]|s[0-9]{1,2})$/.test(lower)) {
          return <span key={i} className="text-[#001080]">{token}</span>; // Azul Oscuro VS Code Light
        }
        
        if (/^-?(0x[0-9a-f]+|[0-9]+)$/.test(lower)) {
          return <span key={i} className="text-[#098658]">{token}</span>; // Verde VS Code Light
        }
        
        if (lower.endsWith(":")) {
          return <span key={i} className="text-[#795e26]">{token}</span>; // Naranja/Marrón VS Code Light
        }
        
        return <span key={i} className="text-on-surface">{token}</span>;
      })}
    </>
  );
}

function SyntaxHighlightedLine({ line }: { line: string }) {
  const commentIdx1 = line.indexOf("#");
  const commentIdx2 = line.indexOf("//");
  let commentIdx = -1;
  if (commentIdx1 !== -1 && commentIdx2 !== -1) commentIdx = Math.min(commentIdx1, commentIdx2);
  else if (commentIdx1 !== -1) commentIdx = commentIdx1;
  else if (commentIdx2 !== -1) commentIdx = commentIdx2;

  if (commentIdx !== -1) {
    const codePart = line.substring(0, commentIdx);
    const commentPart = line.substring(commentIdx);
    return (
      <>
        {codePart ? <HighlightedCodePart text={codePart} /> : null}
        <span className="text-tertiary italic">{commentPart}</span>
      </>
    );
  }

  return <HighlightedCodePart text={line} />;
}

export function CodeEditor({ code, onChange, fontSize = "md", isBinaryMode = false, currentLine }: CodeEditorProps) {
  const lines = code.split("\n");
  const { text, lineH } = FONT_SIZE_MAP[fontSize];
  const syntaxRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const tabStr = "  ";
      const newCode = code.substring(0, start) + tabStr + code.substring(end);
      onChange(newCode);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + tabStr.length;
      }, 0);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (syntaxRef.current) {
      syntaxRef.current.scrollTop = e.currentTarget.scrollTop;
      syntaxRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

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
        className="flex-1 overflow-hidden flex bg-surface-bright relative text-on-surface"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: text }}
      >
        {/* Line numbers */}
        <div
          className="w-12 bg-surface-container-low text-right py-4 text-outline select-none border-r border-outline-variant overflow-hidden flex-shrink-0 relative z-10"
          style={{ lineHeight: lineH }}
          aria-hidden="true"
        >
          {lines.map((_, i) => {
            const isCurrent = currentLine === i + 1;
            return (
              <div 
                key={i} 
                className={`flex justify-end items-center px-2 ${isCurrent ? "bg-primary/20 text-primary font-bold shadow-[inset_2px_0_0_0_rgba(var(--color-primary),1)]" : "pr-3"}`}
                style={{ height: lineH }}
              >
                {isCurrent && <span className="text-[10px] mr-1">►</span>}
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* Textarea Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {/* Highlight Background for executing line */}
          {!isBinaryMode && currentLine && currentLine > 0 && currentLine <= lines.length && (
            <div 
              className="absolute left-0 right-0 bg-primary/10 pointer-events-none transition-all duration-200 ease-out z-0"
              style={{
                top: `calc(1rem + ${(currentLine - 1)} * ${lineH})`,
                height: lineH,
              }}
            />
          )}

        {isBinaryMode ? (
          <div className="flex-1 py-8 px-4 flex flex-col items-center justify-center text-on-surface-variant opacity-70">
            <span className="material-symbols-outlined text-4xl mb-4">memory</span>
            <p className="font-body-md text-center max-w-xs">
              Archivo binario cargado en memoria.
              <br/>
              <span className="text-xs mt-2 block">Haz clic en Reset para volver al editor de texto.</span>
            </p>
          </div>
        ) : (
          <div className="flex-1 relative w-full h-full">
            {/* Syntax Highlighter Overlay */}
            <pre
              aria-hidden="true"
              ref={syntaxRef}
              className="absolute inset-0 m-0 py-4 px-4 bg-transparent text-transparent w-full h-full overflow-hidden whitespace-pre pointer-events-none z-0"
              style={{ lineHeight: lineH, fontSize: text }}
            >
              {lines.map((line, i) => (
                <React.Fragment key={i}>
                  <SyntaxHighlightedLine line={line} />
                  {i < lines.length - 1 ? "\n" : ""}
                </React.Fragment>
              ))}
            </pre>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => onChange(e.target.value)}
              onScroll={handleScroll}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              wrap="off"
              onKeyDown={handleKeyDown}
              className="absolute inset-0 m-0 py-4 px-4 bg-transparent resize-none outline-none text-transparent caret-primary w-full h-full overflow-auto z-10 whitespace-pre"
              style={{ lineHeight: lineH, fontSize: text }}
              aria-label="RISC-V assembler code editor"
            />
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
