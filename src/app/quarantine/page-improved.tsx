"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import useSWR from 'swr';

// ============================================================================
// TYPES - Aligned with actual API response
// ============================================================================

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type Disposition = "quarantined" | "released" | "deleted";
type DateFilter = "24h" | "7d" | "30d" | "all";
type SeverityFilter = "all" | Severity;

// Actual API response structure
interface QuarantineMessage {
  messageId: string;
  subject: string;
  sender: string;
  senderEmail: string;
  recipients: string[];
  quarantineTimestamp: number;
  riskScore: number; // 0-100
  severity: Severity;
  detectionReasons: string[];
  bodyPreview: string;
  s3Key?: string;
  hasAttachments: boolean;
  attachments: Array<{ name: string; size: number; contentType: string }>;
  status: Disposition;
  mailboxType: "microsoft365" | "google_workspace";
}

// API response wrapper
interface QuarantineApiResponse {
  success: boolean;
  data: QuarantineMessage[];
  count: number;
  source: string;
  error?: string;
}

// ============================================================================
// UTILITIES
// ============================================================================

const severityColor: Record<Severity, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-amber-400",
  MEDIUM: "bg-yellow-400",
  LOW: "bg-emerald-400",
};

const severityLabel: Record<Severity, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

// Extract domain from email
const getDomain = (email: string): string => {
  const match = email.match(/@(.+)/);
  return match ? match[1] : email;
};

