import { MobileFrame } from "@/components/guest/MobileFrame";
import { StatusBar } from "@/components/guest/StatusBar";
import { BottomNav } from "@/components/guest/BottomNav";

export default function GuestShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileFrame>
      <StatusBar />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      <BottomNav />
    </MobileFrame>
  );
}
