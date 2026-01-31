import { NavHeader } from "@/app/_components/nav-header";
import { FactoryView } from "@/app/_views/factory-view";

export default function UIFactoryPage() {
  return (
    <>
      <NavHeader />
      <main className="mx-auto min-h-screen">
        <div className="flex flex-col items-center h-screen py-20">
          <FactoryView />
        </div>
      </main>
    </>
  );
}
