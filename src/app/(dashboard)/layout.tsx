import AuthProviderWrapper from "@/components/providers/AuthProviderWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProviderWrapper>{children}</AuthProviderWrapper>;
}
