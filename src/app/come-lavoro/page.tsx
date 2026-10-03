import ArchivePage from "@/components/ArchivePage";
import { cardMetadata } from "@/lib/meta";

export const generateMetadata = () => cardMetadata("come-lavoro");
export default function Page() {
  return <ArchivePage slug="come-lavoro" />;
}
