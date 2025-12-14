import {z} from 'zod';
const RegisterUserSchema = z.object({
    name:z.string({message:"naam daal de bsdke"}),
    email:z.email({message:"email daal de bsdke"}),
    password:z.string({message:"pwd daal de bsdke"}).min(8),
    dob:z.date({message:"birthday date optional(for selling to meta)"})
})

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;