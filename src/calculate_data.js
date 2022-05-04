export const calculate_data = {
  is_number(number_to_check) {
    return !isNaN(parseFloat(number_to_check)) && isFinite(number_to_check);
  },

  normalize_numbers: function (input_number = 0.0) {
    return input_number !== undefined ? input_number.toFixed(2) : "0.00";
  },

  normalize_numbers_int: function (input_number = 0) {
    return input_number ? input_number.toFixed(0) : "0";
  },

  total_cash: function (free_cash = 0.0, cash_in_bots = 0.0) {
    return this.normalize_numbers(free_cash + cash_in_bots);
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
      //console.log("SO #" + i + " " + safety_order_usage);
      previous_safety_order *= safety_order_scaling;
    }
    return this.normalize_numbers(base_order_size + safety_order_usage);
  },

  extra_bots(total_cash = 0.0, amount_per_bot = 0.0, total_bots = 0) {
    if (total_cash <= 0.0 || amount_per_bot <= 0.0) {
      return 0;
    }

    const free_cash = total_cash - amount_per_bot * total_bots;
    const total_bots_calculated = free_cash / amount_per_bot;

    return total_bots_calculated < 1
      ? 0
      : this.normalize_numbers_int(total_bots_calculated);
  },

  percentage_of_sos_covered(
    total_cash,
    total_bots,
    base_order_size,
    safety_order_size,
    num_safety_orders,
    safety_order_scaling
  ) {
    for (let arg of arguments) {
      if (arg === undefined || arg === null || arg === 0) {
        return 0;
      }
    }

    const so_amount =
      (this.amount_per_bot(
        base_order_size,
        safety_order_size,
        safety_order_scaling,
        num_safety_orders
      ) -
        safety_order_size) *
      total_bots;
    const total_cash_without_base_orders =
      total_cash - base_order_size * total_bots;
    const percentage_of_sos_covered =
      (total_cash_without_base_orders / so_amount) * 100;

    return percentage_of_sos_covered < 100
      ? this.normalize_numbers(percentage_of_sos_covered)
      : this.normalize_numbers(100);
  },
};
