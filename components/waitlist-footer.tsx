"use client";

import { useState } from "react";

export function WaitlistFooter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section id="waitlist" className="px-6 pb-14 pt-20 md:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl rounded-2xl border border-zinc-800/80 bg-zinc-950/75 p-6 md:p-8">
        <h3 className="text-2xl font-black text-zinc-100 md:text-3xl">Join the Agrisync Waitlist</h3>
        <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-xl border border-zinc-700 bg-black/70 px-4 text-zinc-100 placeholder:text-zinc-500 focus:border-[#00FF41] focus:outline-none"
          />
          <button
            type="submit"
            className="h-12 rounded-xl border border-[#00FF41] px-6 font-semibold text-[#00FF41] transition-colors hover:bg-[#00FF41] hover:text-black"
          >
            Join Waitlist
          </button>
        </form>
        {submitted ? <p className="mt-3 text-sm text-[#00FF41]">Thanks. You’ve been added to the waitlist.</p> : null}

        <footer className="mt-10 flex flex-col gap-3 border-t border-zinc-800 pt-5 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-5">
            <a
              href="https://docs.agrisync.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-zinc-100"
            >
              Documentation
            </a>
            <a
              href="https://api.agrisync.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-zinc-100"
            >
              API
            </a>
          </div>
          <a href="mailto:contact@agrisync.tech" className="transition-colors hover:text-zinc-100">
            contact@agrisync.tech
          </a>
        </footer>
      </div>
    </section>
  );
}
