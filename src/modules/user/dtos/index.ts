import type { GetUserResponseDTO,PatchUserResponseDTO,SearchUserResponseDTO } from './user-response.dto.js';
import type { PatchUserDTO,SearchUserDTO } from './user-request.dto.js';

import { GetUserResponseSchema,PatchUserResponseSchema,SearchUserResponseSchema } from '../dtos/user-response.dto.js';
import { PatchUserSchema,SearchUserSchema } from './user-request.dto.js';

export type dtoTypes = {
    GetUserResponseDTO:GetUserResponseDTO,
    PatchUserDTO:PatchUserDTO,
    SearchUserDTO:SearchUserDTO,
    PatchUserResponseDTO:PatchUserResponseDTO,
    SearchUserResponseDTO:SearchUserResponseDTO,
}

export const Schemas = {
    GetUserResponseSchema,
    PatchUserSchema,
    SearchUserSchema,
    PatchUserResponseSchema,
    SearchUserResponseSchema
}