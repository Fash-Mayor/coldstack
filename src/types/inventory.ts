export type StackStatus =
  | "warehouse"
  | "cleaning"
  | "active"
  | "ready"
  | "maintenance";

export type LoggerStatus = "warehouse" | "maintenance" | "active" | "ready";

export type CarrierOption = {
  id: string;
  label: string;
};

export type AvailableLoggerOption = {
  id: string;
  serial: string;
  status: LoggerStatus;
};

export type StackRow = {
  id: string;
  serial: string;
  status: StackStatus;
  carrier_id: string | null;
  carrier_label: string | null;
  current_logger_id: string | null;
  paired_logger_serial: string | null;
  created_at: string;
};

export type LoggerRow = {
  id: string;
  serial: string;
  status: LoggerStatus;
  paired_stack_id: string | null;
  paired_stack_serial: string | null;
  created_at: string;
};

export type InventoryData = {
  stacks: StackRow[];
  loggers: LoggerRow[];
  carriers: CarrierOption[];
  availableLoggers: AvailableLoggerOption[];
};

export type InventoryActionState = {
  error?: string;
  success?: string;
};
