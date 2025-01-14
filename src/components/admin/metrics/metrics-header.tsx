interface MetricsHeaderProps {
  totalCrews: number;
}

export function MetricsHeader({ totalCrews }: MetricsHeaderProps) {
  return (
    <p className="text-4xl font-bold mb-6">
      Total Crews so far: {totalCrews}
    </p>
  );
}
