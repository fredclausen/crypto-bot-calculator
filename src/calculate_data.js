export const calculate_data = {
  normalize_numbers: function (input_number = 0.0) {
    return input_number !== undefined ? input_number.toFixed(2) : "0.00";
  },

  normalize_numbers_int: function (input_number = 0) {
    return input_number ? input_number.toFixed(0) : "0";
  },

  total_cash: function (free_cash = 0.0, cash_in_bots = 0.0) {
    return this.normalize_numbers(free_cash || 0 + cash_in_bots || 0);
  },

  amount_per_bot: function (
    base_order_size,
    safety_order_size,
    safety_order_scaling,
    max_safety_orders
  ) {
    // ensure all parameters are valid. Any undefined or 0 means the calculation cannot happen
    for (let arg of arguments) {
      if (arg === undefined || arg === null || arg === 0) {
        return 0;
      }
    }

    var safety_order_usage = 0.0;
    var previous_safety_order = safety_order_size;
    for (let i = 1; i <= max_safety_orders; i++) {
      safety_order_usage += previous_safety_order;
      previous_safety_order *= safety_order_scaling;
    }
    return this.normalize_numbers(base_order_size + safety_order_usage);
  },
};
