import { DiscoverHeader } from "@/components/guest/DiscoverHeader";
import { DiscoverTabs } from "@/components/guest/DiscoverTabs";

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <DiscoverHeader />
      <DiscoverTabs />
      <div className="flex-1 overflow-y-auto scrollbar-hide">{children}</div>
    </div>
  );
}
