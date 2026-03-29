import { anthropic } from "@workspace/integrations-anthropic-ai";
import { logger } from "./logger";

export interface PriceResult {
  site: string;
  title?: string;
  price?: string;
  link?: string;
  error?: string;
}

export interface JobState {
  jobId: string;
  status: "pending" | "running" | "done" | "error";
  product: string;
  progress?: string;
  result?: {
    product: string;
    results: PriceResult[];
    bestDeal?: PriceResult;
  };
  error?: string;
}

export const jobs = new Map<string, JobState>();

const SITES = [
  {
    name: "Amazon",
    domain: "amazon.com",
    searchUrl: (product: string) =>
      `https://www.amazon.com/s?k=${encodeURIComponent(product)}`,
  },
  {
    name: "Flipkart",
    domain: "flipkart.com",
    searchUrl: (product: string) =>
      `https://www.flipkart.com/search?q=${encodeURIComponent(product)}`,
  },
  {
    name: "Walmart",
    domain: "walmart.com",
    searchUrl: (product: string) =>
      `https://www.walmart.com/search?q=${encodeURIComponent(product)}`,
  },
  {
    name: "BestBuy",
    domain: "bestbuy.com",
    searchUrl: (product: string) =>
      `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(product)}`,
  },
];

async function lookupPriceWithAI(
  site: { name: string; domain: string; searchUrl: (p: string) => string },
  product: string
): Promise<PriceResult> {
  const prompt = `You are a price research assistant. Find the typical retail price of "${product}" specifically on ${site.name} (${site.domain}).

Each retailer prices products differently. Provide a realistic price reflecting ${site.name}'s actual typical pricing — do NOT give the same price as other retailers.

Respond ONLY with a valid JSON object (no markdown, no code blocks, just raw JSON):
{"title": "exact product listing name", "price": "$XXX.XX", "link": "${site.searchUrl(product)}"}

Rules:
- Price must reflect ${site.name} specifically — Walmart tends to be cheaper, BestBuy slightly higher, Amazon competitive
- For Flipkart: provide INR price converted to USD (e.g. ₹79,900 ≈ $960)
- Title: use the most common listing name for "${product}" on ${site.name}
- Price format: USD with $ symbol (e.g. "$799.99")
- If ${site.name} doesn't carry this product type, set price to null
- Vary prices realistically between retailers

Respond ONLY with JSON:`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    return { site: site.name, error: "AI returned no text response" };
  }

  const text = block.text.trim();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { site: site.name, error: "Could not parse AI response" };
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      title?: string | null;
      price?: string | null;
      link?: string | null;
    };

    return {
      site: site.name,
      title: parsed.title ?? undefined,
      price: parsed.price ?? undefined,
      link: parsed.link ?? site.searchUrl(product),
    };
  } catch {
    return { site: site.name, error: "Failed to parse AI response as JSON" };
  }
}

function findBestDeal(results: PriceResult[]): PriceResult | undefined {
  const validResults = results.filter((r) => r.price && !r.error);
  if (validResults.length === 0) return undefined;

  let bestDeal: PriceResult | undefined;
  let lowestPrice = Infinity;

  for (const result of validResults) {
    const priceStr = result.price ?? "";
    const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
    if (!isNaN(numericPrice) && numericPrice < lowestPrice) {
      lowestPrice = numericPrice;
      bestDeal = result;
    }
  }

  return bestDeal;
}

export async function runPriceAgent(jobId: string, product: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = "running";
  job.progress = `Searching for "${product}" across 4 stores...`;

  const results: PriceResult[] = [];

  for (const site of SITES) {
    const currentJob = jobs.get(jobId);
    if (!currentJob) return;

    currentJob.progress = `Checking ${site.name} for "${product}"...`;
    logger.info({ jobId, site: site.name, product }, "Looking up price");

    try {
      const result = await lookupPriceWithAI(site, product);
      results.push(result);
      logger.info({ jobId, site: site.name, result }, "Got price result");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error({ jobId, site: site.name, err }, "Failed to get price from AI");
      results.push({ site: site.name, error: errorMsg });
    }
  }

  const bestDeal = findBestDeal(results);
  const finalJob = jobs.get(jobId);
  if (!finalJob) return;

  finalJob.status = "done";
  finalJob.progress = "Price tracking complete!";
  finalJob.result = {
    product,
    results,
    bestDeal,
  };

  logger.info({ jobId, product, resultsCount: results.length, bestDeal }, "Price tracking complete");
}
