"use client";

import { useEffect, useState } from "react";

type SmsDetection = {
  id: string;
  type: "sms_smishing" | "toad_callback";
  risk_score: number;
  label: "benign" | "suspicious" | "malicious";
  reason: string;
  indicators: {
    urls: string[];
    phone_numbers: string[];
    keywords: string[];
  };
  channel: "sms";
  tenant_id: string;
  user_id?: string;
  timestamp: string;
};

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

/**
 * SMS and Callback Threats Page
 */
export default function SmsThreatsPage() {
  const [detections, setDetections] = useState<SmsDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Use the existing detections API, filtered by channel=sms
        const resp = await fetch("/api/detections?channel=sms");
        if (!resp.ok) {
          throw new Error(`Failed to load detections: ${resp.statusText}`);
        }
        const data = await resp.json();
        setDetections(data.items ?? data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load detections");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const total = detections.length;
  const toadCount = detections.filter((d) => d.type === "toad_callback").length;
  const highRisk = detections.filter((d) => d.label === "malicious").length;
  const suspicious = detections.filter((d) => d.label === "suspicious").length;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">SMS and Callback Threats</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat title="Total SMS detections" value={total} />
        <Stat title="TOAD callbacks" value={toadCount} />
        <Stat title="High risk (malicious)" value={highRisk} />
        <Stat title="Suspicious" value={suspicious} />
      </div>

      {loading ? (
        <div className="mt-4">Loading...</div>
      ) : error ? (
        <div className="mt-4 text-red-500">Error: {error}</div>
      ) : detections.length === 0 ? (
        <div className="mt-4 text-gray-500">No SMS detections found.</div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Risk</th>
                <th className="px-3 py-2">From</th>
                <th className="px-3 py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {detections.map((d) => (
                <tr
                  key={d.id}
                  className={`bg-gray-900/40 hover:bg-gray-900/60 rounded-xl ${
                    d.label === "malicious" ? "border-l-4 border-red-500" : ""
                  }`}
                >
                  <td className="px-3 py-2 align-top">
                    {new Date(d.timestamp).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        d.type === "toad_callback"
                          ? "bg-orange-500/20 text-orange-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {d.type}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span className="font-semibold">
                      {(d.risk_score * 100).toFixed(0)}%
                    </span>{" "}
                    <span
                      className={`text-xs ${
                        d.label === "malicious"
                          ? "text-red-400"
                          : d.label === "suspicious"
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                    >
                      ({d.label})
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">
                    {d.indicators.phone_numbers[0] ?? "—"}
                  </td>
                  <td className="px-3 py-2 align-top max-w-md">
                    <div className="line-clamp-3">{d.reason}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

