"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
          
          <div className="space-y-8 text-zinc-300">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">1. Acceptance of Terms</h2>
              <p className="mb-3">
                By accessing and using Klyro, you agree to be bound by these Terms of Use, all applicable laws, and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing Klyro.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">2. Use License</h2>
              <p className="mb-3">
                Permission is granted to temporarily view the materials on Klyro's platform for personal, non-commercial use. This is the grant of a license, not a transfer of title, and under this license, you may not:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software contained on Klyro</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
              <p>This license shall automatically terminate if you violate any of these restrictions and may be terminated by Klyro at any time.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">3. Disclaimer</h2>
              <p className="mb-3">
                The materials on Klyro are provided on an 'as is' basis. Klyro makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              <p>
                Further, Klyro does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its platform or otherwise relating to such materials or on any sites linked to this platform.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">4. Limitations</h2>
              <p>
                In no event shall Klyro or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Klyro's platform, even if Klyro or a Klyro authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">5. Accuracy of Materials</h2>
              <p>
                The materials appearing on Klyro's platform could include technical, typographical, or photographic errors. Klyro does not warrant that any of the materials on its platform are accurate, complete, or current. Klyro may make changes to the materials contained on its platform at any time without notice.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">6. Links</h2>
              <p>
                Klyro has not reviewed all of the sites linked to its platform and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Klyro of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">7. Modifications</h2>
              <p>
                Klyro may revise these terms of service for its platform at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">8. Blockchain Data & Smart Contracts</h2>
              <p className="mb-3">
                Klyro accesses and displays blockchain data and information related to smart contracts. Users acknowledge that:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Blockchain transactions are irreversible and Klyro has no ability to reverse any transactions</li>
                <li>Klyro does not custody or control user funds or private keys</li>
                <li>Users are solely responsible for the security of their private keys and funds</li>
                <li>Blockchain networks and smart contracts may contain vulnerabilities or bugs</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">9. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">10. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Use, please contact us at 
                <a href="mailto:0xklyro@gmail.com" className="text-indigo-400 hover:underline">0xklyro@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
        
        <div className="text-center text-zinc-500 text-sm mb-8">
          Last updated: May 2025
        </div>
      </div>
    </div>
  );
} 