import ArchivePage from "@/components/ArchivePage";
import { cardMetadata } from "@/lib/meta";

export const generateMetadata = () => cardMetadata("chi-sono");
export default function Page() {
  return <ArchivePage slug="chi-sono" />;
}
