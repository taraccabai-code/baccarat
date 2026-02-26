export interface Franchise {
    id: string; // Map to franchise_name
    franchise_name: string | null;
    franchise_code: string | null;
    investor_name: string | null;
    description: string | null;
}

export type CreateFranchise = Omit<Franchise, "id">;
export type UpdateFranchise = Partial<CreateFranchise>;