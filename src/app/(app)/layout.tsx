import { AppNav } from "@/components/app-nav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppNav />
      <div className="flex-1 md:pl-60">
        <main className="mx-auto w-full max-w-4xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:px-8 md:pt-6 md:pb-10">
          {children}
        </main>
      </div>
    </>
  );
}
