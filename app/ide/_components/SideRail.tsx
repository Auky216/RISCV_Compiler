"use client";

type ActiveView = "editor" | "datapath" | "control";

interface SideRailProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

const RAIL_ITEMS: { id: ActiveView; icon: string; label: string }[] = [
  { id: "editor",   icon: "code",        label: "Editor"    },
  { id: "datapath", icon: "schema",      label: "Datapath"  },
  { id: "control",  icon: "table_chart", label: "ALU Table" },
];

export function SideRail({ activeView, onViewChange }: SideRailProps) {
  return (
    <aside className="flex flex-col h-full w-16 bg-background border-r-2 border-primary z-40 items-center py-6 gap-4">
      {RAIL_ITEMS.map(({ id, icon, label }) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            title={label}
            className={`w-12 h-10 flex items-center justify-center transition-all relative group border-[1px] ${
              isActive
                ? "bg-primary text-background border-primary shadow-[2px_2px_0_var(--color-primary)] -translate-y-1"
                : "text-primary border-transparent hover:border-primary hover:shadow-[2px_2px_0_var(--color-primary)] hover:-translate-y-1 bg-background"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {icon}
            </span>
            <span className="absolute left-16 bg-background border-2 border-primary font-pixel-title text-[10px] text-primary px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-[2px_2px_0_var(--color-primary)] uppercase">
              {label}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
