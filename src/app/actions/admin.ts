"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  AVAILABLE_LOGGER_STATUS,
  PAIRED_LOGGER_STATUS,
} from "@/lib/inventory/constants";
import type {
  AvailableLoggerOption,
  CarrierOption,
  InventoryActionState,
  InventoryData,
  LoggerRow,
  LoggerStatus,
  StackRow,
  StackStatus,
} from "@/types/inventory";
import { createClient } from "@/utils/supabase/server";

const INVENTORY_PATH = "/admin/stacks-loggers";

const STACK_STATUSES: StackStatus[] = [
  "warehouse",
  "cleaning",
  "active",
  "ready",
  "maintenance",
];

const LOGGER_STATUSES: LoggerStatus[] = [
  "warehouse",
  "maintenance",
  "active",
  "ready",
];

function isStackStatus(value: string): value is StackStatus {
  return STACK_STATUSES.includes(value as StackStatus);
}

function isLoggerStatus(value: string): value is LoggerStatus {
  return LOGGER_STATUSES.includes(value as LoggerStatus);
}

function normalizeSerial(serial: string): string {
  return serial.trim();
}

function formatCarrierLabel(profile: {
  id: string;
  full_name: string | null;
  email: string | null;
}): string {
  const name = profile.full_name?.trim();
  if (name && profile.email) {
    return `${name} (${profile.email})`;
  }
  return name ?? profile.email ?? profile.id.slice(0, 8);
}

