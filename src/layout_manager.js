import { BotManager } from "./bot_manager.js";
import { Cash } from "./cash.js";
import { calculate_data } from "./calculate_data.js";
import { element_ids } from "./data_structs.js";
import { get_settings, save_settings } from "./front_end_settings.js";
import $ from "./jquery_init.js";
export class LayoutManager {
  // the constructor
  separator = this.getDecimalSeparator();
  bot_manager = new BotManager();
  cash = new Cash();

  constructor() {
    this.load_all_values();
    this.init_inputs();
    this.init_or_update_outputs();
  }

  // Used to get the current locale's decimal separator. Used for localization
  getDecimalSeparator(locale) {
    const numberWithDecimalSeparator = 1.1;

    return numberWithDecimalSeparator.toLocaleString(locale).substring(1, 2);
  }

  init_inputs() {
    // get the input elements
    const input_elements = document.querySelectorAll("input[type='text']");
    // add event listeners
    // Go through each of the input fields and add an event listener`
    // And also normalize the displayed number to be correct
    input_elements.forEach((element) => {
      element.value =
        element.id !== element_ids.max_safety_orders &&
        element.id !== element_ids.number_of_bots
          ? calculate_data.normalize_numbers(Number(element.value))
          : calculate_data.normalize_numbers_int(Number(element.value));

      // Event listener to listen for a double click and select all text
      element.addEventListener("dblclick", (element) => {
        element.target.focus();
        element.target.select();
      });

      // When the user de-focuses the input validate it fully
      // Since the validator as they're typing ignores some stuff
      element.addEventListener("focusout", (element) => {
        if (
          element.target.id !== element_ids.max_safety_orders &&
          element.target.id !== element_ids.number_of_bots
        ) {
          element.target.value = calculate_data.normalize_numbers(
            Number(element.target.value)
          );
        } else {
          element.target.value = calculate_data.normalize_numbers_int(
            Number(element.target.value)
          );
        }

        if (
          element.target.id === element_ids.total_free_cash ||
          element.target.id === element_ids.total_cash_in_bots
        ) {
          this.cash.update_unknown_value(
            element.target.id,
            element.target.value
          );
        } else {
          this.bot_manager.update_unknown_value(
            element.target.id,
            element.target.value
          );
        }
        this.init_or_update_outputs();
      });

      element.addEventListener("keyup", (element) => {
        // Get cursor positon
        // We need both the start/end so that the input box doesn't magically
        // Select shit we didn't want to select

        let cursor_start_position = element.target.selectionStart;
        let cursor_end_position = element.target.selectionEnd;

        // validate input is an actual number
        // We'll loop through the string input to see what the user has entered
        // This is a less elegant approach than simple find/replace all non-numbers
        // But since the possibilities of non-alpha characters are endless
        // And I can't be bothered to write a regex to replace them
        // I'll just do this

        if (!calculate_data.is_number(element.target.value)) {
          for (let c of element.target.value) {
            // We have to check for the decimal separator as well as if the character is a number
            // Otherwise we always drop the decimal which is annoying
            // TODO: Localize this. Lots of non-American countries use a comma as a decimal separator
            // This is partially localized. Is there other possibilities?

            if (!calculate_data.is_number(c) && !c === this.separator) {
              element.target.value = element.target.value.replace(c, "");
              // SUPER important to move the cursor position back one so
              // The user input is at the same spot it was before
              cursor_start_position--;
              cursor_end_position--;
              // Since we are doing this every single key stroke there is no possibility of
              // More than one bad character being in the string
              // So we can break out of the loop
              break;
            }
          }
        }
        // Change the input to always be the correct number of decimals
        // everything but Number of total safety orders and number of bots should be to two decimal places

        if (
          element.target.id !== element_ids.max_safety_orders &&
          element.target.id !== element_ids.number_of_bots
        ) {
          // If the number DOES NOT include more than 2 decimal places don't change
          // The Value. If it does, change it to the correct number of decimal places
          // We are SLICING the string, and assuming the last char the user typed
          // Is not relevant. Other method, and maybe worth doing, would be to not
          // Slice, pass the entire value the user typed to the normalalize function
          // And let it round.

          if (
            element.target.value.includes(".") &&
            element.target.value.split(".")[1].length > 2
          ) {
            element.target.value = calculate_data.normalize_numbers(
              Number(
                element.target.value.slice(0, element.target.value.length - 1)
              )
            );
          }
        } else {
          element.target.value = calculate_data.normalize_numbers_int(
            Number(element.target.value)
          );
        }

        // set cursor position back to where it was
        // Start and End selection points are set so that it doesn't
        // highlight text that wasn't highlighted before

        element.target.selectionStart = cursor_start_position;
        element.target.selectionEnd = cursor_end_position;

        // This is a bit of a weak stick approach
        // Every key stroke on an input element is going to cause all values to be recalculated
        // Even if the value isn't impacted by what is being updated
        // Maybe should consider figuring out what element is being updated and only recalc
        // relevant fields, but that feels difficult to track
        this.init_or_update_outputs();
      });
    });
  }

  init_or_update_outputs() {
    this.set_total_cash();
    this.set_amount_per_bot();
    this.set_extra_cash();
    this.set_possible_extra_bots();
    this.set_extra_possible_sos();

    // save all the values

    this.save_all_values();
  }

