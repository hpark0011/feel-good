import { ProfileInfoView } from "@/features/profile";
import { DashboardContent } from "./_components/dashboard-content";
import { MOCK_ARTICLES } from "@/features/articles";

export default function DashboardPage() {
  return (
    <DashboardContent
      profile={<ProfileInfoView />}
      articles={MOCK_ARTICLES}
    />
  );
}
