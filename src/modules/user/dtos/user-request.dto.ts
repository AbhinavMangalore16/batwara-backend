import {z} from 'zod';
export const PatchUserSchema = z.object({
    name:z.string({message:"Enter name"}).optional(),
    image:z.string({message:"Enter image url"}).optional(),
})

export type PatchUserDTO = z.infer<typeof PatchUserSchema>;

export const SearchUserSchema = z.object({
    email:z.string({message:"Enter email"}),
})

export type SearchUserDTO = z.infer<typeof SearchUserSchema>;