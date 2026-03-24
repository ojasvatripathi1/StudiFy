import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        <Link href="/" className="inline-flex items-center text-primary hover:underline font-medium">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">1. Agreement to Terms</h2>
            <p>By accessing or using StudiFy, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on StudiFy's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>attempt to decompile or reverse engineer any software contained on StudiFy's website;</li>
              <li>remove any copyright or other proprietary notations from the materials; or</li>
              <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">3. User Accounts</h2>
            <p>If you create an account on the application, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account and any other actions taken in connection with it. We may, but have no obligation to, monitor and review new accounts before you may sign in and start using the Services.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">4. Disclaimer</h2>
            <p>The materials on StudiFy's website are provided on an 'as is' basis. StudiFy makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
