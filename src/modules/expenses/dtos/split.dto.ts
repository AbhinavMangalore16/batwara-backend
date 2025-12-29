import {z} from 'zod';

const ExactSplitSchema = z.array(z.object({
    userId:z.string({message:"enter userId"}).min(1),
    amount:z.number({message:"eneter amount in rupees"}).nonnegative(),
})).min(1);

const EqualSplitSchema = z.array(z.object({
    userId:z.string({message:"enter userId"}).min(1),
})).min(1);

const PercentageSplitSchema = z.array(z.object({
    userId:z.string({message:"enter userId"}).min(1),
    percentage:z.number({message:"eneter split percentage"}).nonnegative(),
})).min(1).superRefine((val,ctx)=>{
    const sum = val.reduce((prev,current)=>{
        return prev+current.percentage;
    },0);
    if(Math.abs(sum-100)>0.1)ctx.addIssue({
      code: "custom",
      message: `sum not summing`,
      input: val,
    });
});

export const SplitSchema = z.discriminatedUnion("splitType", [
  z.object({ splitType: z.literal("exact"), data: ExactSplitSchema }),
  z.object({ splitType: z.literal("equal"), data: EqualSplitSchema }),
  z.object({ splitType: z.literal("percentage"), data: PercentageSplitSchema }),
]);

export type SplitDTO = z.infer<typeof SplitSchema>;