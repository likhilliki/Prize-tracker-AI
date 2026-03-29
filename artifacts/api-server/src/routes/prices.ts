import { Router, type IRouter } from "express";
import { TrackPricesBody } from "@workspace/api-zod";
import { runPriceAgent, jobs } from "../lib/priceAgent";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.post("/track", async (req, res) => {
  const parsed = TrackPricesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body. 'product' is required." });
    return;
  }

  const { product } = parsed.data;
  const jobId = randomUUID();

  jobs.set(jobId, {
    jobId,
    status: "pending",
    product,
    progress: "Starting price tracking agent...",
  });

  runPriceAgent(jobId, product).catch((err) => {
    req.log.error({ err }, "Price agent failed");
    const job = jobs.get(jobId);
    if (job) {
      job.status = "error";
      job.error = err instanceof Error ? err.message : String(err);
    }
  });

  res.json({
    product,
    results: [],
    jobId,
  });
});

router.get("/track/status/:jobId", (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(job);
});

export default router;
