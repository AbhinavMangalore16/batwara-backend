import {z} from 'zod';
import { SplitSchema } from './split.dto';

export const BillSchema = z.object({
    description:z.string({message:"enter description"}).min(1),
    totalAmount:z.number({message:"enter amount in rupees"}).nonnegative(),
    splitData:SplitSchema
}).superRefine((val,ctx)=>{
    if(val.splitData.splitType == "exact"){
        const sum = val.splitData.data.reduce((prev,current)=>{
            return prev+current.amount;
        },0);
        if(Math.abs(sum-val.totalAmount)>0.1)ctx.addIssue({
        code: "custom",
        message: `sum not summing`,
        input: val,
        });
    }
});

export type BillDTO = z.infer<typeof BillSchema>;