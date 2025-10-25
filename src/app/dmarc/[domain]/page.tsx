import { notFound } from "next/navigation";
import Link from "next/link";

// --- Mock data generator (replace with real data later) ---
function getMockDmarcData(domain: string) {
  let seed = 0;
  for (let i = 0; i < domain.length; i++) {
    seed += domain.charCodeAt(i);
  }
  const volume = 400 + (seed % 600);            // 400–999
  const alignedPct = 62 + (seed % 33);          // 62–94
  const spfPass = Math.round(volume * (0.55 + ((seed % 15) / 100)));
  const dkimPass = Math.round(volume * (0.60 + ((seed % 10) / 100)));
  const alignedCount = Math.round((alignedPct / 100) * volume);
  const failedCount = volume - alignedCount;

  return {
    domain,
    firstSeen: "2025-09-22",
    lastSeen: "2025-10-15",
    policySeen: ["p=none", "p=quarantine", "p=reject"][(seed % 3)],
    volume,
    alignedPct,
    alignedCount,
    failedCount,
    spfPass,
    dkimPass,
    topSources: [
      { src: "smtp.mailgun.org", aligned: true, count: Math.round(volume * 0.28) },
      { src: "gmail.com", aligned: true, count: Math.round(volume * 0.22) },
      { src: "outbound.protection.outlook.com", aligned: true, count: Math.round(volume * 0.17) },
      { src: "unknown (no rDNS)", aligned: false, count: Math.round(volume * 0.12) },
      { src: "bulk-sender-x.net", aligned: false, count: Math.round(volume * 0.06) },
    ],
    recentSamples: Array.from({ length: 6 }).map((_, i) => ({
      id: `msg-${seed}-${i}`,
      when: `2025-10-${String(10 + i).padStart(2,"0")} 0${i}:3${i}`,
      spf: i % 3 ? "pass" : "fail",
      dkim: i % 4 ? "pass" : "fail",
      dmarc: i % 5 ? "aligned" : "fail",
      from: i % 2 ? `billing@${domain}` : `noreply@${domain}`,
      sourceIp: `192.0.2.${(seed + i) % 255}`,
    })),
  };
}

