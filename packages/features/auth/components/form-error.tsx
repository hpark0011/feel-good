export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
      {message}
    </div>
  );
}
