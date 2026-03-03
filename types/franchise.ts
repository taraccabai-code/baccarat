export interface Franchise {
    id: string; // Map to franchise_name
    db_id?: number | string; // Real numeric primary key from the franchise table
    franchise_name: string | null;
    franchise_code: string | null;
    investor_name: string | null;
    description: string | null;
}

export type CreateFranchise = Omit<Franchise, "id">;
export type UpdateFranchise = Partial<CreateFranchise>;