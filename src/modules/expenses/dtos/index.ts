import type { BillDTO } from './bill.dto';
import type { SplitDTO } from './split.dto';

import { BillSchema } from './bill.dto';
import { SplitSchema } from './split.dto';
import { 
    SettlementSchema,
    SettlementResponseSchema,
    UserSettlementResponseSchema,
    SettlementDTOType, 
    SettlementResponseDTOType, 
    UserSettlementResponseDTOType 
} from './settlement.dto';

export type dtoTypes = {
    BillDTO:BillDTO,
    SplitDTO:SplitDTO,
    SettlementDTO: SettlementDTOType,
    SettlementResponseDTO:SettlementResponseDTOType,
    UserSettlementResponseDTO:UserSettlementResponseDTOType
}

export const Schemas = {
    BillSchema,
    SplitSchema,
    SettlementSchema,
    SettlementResponseSchema,
    UserSettlementResponseSchema,
}