import type { LoggerStatus } from "@/types/inventory";

/** Schema uses `ready`; treated as "available" for pairing in the admin UI. */
export const AVAILABLE_LOGGER_STATUS: LoggerStatus = "ready";

export const PAIRED_LOGGER_STATUS: LoggerStatus = "active";
