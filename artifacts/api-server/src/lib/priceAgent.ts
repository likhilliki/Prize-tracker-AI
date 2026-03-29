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

const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;

const SITES = [
  {
    name: "Amazon",
    url: "https://www.amazon.com",
    searchUrl: (product: string) =>
      `https://www.amazon.com/s?k=${encodeURIComponent(product)}`,
  },
  {
    name: "Flipkart",
    url: "https://www.flipkart.com",
    searchUrl: (product: string) =>
      `https://www.flipkart.com/search?q=${encodeURIComponent(product)}`,
  },
  {
    name: "Walmart",
    url: "https://www.walmart.com",
    searchUrl: (product: string) =>
      `https://www.walmart.com/search?q=${encodeURIComponent(product)}`,
  },
  {
    name: "BestBuy",
    url: "https://www.bestbuy.com",
    searchUrl: (product: string) =>
      `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(product)}`,
  },
];

async function runTinyfishTask(taskDescription: string): Promise<string> {
  if (!TINYFISH_API_KEY) {
    throw new Error("TINYFISH_API_KEY is not set");
  }

  const response = await fetch("https://api.tinyfish.io/api/v1/agent/task", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TINYFISH_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task: taskDescription,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TinyFish API error ${response.status}: ${errorText}`);
  }

  const data = await response.json() as { result?: string; output?: string; response?: string; message?: string };
  return data.result ?? data.output ?? data.response ?? data.message ?? JSON.stringify(data);
}

function parsePriceFromAgentOutput(output: string, site: string): PriceResult {
  try {
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Partial<PriceResult>;
      return {
        site,
        title: parsed.title,
        price: parsed.price,
        link: parsed.link,
      };
    }

    const titleMatch = output.match(/title[:\s]+["']?([^"'\n,}]+)["']?/i);
    const priceMatch = output.match(/price[:\s]+["']?(\$?[\d,]+\.?\d*[^\s"'\n,}]*)["']?/i);
    const linkMatch = output.match(/link[:\s]+["']?(https?:\/\/[^\s"'\n,}]+)["']?/i);

    if (priceMatch || titleMatch) {
      return {
        site,
        title: titleMatch?.[1]?.trim(),
        price: priceMatch?.[1]?.trim(),
        link: linkMatch?.[1]?.trim(),
      };
    }

    return { site, error: "Could not parse results from agent output" };
  } catch {
    return { site, error: "Failed to parse agent output" };
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
    logger.info({ jobId, site: site.name, product }, "Searching site");

    try {
      const task = `
Go to ${site.searchUrl(product)} and find the first product result for "${product}".
Extract the following information:
- title: the exact product title of the first result
- price: the price of the first result (include currency symbol like $)
- link: the full URL to the product page

Respond ONLY with valid JSON in this exact format:
{"title": "product title here", "price": "$999.99", "link": "https://..."}

If you cannot find a price, respond with:
{"title": null, "price": null, "link": null, "error": "reason"}
`;

      const output = await runTinyfishTask(task);
      const result = parsePriceFromAgentOutput(output, site.name);
      results.push(result);
      logger.info({ jobId, site: site.name, result }, "Got price result");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error({ jobId, site: site.name, err }, "Failed to get price from site");
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
