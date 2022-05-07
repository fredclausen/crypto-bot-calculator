import { calculate_data } from "../calculate_data.js";
import { element_ids } from "../templates/data_structs.js";

export class Cash {
  free_cash = 0.0;
  cash_in_bots = 0.0;
  constructor(cash = { free_cash: 0.0, cash_in_bots: 0.0 }) {
    this.free_cash = cash.free_cash;
    this.cash_in_bots = cash.cash_in_bots;
  }

  get_free_cash() {
    return calculate_data.normalize_numbers(this.free_cash);
  }

  get_cash_in_bots() {
    return calculate_data.normalize_numbers(this.cash_in_bots);
  }

  set_free_cash(free_cash) {
    this.free_cash = Number(free_cash);
  }

  set_cash_in_bots(cash_in_bots) {
    this.cash_in_bots = Number(cash_in_bots);
  }

  get_total_cash() {
    return calculate_data.normalize_numbers(this.free_cash + this.cash_in_bots);
  }

  get_settings() {
    return {
      free_cash: this.free_cash,
      cash_in_bots: this.cash_in_bots,
    };
  }

  update_unknown_value(element, cash) {
    if (!element || !cash) {
      console.error("No element or cash provided");
      console.error("ElementID: " + element_id);
      console.error("Cash: " + cash);
      return;
    }

    if (element === element_ids.total_free_cash) {
      this.set_free_cash(cash);
    } else if (element === element_ids.total_cash_in_bots) {
      this.set_cash_in_bots(cash);
    }
  }
}
