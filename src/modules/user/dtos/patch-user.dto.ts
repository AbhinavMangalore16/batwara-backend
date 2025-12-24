import {z} from 'zod';
export const PatchUserSchema = z.object({
    name:z.string({message:"enter name"}).optional(),
    image:z.string({message:"eneter image url"}).optional(),
})

export type PatchUserDTO = z.infer<typeof PatchUserSchema>;