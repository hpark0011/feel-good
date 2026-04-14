import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import { MessagesInbox } from "@/features/messages";

export default async function MessagesPage() {
  const authed = await isAuthenticated();
  if (!authed) redirect("/sign-in");
  return (
    <main className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 px-4 text-2xl font-semibold">Messages</h1>
      <MessagesInbox />
    </main>
  );
}
