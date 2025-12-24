import {z} from 'zod';
export const UserResponseSchema = z.object({
    
    name:z.string({message:"naam daal"}), 
    email:z.email(), 
    emailVerified:z.boolean(), 
    image:z.string().nullable()
})

export type UserResponseDTO = z.infer<typeof UserResponseSchema>;