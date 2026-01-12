import type { GetUserResponseDTO,PatchUserResponseDTO,SearchUserResponseDTO,AddFriendResponseDTO } from './user-response.dto.js';
import type { PatchUserDTO,SearchUserDTO,AddFriendDTO } from './user-request.dto.js';

import { GetUserResponseSchema,PatchUserResponseSchema,SearchUserResponseSchema,AddFriendResponseSchema } from '../dtos/user-response.dto.js';
import { PatchUserSchema,SearchUserSchema,AddFriendSchema } from './user-request.dto.js';

export type dtoTypes = {
    GetUserResponseDTO:GetUserResponseDTO,
    PatchUserDTO:PatchUserDTO,
    SearchUserDTO:SearchUserDTO,
    PatchUserResponseDTO:PatchUserResponseDTO,
    SearchUserResponseDTO:SearchUserResponseDTO,
    AddFriendDTO:AddFriendDTO
    AddFriendResponseDTO:AddFriendResponseDTO
}

export const Schemas = {
    GetUserResponseSchema,
    PatchUserSchema,
    SearchUserSchema,
    PatchUserResponseSchema,
    SearchUserResponseSchema,
    AddFriendSchema,
    AddFriendResponseSchema
}