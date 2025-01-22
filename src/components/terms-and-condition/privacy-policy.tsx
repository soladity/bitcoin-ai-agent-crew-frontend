import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PrivacyPolicy() {
  return (
    <ScrollArea className="h-full pr-4">
      <div className="prose dark:prose-invert max-w-none space-y-8">
        <section>
          <p className="text-zinc-800 dark:text-zinc-200">
            This Privacy Policy outlines how AIBTC.DEV (&quot;we&quot;,
            &quot;our&quot;, or &quot;us&quot;) collects, uses, and protects
            your personal information when you use our product. By using
            AIBTC.DEV, you agree to the terms of this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Information We Collect
          </h2>
          <p className="text-zinc-800 dark:text-zinc-200">
            We may collect the following types of information:
          </p>
          <ul className="list-disc pl-6 mt-2 text-zinc-800 dark:text-zinc-200">
            <li>Personal information (e.g., name, wallet address)</li>
            <li>Usage data (e.g., how you interact with our product)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            How We Use Your Information
          </h2>
          <p className="text-zinc-800 dark:text-zinc-200">
            We use your information to:
          </p>
          <ul className="list-disc pl-6 mt-2 text-zinc-800 dark:text-zinc-200">
            <li>Provide and maintain our product</li>
            <li>Communicate with you about our product and services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="text-zinc-800 dark:text-zinc-200">
            We implement reasonable security measures to protect your
            information. However, no method of transmission over the Internet or
            electronic storage is 100% secure, and we cannot guarantee absolute
            security.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="text-zinc-800 dark:text-zinc-200">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mt-2 text-zinc-800 dark:text-zinc-200">
            <li>Access, correct, or delete your personal information</li>
            <li>
              Object to or restrict the processing of your personal information
            </li>
            <li>Data portability</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Changes to This Privacy Policy
          </h2>
          <p className="text-zinc-800 dark:text-zinc-200">
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the &quot;last updated&quot; date.
          </p>
        </section>
      </div>
    </ScrollArea>
  );
}
