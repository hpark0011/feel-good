interface PageSectionHeaderProps {
  children: React.ReactNode;
}

export function PageSectionHeader(
  { children }: PageSectionHeaderProps,
) {
  return (
    <h3 className="text-sm pl-0.5 font-medium text-gray-9 w-full">
      {children}
    </h3>
  );
}
