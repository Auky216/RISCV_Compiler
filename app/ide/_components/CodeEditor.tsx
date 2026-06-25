"use client";

import React, { useRef, useEffect } from "react";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  fontSize?: "sm" | "md" | "lg";
  isBinaryMode?: boolean;
  currentLine?: number;
}

const FONT_SIZE_MAP = {
  sm: { text: "12px", lineH: "20px" },
  md: { text: "14px", lineH: "24px" },
  lg: { text: "16px", lineH: "28px" },
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
          return <span key={i} className="text-[#1e40af] font-bold">{token}</span>; // Deep Blue
        }
        
        if (/^(x[0-9]{1,2}|zero|ra|sp|gp|tp|fp|a[0-7]|t[0-6]|s[0-9]{1,2})$/.test(lower)) {
          return <span key={i} className="text-[#c2410c]">{token}</span>; // Dark Orange
        }
        
        if (/^-?(0x[0-9a-f]+|[0-9]+)$/.test(lower)) {
          return <span key={i} className="text-[#6d28d9]">{token}</span>; // Violet/Purple
        }
        
        if (lower.endsWith(":")) {
          return <span key={i} className="text-[#047857] font-bold">{token}</span>; // Emerald Green
        }
        
        return <span key={i} className="text-primary">{token}</span>;
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
        <span className="text-slate-500 italic">{commentPart}</span>
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
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para seguir la línea actual durante el debug
  useEffect(() => {
    if (currentLine && textareaRef.current) {
      const textarea = textareaRef.current;
      const lineHeight = parseInt(lineH);
      // Añadimos 16px para compensar el padding superior (py-4)
      const targetY = (currentLine - 1) * lineHeight + 16;
      const visibleTop = textarea.scrollTop;
      const visibleBottom = visibleTop + textarea.clientHeight;
      
      // Si la línea actual se sale de la vista (dejamos un margen de 2 líneas)
      if (targetY < visibleTop + lineHeight * 2 || targetY > visibleBottom - lineHeight * 3) {
        // Hacemos scroll suave para centrar la línea
        const newScrollTop = Math.max(0, targetY - textarea.clientHeight / 2);
        
        // Scroll suave nativo. Esto disparará eventos 'scroll' que mantendrán
        // las demás capas sincronizadas a través de handleScroll.
        textarea.scrollTo({ top: newScrollTop, behavior: "smooth" });
      }
    }
  }, [currentLine, lineH]);

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
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  return (
    <section className="w-3/5 flex flex-col bg-background">
      {/* Tab bar */}
      <div className="flex items-center justify-between h-10 bg-primary/10 px-4 border-b-2 border-primary">
        <div className="flex items-center gap-3 bg-background border-[1px] border-primary px-3 py-1 shadow-[2px_2px_0_var(--color-primary)]">
          <span className="material-symbols-outlined text-[16px] text-primary">description</span>
          <span className="font-pixel-title text-xs text-primary uppercase">MAIN.S</span>
        </div>
        <span className="font-pixel-title text-[10px] text-primary/50 uppercase bg-primary/10 px-2 py-1">{lines.length} lines</span>
      </div>

      {/* Editor body */}
      <div
        className="flex-1 overflow-hidden flex bg-background relative text-primary shadow-[inset_0_4px_0_var(--color-primary)]"
        style={{ fontFamily: "monospace", fontSize: text }}
      >
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          className="w-16 bg-primary/5 text-right py-4 text-primary/50 select-none border-r-2 border-primary overflow-hidden flex-shrink-0 relative z-10"
          style={{ lineHeight: lineH }}
          aria-hidden="true"
        >
          {lines.map((_, i) => {
            const isCurrent = currentLine === i + 1;
            return (
              <div 
                key={i} 
                className={`flex justify-end items-center px-2 ${isCurrent ? "bg-primary text-white font-bold shadow-[inset_4px_0_0_0_var(--color-primary)]" : "pr-4"}`}
                style={{ height: lineH }}
              >
                {isCurrent && <span className="text-[10px] mr-2">►</span>}
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* Textarea Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {/* Highlight Container */}
          <div 
            ref={highlightRef}
            aria-hidden="true"
            className="absolute inset-0 m-0 py-4 px-4 overflow-hidden pointer-events-none z-0"
          >
            <div style={{ height: `calc(${lines.length} * ${lineH})`, position: 'relative' }}>
              {!isBinaryMode && currentLine && currentLine > 0 && currentLine <= lines.length && (
                <div 
                  className="absolute left-[-16px] right-[-16px] bg-yellow-200/50 transition-all duration-200 ease-out"
                  style={{
                    top: `calc(${(currentLine - 1)} * ${lineH})`,
                    height: lineH,
                  }}
                />
              )}
            </div>
          </div>

        {isBinaryMode ? (
          <div className="flex-1 py-8 px-4 flex flex-col items-center justify-center text-primary/50 uppercase font-pixel-title">
            <span className="material-symbols-outlined text-4xl mb-4 text-primary animate-pulse">memory</span>
            <p className="text-center max-w-xs leading-relaxed">
              BINARY LOADED TO MEMORY
              <br/>
              <span className="text-xs mt-4 block p-2 border-[1px] border-primary/50">CLICK RESET TO RETURN TO TEXT EDITOR</span>
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
