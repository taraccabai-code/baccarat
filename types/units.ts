import { Franchise } from "./franchise";

export interface Unit {
    id: string;
    created_at: string;
    unit_id: string; // uuid
    unit_name: string;
    archived?: boolean;
    api_base_url: string | null;
    status: UnitStatus | null; // USER-DEFINED
    franchise_id: string | null;
    franchise?: Franchise;
    is_occupied: boolean;
    platform: string | null;
    credential_id: string | null;
    balance?: number | string | null;
    level?: number | null;
    pattern?: string | null;
    strategy?: string | null;
    duration?: number | string | null;
}

export type CreateUnit = Omit<
    Unit,
    "id" | "created_at" | "unit_id" | "franchise"
>;
export type UpdateUnit = Partial<CreateUnit>;

export type UnitStatus =
    | "enabled"
    | "disabled"
    | "processing"
    | "slow network"
    | "not connected"
    | "pc issue";