import { Loader } from "@/components/reusables/loader";

interface PortfolioValueCellProps {
  value: number;
  isLoading: boolean;
}

export function PortfolioValueCell({ value, isLoading }: PortfolioValueCellProps) {
  if (isLoading) {
    return <Loader />;
  }
  return <span className="font-bold">${value.toFixed(4)}</span>;
}
