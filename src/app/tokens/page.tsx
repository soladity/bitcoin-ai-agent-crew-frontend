
import React from "react";
import Tokens from "@/components/tokens/Tokens";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tokens",
};

const page = () => {
  return <Tokens />;
};

export default page;
