export function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ];
  const blob = new Blob(["\ufeff" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJobReportTxt(job, companyName, applicantCount) {
  const reqs = (job.requirements || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  const text = `
JOB REPORT — ${job.title}
Company: ${companyName}
Location: ${job.location}
Type: ${job.type}
Status: ${job.status}
Deadline: ${job.applicationDeadline}
Applications: ${applicantCount}

Requirements:
${reqs.map((r) => `- ${r}`).join("\n")}
  `.trim();
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `job_${job.id}_report.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
