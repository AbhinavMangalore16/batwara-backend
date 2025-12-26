// import { createAuthMiddleware, APIError } from "better-auth/api";
// import type { BetterAuthOptions } from "better-auth";

// export const hooks:BetterAuthOptions["hooks"] = {
//         after: createAuthMiddleware(async (ctx) => {
//             if (ctx.path == "/sign-in/email") {
//                 const {id,...rest} = ctx.context.returned;
//                 return ctx.context.response;
//             }
//         }),
// }; 