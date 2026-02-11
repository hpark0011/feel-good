import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@feel-good/ui/primitives/alert-dialog";

type DeleteArticlesDialogProps = {
  count: number;
  onConfirm: () => void;
};

export function DeleteArticlesDialog({ count, onConfirm }: DeleteArticlesDialogProps) {
  const label = count === 1 ? "article" : "articles";

  return (
    <AlertDialogContent size="sm">
      <AlertDialogHeader>
        <AlertDialogTitle>Delete {label}</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently delete {count} {label}. This action cannot be
          undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onConfirm}>
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
