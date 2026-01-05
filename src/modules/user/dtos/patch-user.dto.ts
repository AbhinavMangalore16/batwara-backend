import {z} from 'zod';
export const PatchUserSchema = z.object({
    name:z.string({message:"Enter name"}).optional(),
    image:z.string({message:"Enter image url"}).optional(),
})

export type PatchUserDTO = z.infer<typeof PatchUserSchema>;