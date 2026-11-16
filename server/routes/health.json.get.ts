import { defineEventHandler, setHeader } from "h3";
import { getHealthReport } from "../utils/health";

export default defineEventHandler((event) => {
  setHeader(event, "content-type", "application/json; charset=utf-8");
  return getHealthReport();
});
