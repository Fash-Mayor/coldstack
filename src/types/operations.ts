import type { CarrierOption } from "@/types/inventory";

export type TripStatus =
  | "pending"
  | "assigned"
  | "en_route"
  | "on_trip"
  | "completed"
  | "cancelled";

export type ShipperOption = {
  id: string;
  label: string;
};

export type ConsigneeOption = {
  id: string;
  label: string;
};

export type PocCertificateSummary = {
  id: string;
  trip_id: string;
  pdf_url: string;
  verified_by_receiver: boolean;
  generated_at: string;
};

export type TripRow = {
  id: string;
  status: TripStatus;
  origin_label: string;
  destination_label: string;
  target_temp: number;
  type_of_goods: string;
  carrier_name: string | null;
  stack_serial: string | null;
  created_at: string;
  completed_at: string | null;
  poc: PocCertificateSummary | null;
};

export type OperationsData = {
  trips: TripRow[];
  shippers: ShipperOption[];
  consignees: ConsigneeOption[];
  carriers: CarrierOption[];
};

export type CreateTripInput = {
  shipperId: string;
  consigneeId: string;
  targetTemp: number;
  tolerance: number;
  typeOfGoods: string;
};

export type OperationsActionState = {
  error?: string;
  success?: string;
};
