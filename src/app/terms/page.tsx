"use client";

import React from "react";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Disclaimer and Terms of Use</h1>
      
      <div className="prose dark:prose-invert max-w-none space-y-8">
        <section>
          <p className="text-zinc-800 dark:text-zinc-200">
            By accessing, downloading, installing, or otherwise using this product (the &ldquo;AIBTC.DEV&rdquo;), you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree with these terms, you must immediately cease all use of the Product.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">&ldquo;As-Is&rdquo; Provision</h2>
          <p className="text-zinc-800 dark:text-zinc-200">
            This Product is provided on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis without any warranties or representations of any kind, whether express, implied, or statutory. To the fullest extent permitted by law, we expressly disclaim any and all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, title, reliability, security, accuracy, or availability.
          </p>
          <p className="mt-4 text-zinc-800 dark:text-zinc-200">We make no representations or guarantees that:</p>
          <ul className="list-disc pl-6 mt-2 text-zinc-800 dark:text-zinc-200">
            <li>The Product will meet your specific needs or expectations;</li>
            <li>The Product will be uninterrupted, timely, secure, or error-free;</li>
            <li>The results, data, or outputs obtained through the Product will be accurate, complete, reliable, or error-free;</li>
            <li>Any defects or errors in the Product will be corrected.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Assumption of Risk</h2>
          <p className="text-zinc-800 dark:text-zinc-200">
            You expressly acknowledge and accept that your use of the Product is at your sole risk. We shall not be liable for any losses or damages of any kind, including but not limited to:
          </p>
          <ul className="list-disc pl-6 mt-2 text-zinc-800 dark:text-zinc-200">
            <li>Direct, indirect, incidental, consequential, special, or punitive damages;</li>
            <li>Financial losses, including but not limited to loss of income, revenue, or profits;</li>
            <li>Data breaches, security incidents, unauthorized access to data, or loss or corruption of data;</li>
            <li>Errors, inaccuracies, or omissions in the Product&apos;s outputs or functionalities;</li>
            <li>Any outcomes or consequences of decisions, transactions, or actions taken based on the use of the Product.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="text-zinc-800 dark:text-zinc-200">
            To the maximum extent permitted by applicable law, we shall not be liable for any damages arising out of or related to:
          </p>
          <ol className="list-decimal pl-6 mt-2 text-zinc-800 dark:text-zinc-200">
            <li>The use or inability to use the Product;</li>
            <li>Any errors, bugs, vulnerabilities, or interruptions in the Product;</li>
            <li>Unauthorized access to your data, transactions, or communications;</li>
            <li>Any failure of the Product to perform as expected;</li>
            <li>Any reliance placed on the Product or its outputs;</li>
            <li>Any losses or damages arising from the actions or inactions of third parties.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
          <p className="text-zinc-800 dark:text-zinc-200">
            You agree to indemnify, defend, and hold harmless us, our affiliates, officers, directors, employees, agents, licensors, and suppliers from and against any claims, liabilities, damages, losses, or expenses (including reasonable legal fees and costs) arising out of or in any way connected with your:
          </p>
          <ul className="list-disc pl-6 mt-2 text-zinc-800 dark:text-zinc-200">
            <li>Use or misuse of the Product;</li>
            <li>Violation of these terms;</li>
            <li>Violation of any applicable laws, regulations, or third-party rights;</li>
            <li>Misrepresentation or reliance on the Product&apos;s outputs.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">User Responsibility</h2>
          <p className="text-zinc-800 dark:text-zinc-200">
            The Product is intended solely as a tool to assist users. You are solely responsible for:
          </p>
          <ul className="list-disc pl-6 mt-2 text-zinc-800 dark:text-zinc-200">
            <li>Conducting your own research and due diligence before making any decisions, transactions, or actions based on the Product or its outputs;</li>
            <li>Safeguarding your data, credentials, accounts, and any sensitive information;</li>
            <li>Ensuring compliance with applicable laws, regulations, and industry standards.</li>
          </ul>
          <p className="mt-4 text-zinc-800 dark:text-zinc-200">
            We make no recommendations, endorsements, or assurances regarding the suitability of the Product for any specific use case. You acknowledge and agree that any reliance on the Product, its outputs, or related materials is at your own discretion and risk.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">No Professional Advice</h2>
          <p className="text-zinc-800 dark:text-zinc-200">
            The Product is not intended to provide professional advice of any kind, including but not limited to legal, financial, medical, or technical advice. You are encouraged to consult with appropriate professionals before relying on or acting upon any information or outputs from the Product.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Termination and Updates</h2>
          <p className="text-zinc-800 dark:text-zinc-200">
            We reserve the right to modify, suspend, or discontinue the Product at any time, with or without notice, and without liability to you. We also reserve the right to update these terms, and your continued use of the Product constitutes acceptance of any such updates.
          </p>
        </section>
      </div>
    </div>
  );
}
