interface ComponentsSectionHeaderProps {
  children: React.ReactNode;
}

export function ComponentsSectionHeader(
  { children }: ComponentsSectionHeaderProps,
) {
  return <h3 className="text-sm pl-0.5 font-medium text-gray-9">{children}</h3>;
}
