import { Suspense } from "react";
import { Heading } from "@/components/catalyst/heading";
import { Marketplace } from "@/components/marketplace/Marketplace";
import { Loader } from "@/components/reusables/Loader";

export const dynamic = "force-dynamic";
export const runtime = "edge";
export default async function MarketplacePage() {
  return (
    <div className="container mx-auto p-4">
      <Heading>Marketplace</Heading>
      <Suspense fallback={<Loader />}>
        <Marketplace />
      </Suspense>
    </div>
  );
}
