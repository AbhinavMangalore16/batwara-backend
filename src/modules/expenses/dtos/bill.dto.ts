import {z} from 'zod';
export const BillSchema = z.object({
    description:z.string({message:"enter description"}).min(1),
    amount:z.int32({message:"eneter amount in rupees"}).nonnegative(),
})

export type BillDTO = z.infer<typeof BillSchema>;