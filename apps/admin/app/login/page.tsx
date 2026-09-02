import { LoginForm } from "@/components/login-form";

type LoginPageProps = {
  searchParams: Promise<{ refresh?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return <LoginForm attemptRefresh={params.refresh === "1"} />;
}
