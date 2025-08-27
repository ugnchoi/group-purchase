"use client";

import React, { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { locales } from "@/lib/i18n/locales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function useQuery() {
  return useMemo(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  }, []);
}

const Stat = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) => (
  <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
    <div className="text-2xl font-semibold tracking-tight">{value}</div>
    <div className="text-sm text-zinc-600">{label}</div>
    {sub ? <div className="mt-1 text-xs text-zinc-500">{sub}</div> : null}
  </div>
);

const Readonly = ({
  label,
  value,
  id,
}: {
  label: string;
  value: string;
  id: string;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-sm font-medium text-zinc-800">
      {label}
    </Label>
    <Input
      id={id}
      readOnly
      value={value ?? ""}
      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-700"
    />
  </div>
);

export default function Landing({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const q = useQuery();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  // Prefill values from QR URL or searchParams
  const service = q.get("service") || searchParams.service || "Home Service";
  const address = q.get("address") || searchParams.address || "Your Apartment";
  const unit = q.get("unit") || searchParams.unit || ""; // optional

  // Orders progress
  const minimumOrders = Number(q.get("min") || searchParams.min || 20);
  const [currentOrders, setCurrentOrders] = useState(
    Number(q.get("count") || searchParams.count || 0),
  );

  // Optional: poll backend for up-to-date counts
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Replace with your real endpoint, e.g., `/api/group-purchase/status?service=...&address=...`
        // const res = await fetch(`/api/orders/status?service=${encodeURIComponent(service)}&address=${encodeURIComponent(address)}`);
        // const data = await res.json();
        // if (typeof data.currentOrders === 'number') setCurrentOrders(data.currentOrders);
      } catch {
        // Silently ignore polling errors in UI
      }
    }, 15_000);
    return () => {
      clearInterval(interval);
    };
  }, [service, address]);

  const progress = Math.min(
    100,
    Math.round((currentOrders / minimumOrders) * 100),
  );
  const remaining = Math.max(0, minimumOrders - currentOrders);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    const phoneSanitized = phone.replace(/[^0-9+]/g, "");
    if (!/^[+]?([0-9]{8,15})$/.test(phoneSanitized)) {
      alert("Please enter a valid phone number (8–15 digits; '+' allowed).");
      return;
    }
    setSubmitting(true);
    try {
      // Replace with your backend endpoint
      // const payload = {
      //   name,
      //   phone: phoneSanitized,
      //   service,
      //   address,
      //   unit,
      //   source: "landing-page",
      //   ts: new Date().toISOString(),
      // };
      // await fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

      // Optimistic UI: increment counter
      setCurrentOrders((n) => n + 1);
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotifySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const notifyPhone = formData.get("notify_phone") as string;
    if (
      !/^[+]?([0-9]{8,15})$/.test((notifyPhone || "").replace(/[^0-9+]/g, ""))
    ) {
      alert("Enter a valid phone number for notifications.");
      return;
    }
    setNotifySubmitting(true);
    try {
      // const payload = {
      //   phone: (notifyPhone || "").replace(/[^0-9+]/g, ""),
      //   name: formData.get("notify_name") || "",
      //   interest: service,
      //   address,
      //   unit,
      //   consent: true,
      //   source: "landing-page-optin",
      //   ts: new Date().toISOString(),
      // };
      // await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setNotifySubmitted(true);
    } catch {
      alert("Could not save your notification preference. Please try again.");
    } finally {
      setNotifySubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Header */}
      <header className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white">
              GP
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">
                Group Purchase
              </h1>
              <p className="text-xs text-zinc-500">Save more together</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-indigo-700 hover:underline"
            >
              How it works
            </a>
            <div className="flex gap-2">
              {locales.map((locale) => (
                <Link
                  key={locale}
                  href={`/${locale}`}
                  className="px-3 py-1 rounded border hover:bg-gray-100 transition-colors text-sm"
                >
                  {locale.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="md:col-span-3 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              Limited-time group offer
            </div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {service} at your building
            </h2>
            <p className="mt-2 text-zinc-600">
              Join neighbors at{" "}
              <span className="font-medium text-zinc-800">{address}</span>
              {unit ? (
                <span className="text-zinc-500"> (Unit {unit})</span>
              ) : null}{" "}
              to unlock bulk pricing.
            </p>

            {/* Progress */}
            <div className="mt-6 space-y-3">
              <div className="flex items-end justify-between">
                <div className="text-sm text-zinc-600">Group progress</div>
                <div className="text-sm font-medium text-zinc-800">
                  {currentOrders} / {minimumOrders} joined
                </div>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-[width] duration-700"
                  style={{ width: `${progress}%` }}
                  aria-valuemax={minimumOrders}
                  aria-valuemin={0}
                  aria-valuenow={currentOrders}
                  role="progressbar"
                />
              </div>
              <div className="text-xs text-zinc-600">
                {remaining > 0 ? (
                  <>
                    <span className="font-medium text-zinc-800">
                      {remaining}
                    </span>{" "}
                    more to unlock the deal.
                  </>
                ) : (
                  <span className="font-medium text-emerald-700">
                    Deal unlocked! 🎉
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Minimum orders" value={minimumOrders} />
              <Stat label="Joined so far" value={currentOrders} />
              <Stat
                label="Estimated savings"
                value="10–30%"
                sub="vs. standard rate"
              />
            </div>
          </div>

          {/* Order form */}
          <div className="md:col-span-2 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            {!submitted ? (
              <form className="space-y-4" onSubmit={handleOrderSubmit}>
                <h3 className="text-lg font-semibold tracking-tight">
                  Reserve your spot
                </h3>
                <Readonly id="service" label="Service" value={service} />
                <Readonly id="address" label="Address" value={address} />
                {unit ? (
                  <Readonly id="unit" label="Unit (optional)" value={unit} />
                ) : null}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-zinc-800"
                  >
                    Your name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-zinc-800"
                  >
                    Phone number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="e.g. +821012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-start gap-3 text-sm text-zinc-700">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(checked) =>
                      setConsent(checked as boolean)
                    }
                    required
                  />
                  <Label htmlFor="consent" className="text-sm">
                    I agree to be contacted about this group purchase and
                    related logistics.
                    <span className="block text-xs text-zinc-500">
                      We respect your privacy and never share your details.
                    </span>
                  </Label>
                </div>
                <Button
                  type="submit"
                  disabled={submitting || !consent}
                  className="w-full"
                >
                  {submitting
                    ? "Submitting…"
                    : remaining > 0
                      ? `Join group • ${remaining} to go`
                      : "Join group • Deal unlocked!"}
                </Button>
                <p className="text-center text-xs text-zinc-500">
                  No payment now. We&apos;ll confirm schedule & pricing once the
                  group is set.
                </p>
              </form>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold tracking-tight">
                  You&apos;re in! 🎉
                </h3>
                <p className="text-sm text-zinc-700">
                  Thanks, {name.split(" ")[0] || "neighbor"}. We&apos;ll text{" "}
                  {phone} with next steps.
                </p>
                <Button
                  className="w-full"
                  onClick={() =>
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: "smooth",
                    })
                  }
                >
                  Get alerts for future deals
                </Button>
                <p className="text-xs text-zinc-500">
                  Tip: Save this page to check progress any time.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto mt-10 max-w-5xl px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="text-sm font-semibold">1) Join</div>
            <p className="mt-1 text-sm text-zinc-600">
              Add your name & phone to the group for {service} at {address}.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="text-sm font-semibold">2) Unlock pricing</div>
            <p className="mt-1 text-sm text-zinc-600">
              When we reach the minimum ({minimumOrders}), bulk rates kick in
              for everyone.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="text-sm font-semibold">3) We schedule</div>
            <p className="mt-1 text-sm text-zinc-600">
              We coordinate date/time and confirm your exact slot via text.
            </p>
          </div>
        </div>
      </section>

      {/* Future deals opt-in */}
      <section className="mx-auto mt-10 max-w-5xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="md:col-span-3 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold tracking-tight">
              Get notified about upcoming group purchases
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              Be first to know about cleaning, repairs, appliance deals, and
              more at your building.
            </p>
            {!notifySubmitted ? (
              <form
                className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5"
                onSubmit={handleNotifySubmit}
              >
                <div className="sm:col-span-2">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="notify_name"
                      className="text-sm font-medium text-zinc-800"
                    >
                      Name (optional)
                    </Label>
                    <Input
                      id="notify_name"
                      placeholder="Jane Doe"
                      type="text"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="notify_phone"
                      className="text-sm font-medium text-zinc-800"
                    >
                      Phone
                    </Label>
                    <Input
                      id="notify_phone"
                      name="notify_phone"
                      placeholder="e.g. +821012345678"
                      type="tel"
                      inputMode="tel"
                      required
                    />
                  </div>
                </div>
                <div className="sm:col-span-1 flex items-end">
                  <Button
                    type="submit"
                    disabled={notifySubmitting}
                    className="w-full"
                  >
                    {notifySubmitting ? "Saving…" : "Notify me"}
                  </Button>
                </div>
                <p className="sm:col-span-5 text-xs text-zinc-500">
                  By tapping Notify me, you agree to receive occasional SMS
                  about local group deals. Reply STOP to unsubscribe.
                </p>
              </form>
            ) : (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                You&apos;re on the list! We&apos;ll text you when new group
                purchases open for your building.
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold">
                Is this a binding order?
              </div>
              <p className="mt-1 text-sm text-zinc-600">
                No payment now. We confirm details when the group is ready.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold">
                Who provides the service?
              </div>
              <p className="mt-1 text-sm text-zinc-600">
                We partner with vetted local pros. Vendor details will be shared
                before scheduling.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold">
                Can I invite neighbors?
              </div>
              <p className="mt-1 text-sm text-zinc-600">
                Yes! Share this link—more people means better pricing for
                everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto mt-12 max-w-5xl px-4 pb-12">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm md:flex-row">
          <div>
            Questions?{" "}
            <a
              href="mailto:support@yourdomain.com"
              className="font-medium text-indigo-700 hover:underline"
            >
              Contact support
            </a>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">
              Terms
            </a>
            <a href="#" className="hover:underline">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