export async function getInventoryData(): Promise<InventoryData> {
  await requireAdmin();
  const supabase = await createClient();

  const [stacksResult, loggersResult, carriersResult] = await Promise.all([
    supabase
      .from("stacks")
      .select(
        "id, serial, status, created_at, current_logger_id, carrier_id"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("loggers")
      .select("id, serial, status, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "carrier")
      .order("full_name", { ascending: true }),
  ]);

  if (stacksResult.error) {
    throw new Error(stacksResult.error.message);
  }

  if (loggersResult.error) {
    throw new Error(loggersResult.error.message);
  }

  if (carriersResult.error) {
    throw new Error(carriersResult.error.message);
  }

  const stacksWithPairing = await supabase
    .from("stacks")
    .select("id, serial, current_logger_id")
    .not("current_logger_id", "is", null);

  const loggerToStack = new Map<string, { id: string; serial: string }>();

  if (!stacksWithPairing.error && stacksWithPairing.data) {
    for (const stack of stacksWithPairing.data) {
      if (stack.current_logger_id) {
        loggerToStack.set(stack.current_logger_id, {
          id: stack.id,
          serial: stack.serial,
        });
      }
    }
  }

  const carrierLabels = new Map<string, string>();
  const carriers: CarrierOption[] = (carriersResult.data ?? []).map(
    (carrier) => {
      const label = formatCarrierLabel(carrier);
      carrierLabels.set(carrier.id, label);
      return { id: carrier.id, label };
    }
  );

  const loggerSerialById = new Map(
    (loggersResult.data ?? []).map((logger) => [logger.id, logger.serial])
  );

  const stacks: StackRow[] = (stacksResult.data ?? []).map((stack) => ({
    id: stack.id,
    serial: stack.serial,
    status: stack.status as StackStatus,
    carrier_id: stack.carrier_id ?? null,
    carrier_label: stack.carrier_id
      ? (carrierLabels.get(stack.carrier_id) ?? stack.carrier_id.slice(0, 8))
      : null,
    current_logger_id: stack.current_logger_id ?? null,
    paired_logger_serial: stack.current_logger_id
      ? (loggerSerialById.get(stack.current_logger_id) ?? null)
      : null,
    created_at: stack.created_at,
  }));

  const loggers: LoggerRow[] = (loggersResult.data ?? []).map((logger) => {
    const paired = loggerToStack.get(logger.id);

    return {
      id: logger.id,
      serial: logger.serial,
      status: logger.status as LoggerStatus,
      paired_stack_id: paired?.id ?? null,
      paired_stack_serial: paired?.serial ?? null,
      created_at: logger.created_at,
    };
  });

  const availableLoggers: AvailableLoggerOption[] = loggers
    .filter(
      (logger) =>
        logger.status === AVAILABLE_LOGGER_STATUS && !logger.paired_stack_id
    )
    .map((logger) => ({
      id: logger.id,
      serial: logger.serial,
      status: logger.status,
    }));

  return { stacks, loggers, carriers, availableLoggers };
}

export async function createStack(
  serial: string
): Promise<InventoryActionState> {
  const normalized = normalizeSerial(serial);

  if (!normalized) {
    return { error: "Serial number is required." };
  }

  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("stacks").insert({
    serial: normalized,
    status: "ready",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(INVENTORY_PATH);
  return { success: "Stack created successfully." };
}

export async function createLogger(
  serial: string
): Promise<InventoryActionState> {
  const normalized = normalizeSerial(serial);

  if (!normalized) {
    return { error: "Serial number is required." };
  }

  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("loggers").insert({
    serial: normalized,
    status: "ready",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(INVENTORY_PATH);
  return { success: "Logger created successfully." };
}

export async function updateStackStatus(
  id: string,
  status: string
): Promise<InventoryActionState> {
  if (!id) {
    return { error: "Stack ID is required." };
  }

  if (!isStackStatus(status)) {
    return { error: "Invalid stack status." };
  }

  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("stacks")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(INVENTORY_PATH);
  return { success: "Stack status updated." };
}

export async function updateLoggerStatus(
  id: string,
  status: string
): Promise<InventoryActionState> {
  if (!id) {
    return { error: "Logger ID is required." };
  }

  if (!isLoggerStatus(status)) {
    return { error: "Invalid logger status." };
  }

  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("loggers")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(INVENTORY_PATH);
  return { success: "Logger status updated." };
}

export async function pairLoggerToStack(
  stackId: string,
  loggerId: string
): Promise<InventoryActionState> {
  if (!stackId || !loggerId) {
    return { error: "Stack and logger are required." };
  }

  await requireAdmin();
  const supabase = await createClient();

  const { data: stack, error: stackError } = await supabase
    .from("stacks")
    .select("id, current_logger_id")
    .eq("id", stackId)
    .single();

  if (stackError || !stack) {
    return { error: "Stack not found." };
  }

  if (stack.current_logger_id) {
    return { error: "Stack already has a logger paired." };
  }

  const { data: logger, error: loggerError } = await supabase
    .from("loggers")
    .select("id, status")
    .eq("id", loggerId)
    .single();

  if (loggerError || !logger) {
    return { error: "Logger not found." };
  }

  if (logger.status !== AVAILABLE_LOGGER_STATUS) {
    return {
      error: `Logger must be in "${AVAILABLE_LOGGER_STATUS}" (available) status to pair.`,
    };
  }

  const { data: existingPair } = await supabase
    .from("stacks")
    .select("id")
    .eq("current_logger_id", loggerId)
    .maybeSingle();

  if (existingPair) {
    return { error: "Logger is already paired to another stack." };
  }

  const { error: stackUpdateError } = await supabase
    .from("stacks")
    .update({ current_logger_id: loggerId })
    .eq("id", stackId);

  if (stackUpdateError) {
    return { error: stackUpdateError.message };
  }

  const { error: loggerUpdateError } = await supabase
    .from("loggers")
    .update({ status: PAIRED_LOGGER_STATUS })
    .eq("id", loggerId);

  if (loggerUpdateError) {
    await supabase
      .from("stacks")
      .update({ current_logger_id: null })
      .eq("id", stackId);

    return { error: loggerUpdateError.message };
  }

  revalidatePath(INVENTORY_PATH);
  return { success: "Logger paired to stack." };
}

export async function unpairLoggerFromStack(
  stackId: string,
  loggerId: string
): Promise<InventoryActionState> {
  if (!stackId || !loggerId) {
    return { error: "Stack and logger are required." };
  }

  await requireAdmin();
  const supabase = await createClient();

  const { data: stack, error: stackError } = await supabase
    .from("stacks")
    .select("id, current_logger_id")
    .eq("id", stackId)
    .single();

  if (stackError || !stack) {
    return { error: "Stack not found." };
  }

  if (stack.current_logger_id !== loggerId) {
    return { error: "Logger is not paired to this stack." };
  }

  const { error: stackUpdateError } = await supabase
    .from("stacks")
    .update({ current_logger_id: null })
    .eq("id", stackId);

  if (stackUpdateError) {
    return { error: stackUpdateError.message };
  }

  const { error: loggerUpdateError } = await supabase
    .from("loggers")
    .update({ status: AVAILABLE_LOGGER_STATUS })
    .eq("id", loggerId);

  if (loggerUpdateError) {
    return { error: loggerUpdateError.message };
  }

  revalidatePath(INVENTORY_PATH);
  return { success: "Logger unpaired from stack." };
}

export async function assignStackToCarrier(
  stackId: string,
  carrierId: string
): Promise<InventoryActionState> {
  if (!stackId || !carrierId) {
    return { error: "Stack and carrier are required." };
  }

  await requireAdmin();
  const supabase = await createClient();

  const { data: carrier, error: carrierError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", carrierId)
    .single();

  if (carrierError || !carrier) {
    return { error: "Carrier not found." };
  }

  if (carrier.role !== "carrier") {
    return { error: "Selected profile is not a carrier." };
  }

  const { error } = await supabase
    .from("stacks")
    .update({
      carrier_id: carrierId,
      status: "active",
    })
    .eq("id", stackId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(INVENTORY_PATH);
  return { success: "Carrier assigned to stack." };
}

export async function unassignStackFromCarrier(
  stackId: string
): Promise<InventoryActionState> {
  if (!stackId) {
    return { error: "Stack ID is required." };
  }

  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("stacks")
    .update({
      carrier_id: null,
      status: "cleaning",
    })
    .eq("id", stackId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(INVENTORY_PATH);
  return { success: "Carrier unassigned from stack." };
}
