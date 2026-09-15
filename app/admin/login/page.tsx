import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{ refresh?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  redirect(`/auth?mode=login${params.refresh === "1" ? "&refresh=1" : ""}&next=%2Fadmin`);
}
