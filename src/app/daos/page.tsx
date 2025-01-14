
import React from "react";
import DAOs from "@/components/daos/daos";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DAOs",
};

const page = () => {
  return <DAOs />;
};

export default page;
