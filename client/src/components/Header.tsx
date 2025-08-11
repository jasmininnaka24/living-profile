type HeaderProps = { title: string; subtitle?: string };

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="border-b border-borderColor">
      <div className="py-4 mx-auto max-w-[100rem] px-8">
        <h1 className="text-2xl font-semibold text-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
