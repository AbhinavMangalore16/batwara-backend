import {z} from "zod";

export const SettlementSchema = z.object({
    id: z.string().uuid(),
    from: z.string().uuid(),
    to: z.string().uuid(),
    amount: z.number().int().nonnegative(),
    created_at: z.date(),
    updated_at: z.date().optional(),
    deleted_at: z.date().optional()
})

export const SettlementResponseSchema = z.object({
    from: z.string().uuid(),
    to: z.string().uuid(),
    amount: z.number().int().nonnegative()
})

export const UserSettlementResponseSchema = z.object({
    owesTo: z.array(z.object({
        to: z.string().uuid(),
        amount: z.number().int().nonnegative(),
    })),
    receivesFrom: z.array(z.object({
        from: z.string().uuid(),
        amount: z.number().int().nonnegative()
    }))
})

export type SettlementDTOType = z.infer<typeof SettlementSchema>;
export type SettlementResponseDTOType = z.infer<typeof SettlementResponseSchema>;
export type UserSettlementResponseDTOType = z.infer<typeof UserSettlementResponseSchema>;