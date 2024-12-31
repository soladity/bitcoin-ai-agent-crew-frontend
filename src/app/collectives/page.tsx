
import React from "react";
import Collectives from "@/components/collectives/collectives";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collectives",
};

const page = () => {
  return <Collectives />;
};

export default page;
