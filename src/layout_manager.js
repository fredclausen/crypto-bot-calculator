import { calculate_data } from "./calculate_data.js";

export class LayoutManager {
  // the constructor
  constructor() {
    this.load_all_values();
    this.init_inputs();
    this.init_or_update_outputs();
  }

  init_inputs() {
    // get the input elements
    const input_elements = document.querySelectorAll("input[type='number']");
    // add event listeners
    // Go through each of the input fields and add an event listener`
    // And also normalize the displayed number to be correct
    input_elements.forEach((element) => {
      element.value =
        element.id !== "maxsafetyordersinput" &&
        element.id !== "numberofbotsinput"
          ? calculate_data.normalize_numbers(Number(element.value))
          : calculate_data.normalize_numbers_int(Number(element.value));
      element.addEventListener("dblclick", (element) => {
        element.focus();
        element.select();
      });
      element.addEventListener("keyup", (element) => {
        // Change the input to always be the correct number of decimals
        // everything but Number of total safety orders and number of bots should be to two decimal places
        // We'll wait 200ms and see if the input matches what was there
        // If it's the same, make sure the format is correct
        // If not, don't do anything
        setTimeout(
          (old_value, element_id) => {
            if (old_value === document.getElementById(element_id).value) {
              if (
                element.target.id !== "maxsafetyordersinput" &&
                element.target.id !== "numberofbotsinput"
              ) {
                element.target.value = calculate_data.normalize_numbers(
                  Number(element.target.value)
                );
              } else {
                element.target.value = calculate_data.normalize_numbers_int(
                  Number(element.target.value)
                );
              }

              // This is a bit of a weak stick approach
              // Every key stroke on an input element is going to cause all values to be recalculated
              // Even if the value isn't impacted by what is being updated
              // Maybe should consider figuring out what element is being updated and only recalc
              // relevant fields, but that feels difficult to track
              this.init_or_update_outputs();
            }
          },
          1500,
          element.target.value,
          element.target.id
        );
      });
    });
  }

  init_or_update_outputs() {
    this.set_total_cash();
    this.set_amount_per_bot();
    this.set_extra_cash();
    this.set_possible_extra_bots();

    // save all the values

    this.save_all_values();
  }

  async load_all_values() {
    const settings = await window.electronAPI.getsettings();
    console.log(settings);
    this.set_total_free_cash(
      calculate_data.normalize_numbers(settings.free_cash)
    );
    this.set_total_cash_in_bots(
      calculate_data.normalize_numbers(settings.cash_in_bots)
    );
    this.set_number_of_bots(
      calculate_data.normalize_numbers_int(settings.num_bots)
    );
    this.set_base_order_size(
      calculate_data.normalize_numbers(settings.base_ordersize)
    );
    this.set_safety_ordersize(
      calculate_data.normalize_numbers(settings.safety_ordersize)
    );
    this.set_safety_order_size_scaling(
      calculate_data.normalize_numbers(settings.safety_ordersize_scaling)
    );
    document.getElementById("maxsafetyordersinput").value =
      calculate_data.normalize_numbers_int(settings.max_safety_orders);

    this.init_or_update_outputs();
  }

  set_total_free_cash(total_cash) {
    document.getElementById("totalfreecashinput").value = total_cash;
  }

  set_total_cash_in_bots(cash_in_bots) {
    document.getElementById("totalcashinbotsinput").value = cash_in_bots;
  }

  set_number_of_bots(number_of_bots) {
    document.getElementById("numberofbotsinput").value = number_of_bots;
  }

  set_base_order_size(base_order_size) {
    document.getElementById("baseordersizeinput").value = base_order_size;
  }

  set_safety_ordersize(safety_ordersize) {
    document.getElementById("safetyordersizeinput").value = safety_ordersize;
  }

  set_safety_order_size_scaling(safety_order_size_scaling) {
    document.getElementById("safetyordersizescalinginput").value =
      safety_order_size_scaling;
  }

  set_max_safety_ordersize(max_safety_ordersize) {
    document.getElementById("maxsafetyordersinput").value =
      max_safety_ordersize;
  }

  save_all_values() {
    const settings = {
      free_cash: Number(this.get_free_cash()),
      cash_in_bots: this.get_cash_in_bots(),
      base_ordersize: this.get_base_ordersize(),
      safety_ordersize: this.get_safety_ordersize(),
      safety_ordersize_scaling: this.get_safety_ordersize_scaling(),
      max_safety_orders: this.get_max_safety_orders(),
      num_bots: this.get_total_bots(),
    };
    window.electronAPI.savesettings(settings);
  }

  set_possible_extra_bots() {
    const extra_cash = this.get_total_cash();
    const amount_per_bot = this.get_amount_per_bot();
    const total_bots = this.get_total_bots();
    const possible_bots = calculate_data.extra_bots(
      extra_cash,
      amount_per_bot,
      total_bots
    );

    document.getElementById("possibleextrabotoutput").innerHTML = possible_bots;

    if (possible_bots <= 0) {
      document
        .getElementById("possibleextrabotoutput")
        .classList.remove("green");
      document.getElementById("possibleextrabotoutput").classList.add("red");
    } else {
      document.getElementById("possibleextrabotoutput").classList.remove("red");
      document.getElementById("possibleextrabotoutput").classList.add("green");
    }
  }

  set_total_cash() {
    document.getElementById("totalcashoutput").innerHTML =
      "$" + this.get_total_cash();
  }

  set_amount_per_bot() {
    document.getElementById("cashusedperbotoutput").innerHTML =
      "$" + this.get_amount_per_bot();
  }

  get_total_cash() {
    return calculate_data.total_cash(
      this.get_free_cash(),
      this.get_cash_in_bots()
    );
  }

  get_total_bots() {
    return Number(document.getElementById("numberofbotsinput").value);
  }

  get_amount_per_bot() {
    return calculate_data.amount_per_bot(
      this.get_base_ordersize(),
      this.get_safety_ordersize(),
      this.get_safety_ordersize_scaling(),
      this.get_max_safety_orders()
    );
  }

  get_free_cash() {
    return Number(document.getElementById("totalfreecashinput").value);
  }

  get_cash_in_bots() {
    return Number(document.getElementById("totalcashinbotsinput").value);
  }

  get_base_ordersize() {
    return Number(document.getElementById("baseordersizeinput").value);
  }

  get_safety_ordersize() {
    return Number(document.getElementById("safetyordersizeinput").value);
  }

  get_safety_ordersize_scaling() {
    return Number(document.getElementById("safetyordersizescalinginput").value);
  }

  get_max_safety_orders() {
    return Number(document.getElementById("maxsafetyordersinput").value);
  }

  set_extra_cash() {
    const extra = calculate_data.normalize_numbers(
      this.get_total_cash() - this.get_amount_per_bot() * this.get_total_bots()
    );

    let extra_element = document.getElementById("extracashoutput");
    extra_element.innerHTML = "$" + extra;

    if (extra <= 0) {
      extra_element.classList.add("red");
      extra_element.classList.remove("green");
    } else {
      extra_element.classList.remove("red");
      extra_element.classList.add("green");
    }
  }
}
