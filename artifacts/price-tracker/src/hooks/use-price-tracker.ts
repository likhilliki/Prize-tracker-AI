import { useState, useCallback } from "react";
import { useTrackPrices, useGetTrackStatus } from "@workspace/api-client-react";
import type { TrackResponse, JobStatus } from "@workspace/api-client-react/src/generated/api.schemas";

export function usePriceTracker() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [productQuery, setProductQuery] = useState<string>("");
  const [finalResult, setFinalResult] = useState<TrackResponse | null>(null);

  const trackMutation = useTrackPrices({
    mutation: {
      onSuccess: (data) => {
        if (data.jobId) {
          setJobId(data.jobId);
        } else if (data.results) {
          // Fallback if API is synchronous and returns results directly
          setFinalResult(data);
          setJobId(null);
        }
      },
      onError: () => {
        setJobId(null);
      }
    }
  });

  const statusQuery = useGetTrackStatus(jobId || "", {
    query: {
      enabled: !!jobId,
      // Refetch every 2 seconds while running
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (status === "done" || status === "error") {
          return false; // stop polling
        }
        return 2000;
      },
    }
  });

  // Sync the final result when status hits 'done'
  if (
    statusQuery.data?.status === "done" && 
    statusQuery.data.result && 
    !finalResult
  ) {
    setFinalResult(statusQuery.data.result);
  }

  const startTracking = useCallback((product: string) => {
    setProductQuery(product);
    setFinalResult(null);
    setJobId(null);
    trackMutation.mutate({ data: { product } });
  }, [trackMutation]);

  const reset = useCallback(() => {
    setProductQuery("");
    setJobId(null);
    setFinalResult(null);
    trackMutation.reset();
  }, [trackMutation]);

  // Derived state
  const isTracking = trackMutation.isPending || 
    (statusQuery.isFetching && statusQuery.data?.status !== "done" && statusQuery.data?.status !== "error");
  
  const hasError = trackMutation.isError || statusQuery.data?.status === "error";
  const errorMessage = trackMutation.error?.message || statusQuery.data?.error || "An unexpected error occurred.";
  
  const currentProgress = statusQuery.data?.progress || "Initializing AI agent...";

  return {
    startTracking,
    reset,
    productQuery,
    isTracking,
    hasError,
    errorMessage,
    currentProgress,
    finalResult,
    jobId,
    statusData: statusQuery.data
  };
}
