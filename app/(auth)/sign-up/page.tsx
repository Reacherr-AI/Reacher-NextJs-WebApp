import { SiteNavbar } from "@/components/layout/site-navbar";
import SignUpClient from "./SignUpClient";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-black px-6 pb-16 pt-10 text-white">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-300 flex-col rounded-3xl border border-white/10 bg-[radial-gradient(1200px_circle_at_75%_10%,rgba(56,66,218,0.25)_0%,rgba(0,0,0,0.9)_50%,rgba(0,0,0,1)_100%)] p-8 shadow-[0_40px_120px_rgba(6,7,33,0.45)] sm:p-12">
        <SiteNavbar />

        <SignUpClient />
      </div>
    </div>
  );
}
