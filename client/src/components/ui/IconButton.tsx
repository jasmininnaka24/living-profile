type IconButtonProps = {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
};
export function IconButton({ label, onClick, children }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-line text-muted hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-inputRing"
    >
      {children}
    </button>
  );
}
