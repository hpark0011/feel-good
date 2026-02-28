import { FactoryView } from "@/app/_components/factory-view";

export default function UIFactoryPage() {
  return (
    <main className="mx-auto min-h-screen">
      <div className="flex flex-col items-center py-20  justify-center h-full min-h-screen">
        <FactoryView />
      </div>
    </main>
  );
}
