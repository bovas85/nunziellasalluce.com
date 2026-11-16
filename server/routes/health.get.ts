import { defineEventHandler, getQuery, getRequestHeader, setHeader } from "h3";
import { getHealthReport, renderHealthHtml } from "../utils/health";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const accept = getRequestHeader(event, "accept") || "";
  const report = getHealthReport();

  if (query.format === "json" || accept.includes("application/json")) {
    setHeader(event, "content-type", "application/json; charset=utf-8");
    return report;
  }

  setHeader(event, "content-type", "text/html; charset=utf-8");
  return renderHealthHtml(report);
});
