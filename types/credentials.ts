export interface Credential {
    id: number;
    created_at: string;
    password: string | null;
    username: string | null;
    account_name: string | null;
    betting_platform: string | null;
}

export type CreateCredential = Omit<Credential, "id" | "created_at">;
export type UpdateCredential = Partial<CreateCredential>;