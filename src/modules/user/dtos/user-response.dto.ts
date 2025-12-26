import {z} from 'zod';
export const UserResponseSchema = z.object({
    name:z.string({message:"Enter a valid name"}), 
    email:z.email(), 
    emailVerified:z.boolean(), 
    image:z.string().nullable()
})

export type UserResponseDTO = z.infer<typeof UserResponseSchema>;