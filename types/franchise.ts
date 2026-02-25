export interface Franchise {
    id: string;
    created_at: string;
    franchise_name: string | null;
    franchise_code: string | null;
    investor_name: string | null;
}

export type CreateFranchise = Omit<Franchise, "id" | "created_at">;
export type UpdateFranchise = Partial<CreateFranchise>;