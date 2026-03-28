import CouncilWorkspace from "@/ui/council/council-workspace";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Council ${id} | Rapid Chat`,
    description: `AI Council session ${id}. Multiple AI models deliberate and synthesize a final judgment.`,
    keywords: [
      "AI council",
      "multi-model AI",
      "AI deliberation",
      "AI debate",
      "artificial intelligence",
    ],
    openGraph: {
      title: `Council ${id} | Rapid Chat`,
      description: `AI Council session ${id}. Multiple AI models deliberate and synthesize a final judgment.`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `Council ${id} | Rapid Chat`,
      description: `AI Council session ${id}. Multiple AI models deliberate and synthesize a final judgment.`,
    },
  };
}

export default async function CouncilSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="w-full">
      <CouncilWorkspace id={id} />
    </div>
  );
}
