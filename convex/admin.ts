import { query } from "./_generated/server";

// Lists all models (active + inactive) for the admin dashboard.
// Protected at the network level by the JWT middleware.
export const listAllModels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("models").collect();
  },
});
