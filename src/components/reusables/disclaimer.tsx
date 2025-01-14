import * as React from "react";

interface DisclaimerProps {
  className?: string;
}

export function Disclaimer({ className }: DisclaimerProps) {
  return (
    <div className={`text-sm text-muted-foreground text-center ${className}`}>
      <p>
        aibtc.dev is not liable for any lost, locked, or mistakenly sent funds.
        This is alpha software—use at your own risk. Any STX sent to you is
        owned by you, the trader, and may be redeemed, including profits or
        losses, at the end of the aibtc.dev Champions Sprint (~5 days). By
        participating, you accept that aibtc.dev is not responsible for any
        product use, costs, taxes incurred from trading STX or any other digital
        asset, or any other liability.
      </p>
    </div>
  );
}
