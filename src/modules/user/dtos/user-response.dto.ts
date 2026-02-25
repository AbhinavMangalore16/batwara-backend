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
    id:z.string().optional().describe("user id"), 
    name:z.string().optional().describe("user name"),
    email:z.string().optional().describe("users email"),
    image:z.string().nullable().optional().describe("user profile image string url"),
    error:z.object().optional()
})

export type SearchUserResponseDTO = z.infer<typeof SearchUserResponseSchema>;

export const AddFriendResponseSchema = z.object({
    message:z.enum(["success","failure"]).describe("lady or ladyboy"),
    error:z.object().optional()
})

export type AddFriendResponseDTO = z.infer<typeof AddFriendResponseSchema>;