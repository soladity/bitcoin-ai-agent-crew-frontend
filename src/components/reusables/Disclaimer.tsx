import * as React from "react";

interface DisclaimerProps {
  className?: string;
}

export function Disclaimer({ className }: DisclaimerProps) {
  return (
    <div className={`text-sm text-muted-foreground text-center ${className}`}>
      <p>
        This is a beta product. All trading activities carry inherent risks. 
        Past performance does not guarantee future results. 
        Not financial advice.
      </p>
    </div>
  );
}
