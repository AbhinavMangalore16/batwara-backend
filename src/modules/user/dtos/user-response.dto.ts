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
    id:z.string().describe("user id"), 
    error:z.object().optional()
})

export type SearchUserResponseDTO = z.infer<typeof SearchUserResponseSchema>;

export const AddFriendResponseSchema = z.object({
    message:z.enum(["success","failure"]).describe("lady or ladyboy"),
    error:z.object().optional()
})

export type AddFriendResponseDTO = z.infer<typeof AddFriendResponseSchema>;

export const SearchFriendResponseSchema = z.object({
    message: z.enum(["success", "failure"]),
    friends: z.array(
        z.object({
            id: z.string(), 
            name: z.string(),
            email: z.email(),
            image: z.string().nullable().optional()
        })
    ).optional(), 
    error: z.any().optional()
})

export type SearchFriendResponseDTO = z.infer<typeof SearchFriendResponseSchema>