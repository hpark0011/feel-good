import { ProfileInfoView } from "./_views/profile-info-view";
import { DashboardContent } from "./_components/dashboard-content";
import { MOCK_ARTICLES } from "./articles/_data/mock-articles";

export default function DashboardPage() {
  return (
    <DashboardContent
      profile={<ProfileInfoView />}
      articles={MOCK_ARTICLES}
    />
  );
}