export default async function DmarcDomainPage({ params }: { params: Promise<{ domain?: string }> }) {
  const { domain: domainParam } = await params;
  const domain = decodeURIComponent(domainParam || "");
  if (!domain) return notFound();

  const data = getMockDmarcData(domain);

  // Tiny CSS bars (no external chart lib)
  const bars = [14, 19, 11, 23, 17, 21, 16].map((h, i) => ({
    key: i,
    height: Math.round((h / 24) * 100),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Logo placeholder block (replace with your logo) */}
            <div className="h-9 w-9 rounded-xl bg-uncw-teal/10 ring-1 ring-uncw-teal/20" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                DMARC • <span className="text-uncw-teal">{data.domain}</span>
              </h1>
              <p className="text-xs text-gray-500">
                First seen {new Date(data.firstSeen).toLocaleDateString()} • Last seen{" "}
                {new Date(data.lastSeen).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Explainer */}
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-uncw-teal/20 bg-white p-5 shadow-sm md:col-span-2">
            <h2 className="mb-2 text-base font-semibold text-gray-900">What is DMARC (in plain English)?</h2>
            <p className="text-sm leading-6 text-gray-700">
              DMARC helps email receivers verify that messages claiming to be from <strong>{data.domain}</strong> are
              genuinely allowed to use that domain. It builds on <strong>SPF</strong> (which servers can send mail) and{" "}
              <strong>DKIM</strong> (a cryptographic signature), and then checks <strong>alignment</strong>—making sure
              the visible "From" matches the authenticated domain. This protects your brand from spoofing and keeps bad
              mail out of inboxes.
            </p>
            <div className="mt-3 rounded-xl bg-uncw-teal/5 p-3 text-sm text-uncw-teal">
              <strong>Why it matters:</strong> If your DMARC isn't enforced, anyone can pretend to be you. Customers get
              phished, and your brand takes the hit. With Ilminate, DMARC is straightforward and managed for you.
            </div>
          </div>

          <div className="rounded-2xl border border-uncw-teal/20 bg-gradient-to-br from-white to-uncw-teal/5 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Recommended next steps</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li>• Publish a <strong>valid DMARC record</strong> (start with p=none; add rua= and ruf=).</li>
              <li>• Fix SPF/DKIM so your legit senders <strong>align</strong>.</li>
              <li>• Move policy to <strong>quarantine</strong> then <strong>reject</strong> safely.</li>
              <li>• Let Ilminate monitor reports and tune exceptions.</li>
            </ul>
            <div className="mt-4">
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-xl bg-uncw-teal px-3 py-2 text-sm font-semibold text-white hover:bg-uncw-teal/90"
              >
                Help me enforce DMARC
              </Link>
            </div>
          </div>
        </section>

        {/* KPI cards */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Messages (30d)" value={data.volume.toLocaleString()} hint="DMARC evaluated" />
          <Kpi label="Aligned %" value={`${data.alignedPct}%`} hint={`${data.alignedCount.toLocaleString()} aligned`} positive />
          <Kpi label="Policy Seen" value={data.policySeen} hint="From aggregate reports" />
          <Kpi label="Failures (30d)" value={data.failedCount.toLocaleString()} hint="Not aligned" negative />
        </section>

        {/* Chart + Auth breakdown */}
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Message Volume (last 7 buckets)</h3>
              <span className="text-xs text-gray-500">Mock data</span>
            </div>
            <div className="mt-4 flex h-40 items-end gap-2">
              {bars.map((b) => (
                <div
                  key={b.key}
                  className="flex-1 rounded-t-lg bg-uncw-teal/80"
                  style={{ height: `${b.height}%` }}
                  aria-label={`bar ${b.key}`}
                  title={`Volume bucket ${b.key + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Authentication breakdown</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-gray-700">SPF pass</span>
                <span className="font-medium text-gray-900">{data.spfPass.toLocaleString()}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-700">DKIM pass</span>
                <span className="font-medium text-gray-900">{data.dkimPass.toLocaleString()}</span>
              </li>
              <li className="mt-2 border-t pt-3 text-xs text-gray-500">
                For DMARC, at least one (SPF or DKIM) must <strong>pass and align</strong> with the visible From domain.
              </li>
            </ul>
          </div>
        </section>

        {/* Sources & Samples */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Top sending sources</h3>
            <div className="divide-y divide-gray-100">
              <div className="grid grid-cols-3 px-1 pb-2 text-xs font-semibold text-gray-500">
                <div>Source</div>
                <div className="text-center">Aligned</div>
                <div className="text-right">Count</div>
              </div>
              {data.topSources.map((s) => (
                <div key={s.src} className="grid grid-cols-3 items-center px-1 py-2 text-sm">
                  <div className="truncate text-gray-800">{s.src}</div>
                  <div className="text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                        s.aligned ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.aligned ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="text-right tabular-nums text-gray-700">{s.count.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Recent samples</h3>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <div className="grid grid-cols-5 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
                <div>When</div>
                <div>From</div>
                <div>SPF</div>
                <div>DKIM</div>
                <div>DMARC</div>
              </div>
              <div className="divide-y divide-gray-100">
                {data.recentSamples.map((m) => (
                  <div key={m.id} className="grid grid-cols-5 items-center px-3 py-2 text-sm">
                    <div className="text-gray-700">{m.when}</div>
                    <div className="truncate text-gray-800">{m.from}</div>
                    <Badge value={m.spf} good={m.spf === "pass"} />
                    <Badge value={m.dkim} good={m.dkim === "pass"} />
                    <Badge value={m.dmarc} good={m.dmarc === "aligned"} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Callout: Make DMARC simple */}
        <section className="mt-6 rounded-2xl border border-uncw-teal/20 bg-uncw-teal p-5 text-white shadow-sm">
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h3 className="text-base font-semibold">DMARC is a must—Ilminate makes it simple.</h3>
              <p className="mt-1 text-sm text-white/90">
                We deploy, monitor, and tune DMARC for you. No guesswork, no jargon—just protection and visibility.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-uncw-teal hover:bg-gray-50"
            >
              Talk to a specialist
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------- UI Partials ---------- */

function Kpi({
  label,
  value,
  hint,
  positive,
  negative,
}: {
  label: string;
  value: string | number;
  hint?: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      {hint && (
        <div
          className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
            positive
              ? "bg-green-100 text-green-700"
              : negative
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function Badge({ value, good }: { value: string; good: boolean }) {
  return (
    <div
      className={`w-fit rounded-full px-2 py-0.5 text-center text-xs ${
        good ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {value}
    </div>
  );
}

