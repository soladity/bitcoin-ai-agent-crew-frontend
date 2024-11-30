"use client";

import React from "react";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8 space-y-4">
          <p className="text-zinc-800 dark:text-zinc-200">
            By using this product, you acknowledge and agree that it is provided &ldquo;as-is&rdquo; and without warranties of any kind, express or implied. We make no guarantees regarding the functionality, reliability, security, or accuracy of the product or its outputs.
          </p>
          
          <p className="text-zinc-800 dark:text-zinc-200">
            You understand and accept that the use of this product is at your own risk. We are not responsible or liable for any losses, damages, errors, or issues arising from or related to its use, including but not limited to financial loss, data breaches, or misuse of funds.
          </p>
          
          <p className="text-zinc-800 dark:text-zinc-200">
            Users are solely responsible for their actions, transactions, and decisions when using this product. Please ensure you conduct your own research and exercise caution. If you do not agree with these terms, do not use this product.
          </p>
        </div>
      </div>
    </div>
  );
}
