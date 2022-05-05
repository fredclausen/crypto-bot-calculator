import { DCABot } from "./dca_bot.js";
import { element_ids } from "./data_structs.js";
import { calculate_data } from "./calculate_data.js";

export class BotManager {
  bots = [];
  selected_bot = null;

  constructor(num_bots = 0) {
    this.num_bots = num_bots;
  }

  load_settings(settings) {
    if (!settings) return;

    this.selected_bot = settings.selected_bot || 0;

    for (let bot of settings.bots) {
      this.add_bot(bot);
    }
  }

  get_settings() {
    return {
      selected_bot: this.get_selected_bot(),
      bots: this.get_bots(),
    };
  }

  add_bot(options = null) {
    if (!options) return;
    this.bots.push(new DCABot(options));
  }

  remove_bot(bot = null) {
    if (!bot) return;

    this.bots.splice(bot, 1);
  }

  get_bots() {
    if (this.bots.length === 0) return;
    let bot_settings = [];

    this.bots.forEach((bot) => {
      bot_settings.push(bot.get_settings());
    });

    return bot_settings;
  }

  get_num_bots() {
    if (this.bots.length === 0) return;
    return this.bots[this.selected_bot].getNumBots();
  }

  get_base_order_size() {
    if (this.bots.length === 0) return;
    return this.bots[this.selected_bot].getBaseOrderSize();
  }

  get_safety_order_size() {
    if (this.bots.length === 0) return;
    return this.bots[this.selected_bot].getSafetyOrderSize();
  }

  get_safety_order_scaling() {
    if (this.bots.length === 0) return;
    return this.bots[this.selected_bot].getSafetyOrderScaling();
  }

  get_max_safety_orders() {
    if (this.bots.length === 0) return;
    return this.bots[this.selected_bot].getMaxSafetyOrders();
  }

  get_selected_bot() {
    if (this.bots.length === 0) return;
    return this.selected_bot;
  }

  get_bot_usage() {
    if (this.bots.length === 0) return;

    return this.bots[this.selected_bot].get_bot_usage();
  }

  update_unknown_value(element_id, value) {
    if (!element_id || !value) {
      console.error("No element_id or value");
      console.error("ElementID: " + element_id);
      console.error("Value: " + value);
      return;
    }

    // This is ugly as fuck, but it works. We gotta do better

    switch (element_id) {
      case element_ids.number_of_bots:
        this.bots[this.selected_bot].setNumBots(value);
        break;
      case element_ids.base_order_size:
        this.bots[this.selected_bot].setBaseOrderSize(value);
        break;
      case element_ids.safety_ordersize:
        this.bots[this.selected_bot].setSafetyOrderSize(value);
        break;
      case element_ids.safety_order_size_scaling:
        this.bots[this.selected_bot].setSafetyOrderScaling(value);
        break;
      case element_ids.max_safety_orders:
        this.bots[this.selected_bot].setMaxSafetyOrders(value);
        break;
      default:
        console.error("Unknown element_id");
        console.error("ElementID: " + element_id);
        console.error("Value: " + value);
        break;
    }
  }

  get_possible_extra_bots(total_cash = 0.0, just_current_bot = true) {
    // For now we'll ignore the arg, but
    // TODO: support calculating this for all de bots
    if (this.bots.length === 0 || total_cash === 0.0)
      return {
        possible_extra_bots: 0,
        percentage_of_sos_covered: 0,
      };

    const amount_per_bot = Number(this.get_bot_usage());
    const total_bots = Number(this.get_num_bots());
    const possible_bots = calculate_data.extra_bots(
      total_cash,
      amount_per_bot,
      total_bots
    );
    const base_ordersize = Number(this.get_base_order_size());
    const safety_ordersize = Number(this.get_safety_order_size());
    const num_safety_orders = Number(this.get_max_safety_orders());
    const safety_order_scaling = Number(this.get_safety_order_scaling());
    return {
      percentage_of_sos_covered:
        calculate_data.percentage_of_sos_covered(
          total_cash,
          total_bots,
          base_ordersize,
          safety_ordersize,
          num_safety_orders,
          safety_order_scaling
        ) + "%",
      possible_extra_bots: possible_bots,
    };
  }

  get_possible_extra_safety_orders(total_cash, just_current_bot = true) {
    if (this.bots.length === 0 || total_cash === 0) return 0;

    const base_ordersize = Number(this.get_base_order_size());
    const safety_ordersize = Number(this.get_safety_order_size());
    const max_safety_orders = Number(this.get_max_safety_orders());
    const safety_order_scaling = Number(this.get_safety_order_scaling());
    const num_bots = Number(this.get_num_bots());
    return calculate_data.get_possible_extra_sos(
      total_cash,
      base_ordersize,
      safety_ordersize,
      safety_order_scaling,
      max_safety_orders,
      num_bots
    );
  }
}
