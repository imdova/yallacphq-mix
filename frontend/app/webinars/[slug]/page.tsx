import { WebinarDetailsView } from "@/components/features/webinars/WebinarDetailsView";

export default function WebinarDetailPage({ params }: { params: { slug: string } }) {
  return <WebinarDetailsView slug={params.slug} />;
}
