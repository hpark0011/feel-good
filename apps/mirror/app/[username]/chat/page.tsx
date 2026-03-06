import { redirect } from "next/navigation";

export default async function ChatRedirect({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  redirect(`/@${username}?chat=1`);
}
