import { notFound } from "next/navigation";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@feel-good/convex/convex/_generated/api";
import { CloneSettingsPanel } from "@/features/clone-settings/components/clone-settings-panel";

export default async function CloneSettingsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const [currentAuthUser, profileData] = await Promise.all([
    fetchAuthQuery(api.auth.queries.getCurrentUser, {}),
    fetchAuthQuery(api.users.queries.getByUsername, { username }),
  ]);

  const isOwner =
    !!currentAuthUser &&
    !!profileData?.authId &&
    currentAuthUser._id === profileData.authId;

  if (!isOwner) notFound();

  return <CloneSettingsPanel />;
}