  async load_all_values() {
    // We need to AWAIT this because it's an async call because it
    // Returns a promise.
    const settings = await get_settings();

    this.bot_manager.load_settings(settings);
    this.cash.set_free_cash(settings.cash.free_cash);
    this.cash.set_cash_in_bots(settings.cash.cash_in_bots);

    this.set_total_free_cash(this.cash.get_free_cash());
    this.set_total_cash_in_bots(this.cash.get_cash_in_bots());
    this.set_number_of_bots(this.bot_manager.get_num_bots());
    this.set_base_order_size(this.bot_manager.get_base_order_size());
    this.set_safety_ordersize(this.bot_manager.get_safety_order_size());
    this.set_safety_order_size_scaling(
      this.bot_manager.get_safety_order_scaling()
    );
    this.set_max_safety_orders(this.bot_manager.get_max_safety_orders());

    this.init_or_update_outputs();
  }

  set_element_value(element, value) {
    if (element === null || value === null) {
      console.error("No value to set");
      return;
    }
    try {
      $(`#${element}`).val(value);
    } catch (e) {
      console.error("Element not found");
      console.error(e);
    }
  }

  set_element_html(element, html) {
    if (element === null || html === null) {
      console.error("No HTML to set");
      return;
    }

    try {
      $(`#${element}`).html(html);
    } catch (e) {
      console.error("Element not found");
      console.error(e);
    }
  }

  get_element_value(element) {
    if (!element) {
      console.error("No element to get value from");
      return;
    }

    return document.getElementById(element).value;
  }

  set_total_free_cash(total_cash) {
    this.set_element_value(element_ids.total_free_cash, total_cash);
  }

  set_total_cash_in_bots(cash_in_bots) {
    this.set_element_value(element_ids.total_cash_in_bots, cash_in_bots);
  }

  set_number_of_bots(number_of_bots) {
    this.set_element_value(element_ids.number_of_bots, number_of_bots);
  }

  set_base_order_size(base_order_size) {
    this.set_element_value(element_ids.base_order_size, base_order_size);
  }

  set_safety_ordersize(safety_ordersize) {
    this.set_element_value(element_ids.safety_ordersize, safety_ordersize);
  }

  set_safety_order_size_scaling(safety_order_size_scaling) {
    this.set_element_value(
      element_ids.safety_order_size_scaling,
      safety_order_size_scaling
    );
  }

  set_max_safety_orders(max_safety_ordersize) {
    this.set_element_value(element_ids.max_safety_orders, max_safety_ordersize);
  }

  save_all_values() {
    let settings = this.bot_manager.get_settings();
    settings.cash = this.cash.get_settings();
    save_settings(settings);
  }

  // TODO: split this in to two functions. I don't know why I wrote it as one
  set_possible_extra_bots() {
    const extra_bots_and_percent_covered =
      this.bot_manager.get_possible_extra_bots(
        Number(this.cash.get_total_cash())
      );

    this.set_element_html(
      element_ids.possible_extra_bots,
      extra_bots_and_percent_covered.possible_extra_bots
    );
    this.set_element_html(
      element_ids.number_of_covered_safety_orders,
      extra_bots_and_percent_covered.percentage_of_sos_covered
    );

    if (extra_bots_and_percent_covered.percentage_of_sos_covered === "100.00%")
      this.set_element_green(element_ids.number_of_covered_safety_orders);
    else this.set_element_red(element_ids.number_of_covered_safety_orders);
    if (extra_bots_and_percent_covered.possible_extra_bots <= 0)
      this.set_element_red(element_ids.possible_extra_bots);
    else this.set_element_green(element_ids.possible_extra_bots);
  }

  set_total_cash() {
    this.set_element_html(
      element_ids.total_cash,
      "$" + this.cash.get_total_cash()
    );
  }

  set_amount_per_bot() {
    this.set_element_html(
      element_ids.cashusedperbot,
      this.bot_manager.get_bot_usage()
    );
  }

  set_extra_possible_sos() {
    const possible_sos = this.bot_manager.get_possible_extra_safety_orders(
      Number(this.cash.get_total_cash())
    );
    this.set_element_html(
      element_ids.possible_extra_safety_orders,
      possible_sos
    );

    if (possible_sos <= 0)
      this.set_element_red(element_ids.possible_extra_safety_orders);
    else this.set_element_green(element_ids.possible_extra_safety_orders);
  }

  set_extra_cash() {
    const extra =
      Number(this.cash.get_total_cash()) -
      this.bot_manager.get_bot_usage() *
        Number(this.bot_manager.get_num_bots());
    this.set_element_html(
      element_ids.extra_cash,
      "$" + calculate_data.normalize_numbers(extra)
    );

    if (extra <= 0) this.set_element_red(element_ids.extra_cash);
    else this.set_element_green(element_ids.extra_cash);
  }

  set_element_green(element) {
    $(`#${element}`).removeClass("red");
    $(`#${element}`).addClass("green");
  }

  set_element_red(element) {
    $(`#${element}`).removeClass("green");
    $(`#${element}`).addClass("red");
  }
}
