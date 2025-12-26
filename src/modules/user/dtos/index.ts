import type { UserResponseDTO } from './user-response.dto.js';
import type { PatchUserDTO } from '../dtos/patch-user.dto';

import { UserResponseSchema } from '../dtos/user-response.dto.js';
import { PatchUserSchema } from '../dtos/patch-user.dto.js';

export type dtoTypes = {
    UserResponseDTO:UserResponseDTO,
    PatchUserDTO:PatchUserDTO
}

export const Schemas = {
    UserResponseSchema,
    PatchUserSchema
}