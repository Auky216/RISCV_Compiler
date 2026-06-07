"use client";

// Panel lateral izquierdo con iconos de navegación del IDE
type ActiveView = "editor" | "memory" | "database" | "terminal";

interface SideRailProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

const RAIL_ITEMS: { id: ActiveView; icon: string; label: string; ready: boolean }[] = [
  { id: "editor",   icon: "code",     label: "Editor",   ready: true  },
  { id: "memory",   icon: "memory",   label: "Memory",   ready: false },
  { id: "database", icon: "database", label: "Database", ready: false },
  { id: "terminal", icon: "terminal", label: "Terminal", ready: false },
];

export function SideRail({ activeView, onViewChange }: SideRailProps) {
  return (
    <aside className="flex flex-col h-full w-12 bg-surface-container-low border-r border-outline-variant z-40 items-center py-4 gap-2">
      {RAIL_ITEMS.map(({ id, icon, label, ready }) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            onClick={() => ready && onViewChange(id)}
            disabled={!ready}
            title={ready ? label : `${label} — próximamente`}
            className={`w-10 h-10 flex items-center justify-center transition-colors relative group ${
              isActive
                ? "bg-primary-container text-on-primary-container border-l-2 border-primary"
                : ready
                ? "text-on-surface-variant hover:bg-surface-container"
                : "text-on-surface-variant opacity-30 cursor-not-allowed"
            }`}
          >
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {icon}
            </span>
            {/* Tooltip */}
            {!ready && (
              <span className="absolute left-12 bg-surface-container-highest border border-outline-variant font-code-sm text-[10px] text-on-surface-variant px-2 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                Próximamente
              </span>
            )}
          </button>
        );
      })}

      {/* Bottom: Help & Settings */}
      <div className="mt-auto flex flex-col gap-2 mb-2">
        <button
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant opacity-30 cursor-not-allowed"
          disabled
          title="Help — próximamente"
        >
          <span className="material-symbols-outlined">help</span>
        </button>
      </div>
    </aside>
  );
}