// Convert date filter to days
const dateFilterToDays = (filter: DateFilter): number => {
  switch (filter) {
    case "24h": return 1;
    case "7d": return 7;
    case "30d": return 30;
    case "all": return 365; // Max 1 year
  }
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// API FETCHER
// ============================================================================

const fetcher = async (url: string): Promise<QuarantineMessage[]> => {
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const data: QuarantineApiResponse = await res.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch quarantine messages');
  }

  return data.data;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function QuarantinePage() {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("7d");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [selectedMessage, setSelectedMessage] = useState<QuarantineMessage | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Debounce search input
  const debouncedSearch = useDebounce(search, 300);

  // Build API URL
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearch) {
      params.append('search', debouncedSearch);
    }
    
    if (severityFilter !== 'all') {
      params.append('severity', severityFilter);
    }
    
    params.append('days', dateFilterToDays(dateFilter).toString());
    
    return `/api/quarantine/list?${params.toString()}`;
  }, [debouncedSearch, severityFilter, dateFilter]);

  // Fetch data with SWR
  const { data: messages = [], error, isLoading, mutate } = useSWR<QuarantineMessage[]>(
    apiUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  // Selection helpers
  const allSelected = useMemo(() => {
    if (!messages.length) return false;
    return messages.every((m) => selectedIds.has(m.messageId));
  }, [messages, selectedIds]);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map((m) => m.messageId)));
    }
  }, [allSelected, messages]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Bulk actions
  const handleBulkAction = useCallback(async (action: "release" | "delete" | "export") => {
    if (!selectedIds.size) return;

    const idsArray = Array.from(selectedIds);

    try {
      // TODO: Implement API endpoints
      if (action === "export") {
        // Export logic
        console.log("Export", idsArray);
      } else {
        // Release or delete
        const res = await fetch(`/api/quarantine/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageIds: idsArray }),
        });

        if (res.ok) {
          // Refresh data
          mutate();
          setSelectedIds(new Set());
        } else {
          throw new Error(`Failed to ${action} messages`);
        }
      }
    } catch (err) {
      console.error(`Bulk ${action} error:`, err);
      alert(`Failed to ${action} messages. Please try again.`);
    }
  }, [selectedIds, mutate]);

  // Single message actions
  const handleReleaseSingle = useCallback(async (message: QuarantineMessage) => {
    try {
      const res = await fetch(`/api/quarantine/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: message.messageId }),
      });

      if (res.ok) {
        mutate();
        setSelectedMessage(null);
      } else {
        throw new Error('Failed to release message');
      }
    } catch (err) {
      console.error('Release error:', err);
      alert('Failed to release message. Please try again.');
    }
  }, [mutate]);

  const handleDeleteSingle = useCallback(async (message: QuarantineMessage) => {
    if (!confirm(`Are you sure you want to delete "${message.subject}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/quarantine/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: message.messageId }),
      });

      if (res.ok) {
        mutate();
        setSelectedMessage(null);
      } else {
        throw new Error('Failed to delete message');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete message. Please try again.');
    }
  }, [mutate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Quarantine</h1>
          <p className="text-sm text-slate-400">
            Review and manage messages held by Ilminate APEX before they reach inboxes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Critical
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> High
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400" /> Medium
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Low
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Filters Sidebar */}
        <aside className="hidden lg:flex lg:w-72 border-r border-slate-800 bg-slate-950/80 flex-col">
          <div className="px-5 py-4 border-b border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Filters
            </div>
          </div>
          <div className="flex-1 px-5 py-4 space-y-6 overflow-y-auto text-sm">
            {/* Date Range */}
            <div>
              <div className="font-medium mb-2 text-slate-300">Date range</div>
              <div className="grid grid-cols-2 gap-2">
                {(["24h", "7d", "30d", "all"] as DateFilter[]).map((val) => (
                  <button
                    key={val}
                    onClick={() => setDateFilter(val)}
                    className={`rounded-md px-2.5 py-1.5 text-xs border transition ${
                      dateFilter === val
                        ? "bg-teal-500/10 border-teal-500 text-teal-200"
                        : "border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {val === "24h" ? "Last 24h" : val === "7d" ? "Last 7 days" : val === "30d" ? "Last 30 days" : "All time"}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <div className="font-medium mb-2 text-slate-300">Severity</div>
              <div className="space-y-1">
                {(["all", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as SeverityFilter[]).map((val) => (
                  <button
                    key={val}
                    onClick={() => setSeverityFilter(val)}
                    className={`w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs border transition ${
                      severityFilter === val
                        ? "bg-slate-800 border-teal-500 text-teal-200"
                        : "border-slate-800 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {val !== "all" && (
                        <span className={`w-2 h-2 rounded-full ${severityColor[val]}`} />
                      )}
                      <span className="capitalize">{val === "all" ? "All" : severityLabel[val]}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Search and Actions */}
          <div className="border-b border-slate-800 px-4 lg:px-6 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1 max-w-lg">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  🔍
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search subject, sender, recipient..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 justify-between md:justify-end">
              <div className="hidden md:flex text-xs text-slate-400 mr-2">
                {isLoading ? "Loading…" : `${messages.length} message${messages.length === 1 ? "" : "s"}`}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleBulkAction("export")}
                  disabled={!selectedIds.size}
                  className="text-xs border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Export
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  disabled={!selectedIds.size}
                  className="text-xs border border-red-700/70 rounded-md px-2.5 py-1.5 text-red-300 hover:border-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleBulkAction("release")}
                  disabled={!selectedIds.size}
                  className="text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-md px-3 py-1.5 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Release
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="px-4 py-2 text-xs text-red-400 bg-red-500/10 border-b border-red-500/40">
              Error: {error.message}. <button onClick={() => mutate()} className="underline">Retry</button>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-slate-400">Loading messages...</div>
                </div>
              ) : (
                <table className="min-w-full text-sm text-left border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10 bg-slate-950">
                    <tr>
                      <th className="w-10 border-b border-slate-800 px-4 py-2">
                        <input
                          type="checkbox"
                          className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-teal-500"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="border-b border-slate-800 px-4 py-2 text-slate-400 font-medium text-xs">Risk</th>
                      <th className="border-b border-slate-800 px-4 py-2 text-slate-400 font-medium text-xs">Subject</th>
                      <th className="border-b border-slate-800 px-4 py-2 text-slate-400 font-medium text-xs">Sender</th>
                      <th className="border-b border-slate-800 px-4 py-2 text-slate-400 font-medium text-xs">Recipient</th>
                      <th className="border-b border-slate-800 px-4 py-2 text-slate-400 font-medium text-xs">Reason</th>
                      <th className="border-b border-slate-800 px-4 py-2 text-slate-400 font-medium text-xs">Time</th>
                      <th className="border-b border-slate-800 px-4 py-2 text-slate-400 font-medium text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((m, idx) => {
                      const selected = selectedIds.has(m.messageId);
                      const rowBg = idx % 2 === 0 ? "bg-slate-950" : "bg-slate-950/60";
                      const recipient = m.recipients[0] || 'Unknown';

                      return (
                        <tr
                          key={m.messageId}
                          className={`${rowBg} hover:bg-slate-900/80 cursor-pointer`}
                          onClick={() => setSelectedMessage(m)}
                        >
                          <td className="px-4 py-2 border-b border-slate-900" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-teal-500"
                              checked={selected}
                              onChange={() => toggleSelect(m.messageId)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-4 py-2 border-b border-slate-900">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-8 rounded-full ${severityColor[m.severity]}`} />
                              <span className="text-xs text-slate-300">{severityLabel[m.severity]}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b border-slate-900 max-w-xs">
                            <div className="flex flex-col">
                              <span className="text-slate-100 truncate">{m.subject}</span>
                              <span className="text-xs text-slate-500 truncate">Risk: {m.riskScore}/100</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b border-slate-900 max-w-xs">
                            <div className="flex flex-col">
                              <span className="truncate text-slate-100">{m.sender}</span>
                              <span className="text-xs text-slate-500 truncate">{getDomain(m.senderEmail)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b border-slate-900 max-w-xs">
                            <div className="flex flex-col">
                              <span className="truncate text-slate-100">{recipient}</span>
                              <span className="text-xs text-slate-500 truncate">{getDomain(recipient)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b border-slate-900 max-w-md">
                            <span className="text-xs text-slate-300 line-clamp-2">
                              {m.detectionReasons.join(', ')}
                            </span>
                          </td>
                          <td className="px-4 py-2 border-b border-slate-900 whitespace-nowrap text-xs text-slate-400">
                            {new Date(m.quarantineTimestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 border-b border-slate-900 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleReleaseSingle(m)}
                                className="text-[11px] rounded-md px-2 py-1 bg-teal-500/10 text-teal-300 border border-teal-500/50 hover:bg-teal-500/20"
                              >
                                Release
                              </button>
                              <button
                                onClick={() => handleDeleteSingle(m)}
                                className="text-[11px] rounded-md px-2 py-1 bg-red-500/10 text-red-300 border border-red-500/50 hover:bg-red-500/20"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {!isLoading && messages.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                          No messages found. Adjust filters or search to see quarantined emails.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Details Panel */}
            {selectedMessage && (
              <div className="hidden xl:flex w-[380px] border-l border-slate-800 bg-slate-950/90 flex-col">
                <div className="px-5 py-4 border-b border-slate-800 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Message details</div>
                    <div className="mt-1 text-sm font-medium text-slate-100 line-clamp-2">{selectedMessage.subject}</div>
                  </div>
                  <button onClick={() => setSelectedMessage(null)} className="text-xs text-slate-400 hover:text-slate-100">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-xs">
                  <section className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-6 rounded-full ${severityColor[selectedMessage.severity]}`} />
                      <span className="text-slate-200">{severityLabel[selectedMessage.severity]} risk</span>
                      <span className="text-slate-500">• {selectedMessage.riskScore}/100</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <div className="text-slate-500">From</div>
                        <div className="text-slate-100 break-all">{selectedMessage.senderEmail}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">To</div>
                        <div className="text-slate-100 break-all">{selectedMessage.recipients.join(', ')}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Time</div>
                        <div className="text-slate-100">{new Date(selectedMessage.quarantineTimestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  </section>
                  <section className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-300">Detection Reasons</div>
                    <div className="space-y-1">
                      {selectedMessage.detectionReasons.map((reason, idx) => (
                        <div key={idx} className="text-slate-200">{reason}</div>
                      ))}
                    </div>
                  </section>
                  {selectedMessage.bodyPreview && (
                    <section className="space-y-2">
                      <div className="text-[11px] font-semibold text-slate-300">Preview</div>
                      <p className="text-slate-200 leading-relaxed text-xs">{selectedMessage.bodyPreview}</p>
                    </section>
                  )}
                  <section className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-300">Actions</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleReleaseSingle(selectedMessage)}
                        className="inline-flex items-center gap-1 rounded-md bg-teal-500 text-slate-950 text-[11px] font-medium px-3 py-1.5 hover:bg-teal-400"
                      >
                        ✅ Release
                      </button>
                      <button
                        onClick={() => handleDeleteSingle(selectedMessage)}
                        className="inline-flex items-center gap-1 rounded-md bg-red-500/10 border border-red-500/60 text-red-200 text-[11px] font-medium px-3 py-1.5 hover:bg-red-500/20"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

