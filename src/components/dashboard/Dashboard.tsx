// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/utils/supabase/client";
// import { CrewManagement } from "@/components/crews/CrewManagement";
// import { CloneTradingAnalyzer } from "@/components/crews/CloneTradingAnalyzer";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { PlusCircle, CheckCircle } from "lucide-react";

// interface Crew {
//   id: number;
//   name: string;
//   description: string;
//   created_at: string;
// }

// export default function Component() {
//   const [crews, setCrews] = useState<Crew[]>([]);
//   const [showCloneAnalyzer, setShowCloneAnalyzer] = useState(false);
//   const [hasClonedAnalyzer, setHasClonedAnalyzer] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     fetchCrews();
//     checkClonedAnalyzer();
//   }, []);

//   const fetchCrews = async () => {
//     const { data, error } = await supabase
//       .from("crews")
//       .select("id, name, description, created_at")
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Error fetching crews:", error);
//       return;
//     }

//     setCrews(data);
//   };

//   const checkClonedAnalyzer = async () => {
//     const { data: profile } = await supabase.auth.getUser();
//     if (!profile.user) return;

//     const { data, error } = await supabase
//       .from("crews")
//       .select("name")
//       .eq("profile_id", profile.user.id)
//       .eq("name", "TradingAnalyzer")
//       .single();

//     if (error && error.code !== "PGRST116") {
//       console.error("Error checking for cloned analyzer:", error);
//       return;
//     }

//     setHasClonedAnalyzer(!!data);
//   };

//   const handleCrewSelect = (crew: Crew) => {
//     router.push(`/crew/${crew.id}`);
//   };

//   const handleCloneComplete = () => {
//     setShowCloneAnalyzer(false);
//     setHasClonedAnalyzer(true);
//     fetchCrews();
//   };

//   return (
//     <div className="container mx-auto p-4 space-y-8">
//       <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle>Your Crews</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {crews.length > 0 ? (
//             <CrewManagement
//               crews={crews}
//               onCrewSelect={handleCrewSelect}
//               onCrewUpdate={fetchCrews}
//             />
//           ) : (
//             <p className="text-muted-foreground">
//               You haven&apos;t created any crews yet.
//             </p>
//           )}
//         </CardContent>
//         <CardFooter className="flex flex-col items-start space-y-4">
//           {showCloneAnalyzer ? (
//             <CloneTradingAnalyzer onCloneComplete={handleCloneComplete} />
//           ) : (
//             <>
//               <Button
//                 onClick={() => setShowCloneAnalyzer(true)}
//                 className="w-full"
//                 variant="outline"
//                 disabled={hasClonedAnalyzer}
//               >
//                 {hasClonedAnalyzer ? (
//                   <CheckCircle className="mr-2 h-4 w-4" />
//                 ) : (
//                   <PlusCircle className="mr-2 h-4 w-4" />
//                 )}
//                 {hasClonedAnalyzer
//                   ? "Trading Analyzer Cloned"
//                   : "Clone our Starter Crew"}
//               </Button>
//               {hasClonedAnalyzer ? (
//                 <p className="text-sm text-green-600">
//                   You&apos;ve successfully cloned the Trading Analyzer. You can
//                   find it in your crews list.
//                 </p>
//               ) : (
//                 <p className="text-sm text-muted-foreground">
//                   Start with our pre-configured Trading Analyzer crew or create
//                   a custom crew from scratch.
//                 </p>
//               )}
//             </>
//           )}
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }

"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Component() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Card className="w-full opacity-50 pointer-events-none">
        <CardHeader>
          <CardTitle>Your Crews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Available once the competition starts
          </p>
        </CardContent>
      </Card>
      <Card className="w-full opacity-50 pointer-events-none">
        <CardHeader>
          <CardTitle>Clone Crew</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Available once the competition starts
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
