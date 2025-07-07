"use client";

import { useState } from "react";
import MotionDiv from "@/components/motion-div";
import ContactList from "@/components/contact-list";
import { Button } from "@/components/ui/button";

export default function ContactSection() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Web3Forms parameter
    data.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_KEY!);

    try {
      setStatus("sending");
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      const result = await res.json();
      if (result.success) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      id="contact"
      className="my-4 mb-28 flex flex-col items-center gap-14 text-center md:mt-8"
    >
      {/* Heading */}
      <MotionDiv>
        <h2>Contact Me</h2>
      </MotionDiv>

      {/* Intro text */}
      <MotionDiv delayOffset={0.1}>
        <p>
          If you are interested in working together, please don't hesitate to
          get in touch with me.
        </p>
      </MotionDiv>

      {/* Form */}
      <MotionDiv delayOffset={0.2} className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <FloatingInput id="name" type="text" label="Name" />
            {/* Email */}
            <FloatingInput id="email" type="email" label="Email" />
            {/* Message (new row, same col width) */}
            <FloatingTextarea
              id="message"
              rows={6}
              label="Short Message"
              className="md:col-span-2"
            />
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full md:w-auto md:self-end"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending..." : "Send"}
          </Button>

          {/* Status notice */}
          {status === "sent" && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Thanks! <br />
              Looking forward to connecting with you!
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Oops! Something went wrong. Please try again later.
            </p>
          )}
        </form>
      </MotionDiv>
    </section>
  );
}

function FloatingInput({
  id,
  type,
  label,
}: {
  id: string;
  type: string;
  label: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        placeholder=" "
        required
        className="
          peer w-full rounded-md border border-border bg-transparent
          px-4 py-3 text-sm text-foreground
          focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary
        "
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}

function FloatingTextarea({
  id,
  rows,
  label,
  className = "",
}: {
  id: string;
  rows: number;
  label: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <textarea
        id={id}
        name={id}
        rows={rows}
        placeholder=" "
        required
        className="
          focus:outline-nonef peer w-full resize-none rounded-md border border-border
          bg-transparent px-4 py-3 text-sm
          text-foreground focus:border-primary
        "
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="
        pointer-events-none absolute left-4 top-1/2 origin-[0]
        -translate-y-1/2 select-none text-muted-foreground transition-all
        peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base
        peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary
        peer-[:not(:placeholder-shown)]:hidden
      "
    >
      {children}
    </label>
  );
}
