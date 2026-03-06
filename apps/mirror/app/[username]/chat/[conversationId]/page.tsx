import { redirect } from "next/navigation";

export default async function ChatConversationRedirect({
  params,
}: {
  params: Promise<{ username: string; conversationId: string }>;
}) {
  const { username, conversationId } = await params;
  redirect(`/@${username}?chat=1&conversation=${conversationId}`);
}
