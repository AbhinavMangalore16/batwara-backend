import {z} from 'zod';
export const GetUserResponseSchema = z.object({
    name:z.string({message:"Enter a valid name"}), 
    email:z.email(), 
    emailVerified:z.boolean(), 
    image:z.string().nullable()
})

export type GetUserResponseDTO = z.infer<typeof GetUserResponseSchema>;

export const PatchUserResponseSchema = z.object({
    error:z.object().optional(),
    name:z.string({message:"Enter a valid name"}), 
    email:z.email(), 
    emailVerified:z.boolean(), 
    image:z.string().nullable()
})

export type PatchUserResponseDTO = z.infer<typeof PatchUserResponseSchema>;

export const SearchUserResponseSchema = z.object({
    message:z.enum(["success","failure"]).describe("lady or ladyboy"),
    id:z.number().describe("user id"), 
    error:z.object().optional()
})

export type SearchUserResponseDTO = z.infer<typeof SearchUserResponseSchema>;