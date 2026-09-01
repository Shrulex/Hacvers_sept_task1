import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Check, 
  Filter,
  Layers,
  Calendar
} from 'lucide-react';
import { EvidenceRecord } from '../types';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceList: EvidenceRecord[];
  selectedEvidenceId?: string | null;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  evidenceList,
  selectedEvidenceId
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = evidenceList.filter(e => 
    e.document.toLowerCase().includes(filterQuery.toLowerCase()) ||
    e.section.toLowerCase().includes(filterQuery.toLowerCase()) ||
    e.text.toLowerCase().includes(filterQuery.toLowerCase()) ||
    e.id.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-xl bg-[#0D1321] shadow-2xl overflow-hidden border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-[#0B0F1A]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Verified Regulatory Filings & Transcripts</h3>
              <p className="text-[10px] text-slate-500 font-mono">SEBI LODR Reg 33 Disclosures & Earnings Transcripts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Search Bar */}
        <div className="border-b border-slate-800 px-6 py-3 bg-[#0D1321] flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search across filing sections, keywords, or evidence IDs (e.g. E1, margin, TCV)..."
              className="h-8 w-full rounded-lg border border-slate-700 bg-slate-800 pl-8 pr-3 text-xs font-mono text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
            Showing {filtered.length} of {evidenceList.length} evidence passages
          </span>
        </div>

        {/* Evidence List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#0B0F1A]">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              No evidence matching search criteria.
            </div>
          ) : (
            filtered.map((ev) => {
              const isTargeted = selectedEvidenceId === ev.id;
              return (
                <div
                  key={ev.id}
                  id={`evidence_card_${ev.id}`}
                  className={`rounded-lg border p-3.5 transition-all ${
                    isTargeted
                      ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500'
                      : 'border-slate-800 bg-[#161F32] hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-xs font-mono font-bold text-indigo-300">
                        [{ev.id}]
                      </span>
                      <span className="text-xs font-bold text-slate-200">{ev.document}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                        Page {ev.page} • {ev.section}
                      </span>
                      <button
                        onClick={() => handleCopy(ev.id, ev.text)}
                        className="flex items-center gap-1 rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                      >
                        {copiedId === ev.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-[#0B0F1A] p-3 rounded-md border border-slate-800 font-mono">
                    "{ev.text}"
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      Filing Date / Period: {ev.timestamp}
                    </span>
                    <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                      Relevance: {Math.round(ev.relevanceScore * 100)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 px-6 py-3 bg-[#0D1321] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">
            Strict RAG Citation Standard: Document claims in the Fundamental view are strictly tied to these verified passages.
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-1.5 text-xs font-semibold text-white transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
