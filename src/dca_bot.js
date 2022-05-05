import { calculate_data } from "./calculate_data.js";

export class DCABot {
  num_bots = 0;
  base_order_size = 0.0;
  safety_order_size = 0.0;
  safety_order_scaling = 0.0;
  max_safety_orders = 0.0;

  constructor(
    settings = {
      num_bots: 0,
      base_order_size: 0.0,
      safety_order_size: 0.0,
      safety_order_scaling: 0.0,
      max_safety_orders: 0.0,
    }
  ) {
    this.num_bots = settings.num_bots || 0;
    this.base_order_size = settings.base_order_size || 0.0;
    this.safety_order_size = settings.safety_order_size || 0.0;
    this.safety_order_scaling = settings.safety_order_scaling || 0.0;
    this.max_safety_orders = settings.max_safety_orders || 0;
  }

  getNumBots() {
    return calculate_data.normalize_numbers_int(this.num_bots);
  }
  getBaseOrderSize() {
    return calculate_data.normalize_numbers(this.base_order_size);
  }
  getSafetyOrderSize() {
    return calculate_data.normalize_numbers(this.safety_order_size);
  }
  getSafetyOrderScaling() {
    return calculate_data.normalize_numbers(this.safety_order_scaling);
  }
  getMaxSafetyOrders() {
    return calculate_data.normalize_numbers_int(this.max_safety_orders);
  }
  setNumBots(num_bots) {
    this.num_bots = Number(num_bots);
  }
  setBaseOrderSize(base_order_size) {
    this.base_order_size = Number(base_order_size);
  }
  setSafetyOrderSize(safety_order_size) {
    this.safety_order_size = Number(safety_order_size);
  }
  setSafetyOrderScaling(safety_order_scaling) {
    this.safety_order_scaling = Number(safety_order_scaling);
  }
  setMaxSafetyOrders(max_safety_orders) {
    this.max_safety_orders = Number(max_safety_orders);
  }

  get_bot_usage() {
    return calculate_data.amount_per_bot(
      this.base_order_size,
      this.safety_order_size,
      this.safety_order_scaling,
      this.max_safety_orders
    );
  }

  get_settings() {
    return {
      num_bots: this.num_bots,
      base_order_size: this.base_order_size,
      safety_order_size: this.safety_order_size,
      safety_order_scaling: this.safety_order_scaling,
      max_safety_orders: this.max_safety_orders,
    };
  }
}
