import { ArchetypeStage } from "@/components/hero/ArchetypeStage";
import { CornerNav } from "@/components/hero/CornerNav";
import { ARCHETYPE_CARDS } from "@/lib/archetypes";

export default function HomePage() {
  return <ArchetypeStage cards={ARCHETYPE_CARDS} chrome={<CornerNav />} />;
}
