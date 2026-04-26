export function deadlinePassed(deadlineStr) {
  if (!deadlineStr) return false;
  const end = new Date(deadlineStr + "T23:59:59.999Z");
  return end < new Date();
}

/** Display badge: Expired = auto-closed after deadline */
export function getJobDisplayStatus(job) {
  if (job.status === "draft") return { badge: "Draft", variant: "draft" };
  if (job.status === "closed" && job.closedReason === "deadline") {
    return { badge: "Expired", variant: "expired" };
  }
  if (job.status === "closed") return { badge: "Closed", variant: "closed" };
  if (job.status === "published" && deadlinePassed(job.applicationDeadline)) {
    return { badge: "Expired", variant: "expired" };
  }
  if (job.status === "published") return { badge: "Active", variant: "active" };
  return { badge: job.status, variant: "draft" };
}

export function isJobAcceptingApplications(job) {
  if (job.status !== "published") return false;
  if (deadlinePassed(job.applicationDeadline)) return false;
  return true;
}
