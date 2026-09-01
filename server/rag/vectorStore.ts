/**
 * Retrieval-Augmented Generation (RAG) Vector Store & Semantic Retrieval Engine.
 * Parses document corpus into indexed chunks with metadata (Document ID, Title, Page, Section).
 * Produces structured Evidence records with strict citations.
 */

import { EvidenceRecord } from '../types.js';
import { GOLDEN_DOCUMENTS, GoldenDocument } from '../data/goldenData.js';
import { db } from '../db.js';

export interface DocumentChunk {
  id: string;
  docId: string;
  ticker: string;
  docTitle: string;
  docType: string;
  quarter: string;
  pageNumber: number;
  section: string;
  content: string;
  vector: number[];
}

export class VectorStore {
  private chunks: DocumentChunk[] = [];
  private vocabulary: Map<string, number> = new Map();

  constructor() {
    this.ingestAndIndexDocuments(GOLDEN_DOCUMENTS);
  }

  /**
   * Tokenize text and build vector representation
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  private buildVector(tokens: string[]): number[] {
    const vec: number[] = new Array(this.vocabulary.size).fill(0);
    for (const t of tokens) {
      const idx = this.vocabulary.get(t);
      if (idx !== undefined) {
        vec[idx] += 1;
      }
    }
    // Normalize vector
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < vec.length; i++) vec[i] /= norm;
    }
    return vec;
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dot = 0;
    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
      dot += vecA[i] * vecB[i];
    }
    return dot;
  }

  /**
   * Ingest documents, chunk by section/page, and build semantic vector indices
   */
  public ingestAndIndexDocuments(docs: GoldenDocument[]) {
    // 1. Build vocabulary
    const allTokens: Set<string> = new Set();
    for (const doc of docs) {
      for (const page of doc.pages) {
        const tokens = this.tokenize(`${doc.title} ${page.section} ${page.content}`);
        for (const t of tokens) allTokens.add(t);
      }
    }

    this.vocabulary.clear();
    let idx = 0;
    for (const t of allTokens) {
      this.vocabulary.set(t, idx++);
    }

    // 2. Index chunks
    this.chunks = [];
    let chunkCounter = 1;
    for (const doc of docs) {
      for (const page of doc.pages) {
        const chunkTokens = this.tokenize(`${doc.title} ${page.section} ${page.content}`);
        const vector = this.buildVector(chunkTokens);
        const chunkId = `E${chunkCounter++}`;

        const chunk: DocumentChunk = {
          id: chunkId,
          docId: doc.id,
          ticker: doc.ticker,
          docTitle: doc.title,
          docType: doc.docType,
          quarter: doc.quarter,
          pageNumber: page.pageNumber,
          section: page.section,
          content: page.content,
          vector
        };

        this.chunks.push(chunk);

        // Also register in DB
        db.addEvidence({
          id: chunkId,
          document: doc.title,
          ticker: doc.ticker,
          page: page.pageNumber,
          section: page.section,
          text: page.content,
          relevanceScore: 1.0,
          timestamp: doc.filingDate
        });
      }
    }
  }

  /**
   * Semantic Vector Retrieval
   */
  public search(ticker: string, query: string, topK: number = 4): EvidenceRecord[] {
    const queryTokens = this.tokenize(query);
    const queryVec = this.buildVector(queryTokens);
    const targetTicker = ticker.toUpperCase();

    const scored = this.chunks
      .filter(c => c.ticker === targetTicker)
      .map(chunk => {
        const sim = this.cosineSimilarity(queryVec, chunk.vector);
        // Boost if query keywords match section or text
        let keywordBoost = 0;
        const lowerContent = chunk.content.toLowerCase();
        for (const t of queryTokens) {
          if (lowerContent.includes(t)) keywordBoost += 0.05;
        }
        const score = Math.min(0.99, Math.max(0.1, sim + keywordBoost));

        return {
          chunk,
          score: Math.round(score * 100) / 100
        };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, topK).map(item => ({
      id: item.chunk.id,
      document: item.chunk.docTitle,
      ticker: item.chunk.ticker,
      page: item.chunk.pageNumber,
      section: item.chunk.section,
      text: item.chunk.content,
      relevanceScore: item.score,
      timestamp: item.chunk.quarter
    }));
  }

  public getAllChunks(ticker?: string): DocumentChunk[] {
    if (ticker) {
      return this.chunks.filter(c => c.ticker === ticker.toUpperCase());
    }
    return this.chunks;
  }
}

export const vectorStore = new VectorStore();
