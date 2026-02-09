import "server-only";

import Image from "next/image";
import {
  Facebook,
  Instagram,
  MessageCircle,
  Send,
  Twitter,
} from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative mx-auto mt-20 w-full max-w-275 overflow-hidden px-6 pb-44 text-white sm:px-10 sm:pb-52">
      <div className="mb-12 mt-4 h-px w-40 bg-white/20" />
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr_1fr]">
        <div className="flex flex-col gap-2 text-lg font-medium text-white/70">
          <span>Products</span>
          <span>Solution</span>
          <span>Resources</span>
          <span>Archive</span>
          <span className="mt-10 text-xs text-white/35">© 2023 — Copyright</span>
        </div>

        <div className="flex flex-col gap-6 text-sm text-white/55">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Contact Us
            </p>
            <p className="mt-3 text-sm text-white/70">+1 980 971-24-19</p>
            <p className="text-sm text-white/70">hello@logoipsum.com</p>
          </div>

          <div className="flex items-center gap-3">
            {[
              { name: "facebook", Icon: Facebook },
              { name: "twitter", Icon: Twitter },
              { name: "instagram", Icon: Instagram },
              { name: "send", Icon: Send },
              { name: "message", Icon: MessageCircle },
            ].map(({ name, Icon }) => (
              <span
                key={name}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Location
            </p>
            <p className="mt-3 text-sm text-white/70">
              1901 Thornridge Cir. Shiloh, Hawaii 81063
            </p>
            <p className="mt-2 text-sm text-white/70">10am—6pm</p>
            <p className="text-xs text-white/40">/ Everyday</p>
          </div>
          <div className="text-xs text-white/40">Privacy</div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          <h4 className="text-lg font-semibold">Start Free Trial</h4>
          <p className="mt-3 text-sm text-white/55">
            See what makes Reacherr AI voice platform unique from how it works
            to what it can do for your team
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">
              Try for Free
            </button>
            <button className="rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold text-white">
              Contact Sale
            </button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex w-full justify-center">
        <Image
          src="/images/footer/reacher-text-footer.png"
          alt="Reacherr"
          width={1464}
          height={220}
          className="h-auto w-[1120px] max-w-[140%] select-none opacity-95"
          priority={false}
        />
      </div>
    </footer>
  );
}

