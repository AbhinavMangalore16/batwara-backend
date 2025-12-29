import type { BillDTO } from './bill.dto';
import type { SplitDTO } from './split.dto';

import { BillSchema } from './bill.dto';
import { SplitSchema } from './split.dto';

export type dtoTypes = {
    BillDTO:BillDTO,
    SplitDTO:SplitDTO
}

export const Schemas = {
    BillSchema,
    SplitSchema
}