// Layout específico del IDE — restringe a h-screen para evitar scroll
// La landing page usa el layout raíz con min-h-screen (scrollable)
export default function IdeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {children}
    </div>
  );
}
