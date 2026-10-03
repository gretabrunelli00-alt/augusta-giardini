import StudioPage from "@/components/StudioPage";
import { cardMetadata } from "@/lib/meta";

export const generateMetadata = () => cardMetadata("filosofia");
export default function Page() {
  return <StudioPage slug="filosofia" />;
}
