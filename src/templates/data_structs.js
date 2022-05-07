export const element_ids = {
  // Calculated Values, not writable by the user
  total_cash: "totalcashoutput", // The total cash available for the bots
  extra_cash: "extracashoutput", // The unused cash
  cashusedperbot: "cashusedperbotoutput", // The cash used per bot
  possible_extra_bots: "possibleextrabotoutput", // The number of bots that can be added
  number_of_covered_safety_orders: "numberofcoveredsafetyordersoutput", // The percentage of SOs that are covered with available cash
  possible_extra_safety_orders: "possibleextrasossoutput", // The number of SOs that can be added
  // User Inputs
  total_free_cash: "totalfreecashinput", // The total free cash available
  total_cash_in_bots: "totalcashinbotsinput", // The total cash in bots
  number_of_bots: "numberofbotsinput", // The number of bots
  base_order_size: "baseordersizeinput", // The base order size
  safety_ordersize: "safetyordersizeinput", // The safety order size
  safety_order_size_scaling: "safetyordersizescalinginput", // The safety order size scaling
  max_safety_orders: "maxsafetyordersinput", // The maximum number of safety orders
};
