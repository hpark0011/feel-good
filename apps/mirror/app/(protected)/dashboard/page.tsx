import { ProfileInfoView } from "@/features/profile";
import { DashboardView } from "./_views/dashboard-view";
import { MOCK_ARTICLES } from "@/features/articles";

export default function DashboardPage() {
  return (
    <DashboardView
      profile={<ProfileInfoView />}
      articles={MOCK_ARTICLES}
    />
  );
}
