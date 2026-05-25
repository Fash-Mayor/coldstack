"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { geographyFromUnknown } from "@/lib/operations/geo";
import { TRIPS_PATH } from "@/lib/operations/constants";
import type { CarrierOption } from "@/types/inventory";
import type {
  ConsigneeOption,
  CreateTripInput,
  OperationsActionState,
  OperationsData,
  PocCertificateSummary,
  ShipperOption,
  TripRow,
  TripStatus,
} from "@/types/operations";
import { createClient } from "@/utils/supabase/server";

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

function formatOriginDestination(
  nameSnapshot: string | null,
  addressSnapshot: string | null
): string {
  if (nameSnapshot && addressSnapshot) {
    return `${nameSnapshot} — ${addressSnapshot}`;
  }
  return nameSnapshot ?? addressSnapshot ?? "—";
}

export async function getOperationsData(): Promise<OperationsData> {
  await requireAdmin();
  const supabase = await createClient();

  const [tripsResult, shippersResult, consigneesResult, carriersResult, pocsResult] =
    await Promise.all([
      supabase
        .from("trips")
        .select(
          "id, status, target_temp, type_of_goods, created_at, completed_at, origin_name_snapshot, dest_name_snapshot, origin_address_snapshot, destination_address_snapshot, carrier_id, stack_id"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("shippers")
        .select("id, name, location_name")
        .order("name", { ascending: true }),
      supabase
        .from("consignees")
        .select("id, name, delivery_location_name")
        .order("name", { ascending: true }),
      supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "carrier")
        .order("full_name", { ascending: true }),
      supabase
        .from("poc_certificates")
        .select("id, trip_id, pdf_url, verified_by_receiver, generated_at"),
    ]);

  if (tripsResult.error) {
    throw new Error(tripsResult.error.message);
  }

  if (shippersResult.error) {
    throw new Error(shippersResult.error.message);
  }

  if (consigneesResult.error) {
    throw new Error(consigneesResult.error.message);
  }

  if (carriersResult.error) {
    throw new Error(carriersResult.error.message);
  }

  const pocByTrip = new Map<string, PocCertificateSummary>();
  if (!pocsResult.error && pocsResult.data) {
    for (const poc of pocsResult.data) {
      pocByTrip.set(poc.trip_id, poc as PocCertificateSummary);
    }
  }

  const shippers: ShipperOption[] = (shippersResult.data ?? []).map((shipper) => ({
    id: shipper.id,
    label: `${shipper.name} - ${shipper.location_name}`,
  }));

  const consignees: ConsigneeOption[] = (consigneesResult.data ?? []).map(
    (consignee) => ({
      id: consignee.id,
      label: `${consignee.name} - ${consignee.delivery_location_name}`,
    })
  );

  const carriers: CarrierOption[] = (carriersResult.data ?? []).map((carrier) => ({
    id: carrier.id,
    label: formatCarrierLabel(carrier),
  }));

  const carrierNameById = new Map(
    (carriersResult.data ?? []).map((carrier) => [
      carrier.id,
      formatCarrierLabel(carrier),
    ])
  );

  const carrierIds = [
    ...new Set(
      (tripsResult.data ?? [])
        .map((trip) => trip.carrier_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const stackIds = [
    ...new Set(
      (tripsResult.data ?? [])
        .map((trip) => trip.stack_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const stackSerialById = new Map<string, string>();

  if (stackIds.length > 0) {
    const { data: stacksData, error: stacksError } = await supabase
      .from("stacks")
      .select("id, serial")
      .in("id", stackIds);

    if (stacksError) {
      throw new Error(stacksError.message);
    }

    for (const stack of stacksData ?? []) {
      stackSerialById.set(stack.id, stack.serial);
    }
  }

  if (carrierIds.length > 0) {
    const missingCarrierIds = carrierIds.filter((id) => !carrierNameById.has(id));
    if (missingCarrierIds.length > 0) {
      const { data: extraCarriers } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", missingCarrierIds);

      for (const carrier of extraCarriers ?? []) {
        carrierNameById.set(carrier.id, formatCarrierLabel(carrier));
      }
    }
  }

  const trips: TripRow[] = (tripsResult.data ?? []).map((trip) => ({
    id: trip.id,
    status: trip.status as TripStatus,
    origin_label: formatOriginDestination(
      trip.origin_name_snapshot,
      trip.origin_address_snapshot
    ),
    destination_label: formatOriginDestination(
      trip.dest_name_snapshot,
      trip.destination_address_snapshot
    ),
    target_temp: trip.target_temp ?? 0,
    type_of_goods: trip.type_of_goods ?? "unknown",
    carrier_name: trip.carrier_id
      ? (carrierNameById.get(trip.carrier_id) ?? null)
      : null,
    stack_serial: trip.stack_id
      ? (stackSerialById.get(trip.stack_id) ?? null)
      : null,
    created_at: trip.created_at,
    completed_at: trip.completed_at,
    poc: pocByTrip.get(trip.id) ?? null,
  }));

  return { trips, shippers, consignees, carriers };
}

export async function createTrip(
  data: CreateTripInput
): Promise<OperationsActionState> {
  const { shipperId, consigneeId, targetTemp, tolerance, typeOfGoods } = data;

  if (!shipperId || !consigneeId) {
    return { error: "Origin and destination are required." };
  }

  if (!typeOfGoods.trim()) {
    return { error: "Type of goods is required." };
  }

  if (Number.isNaN(targetTemp)) {
    return { error: "Target temperature must be a valid number." };
  }

  if (Number.isNaN(tolerance)) {
    return { error: "Tolerance must be a valid number." };
  }

  await requireAdmin();
  const supabase = await createClient();

  const [shipperResult, consigneeResult] = await Promise.all([
    supabase
      .from("shippers")
      .select("id, name, location_name, address, coords")
      .eq("id", shipperId)
      .single(),
    supabase
      .from("consignees")
      .select("id, name, delivery_location_name, address, coords")
      .eq("id", consigneeId)
      .single(),
  ]);

  if (shipperResult.error || !shipperResult.data) {
    return { error: "Shipper not found." };
  }

  if (consigneeResult.error || !consigneeResult.data) {
    return { error: "Consignee not found." };
  }

  const shipper = shipperResult.data;
  const consignee = consigneeResult.data;

  const originCoords = geographyFromUnknown(shipper.coords);
  const destinationCoords = geographyFromUnknown(consignee.coords);

  const { error } = await supabase.from("trips").insert({
    shipper_id: shipper.id,
    consignee_id: consignee.id,
    status: "pending",
    target_temp: targetTemp,
    tolerance,
    type_of_goods: typeOfGoods.trim(),
    origin_name_snapshot: shipper.name,
    dest_name_snapshot: consignee.name,
    origin_address_snapshot: `${shipper.location_name} — ${shipper.address}`,
    destination_address_snapshot: `${consignee.delivery_location_name} — ${consignee.address}`,
    origin_coords_snapshot: originCoords,
    destination_coords_snapshot: destinationCoords,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(TRIPS_PATH);
  return { success: "Trip created successfully." };
}

export async function assignCarrierToTrip(
  tripId: string,
  carrierId: string
): Promise<OperationsActionState> {
  if (!tripId || !carrierId) {
    return { error: "Trip and carrier are required." };
  }

  await requireAdmin();
  const supabase = await createClient();

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, status")
    .eq("id", tripId)
    .single();

  if (tripError || !trip) {
    return { error: "Trip not found." };
  }

  if (trip.status !== "pending") {
    return { error: "Only pending trips can be assigned a carrier." };
  }

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

  const { data: stack, error: stackError } = await supabase
    .from("stacks")
    .select("id, serial")
    .eq("carrier_id", carrierId)
    .maybeSingle();

  if (stackError) {
    return { error: stackError.message };
  }

  if (!stack) {
    return {
      error:
        "No stack is assigned to this carrier. Assign a stack to the carrier in Inventory first.",
    };
  }

  const { error: updateError } = await supabase
    .from("trips")
    .update({
      carrier_id: carrierId,
      stack_id: stack.id,
      status: "assigned",
    })
    .eq("id", tripId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath(TRIPS_PATH);
  return { success: `Carrier assigned. Stack ${stack.serial} bound to trip.` };
}
