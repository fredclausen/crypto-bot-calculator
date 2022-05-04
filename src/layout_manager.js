import { calculate_data } from "./calculate_data.js";

export class LayoutManager {
  // the constructor
  separator = this.getDecimalSeparator();

  constructor() {
    this.load_all_values();
    this.init_inputs();
    this.init_or_update_outputs();
  }

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
        element.id !== "maxsafetyordersinput" &&
        element.id !== "numberofbotsinput"
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
            console.log(c);
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
          element.target.id !== "maxsafetyordersinput" &&
          element.target.id !== "numberofbotsinput"
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
    // TODO: Get all of the input values and pass them in to these functions
    // That was we only walk the DOM tree once to get the values, and then don't have to
    // Do it every single time we want to update the outputs

    this.set_total_cash();
    this.set_amount_per_bot();
    this.set_extra_cash();
    this.set_possible_extra_bots();
    this.set_extra_possible_sos();

    // save all the values

    this.save_all_values();
  }

  async load_all_values() {
    const settings = await window.electronAPI.getsettings();

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
    const base_ordersize = this.get_base_ordersize();
    const safety_ordersize = this.get_safety_ordersize();
    const num_safety_orders = this.get_max_safety_orders();
    const safety_order_scaling = this.get_safety_ordersize_scaling();
    const percentage_of_sos_covered =
      calculate_data.percentage_of_sos_covered(
        extra_cash,
        total_bots,
        base_ordersize,
        safety_ordersize,
        num_safety_orders,
        safety_order_scaling
      ) + "%";

    document.getElementById("possibleextrabotoutput").innerHTML = possible_bots;
    document.getElementById("numberofcoveredsafetyordersoutput").innerHTML =
      percentage_of_sos_covered;

    if (percentage_of_sos_covered === "100.00%")
      this.set_element_green("numberofcoveredsafetyordersoutput");
    else this.set_element_red("numberofcoveredsafetyordersoutput");

    if (possible_bots <= 0) this.set_element_red("possibleextrabotoutput");
    else this.set_element_green("possibleextrabotoutput");
  }

  set_total_cash() {
    document.getElementById("totalcashoutput").innerHTML =
      "$" + this.get_total_cash();
  }

  set_amount_per_bot() {
    document.getElementById("cashusedperbotoutput").innerHTML =
      "$" + this.get_amount_per_bot();
  }

  set_extra_possible_sos() {
    const extra_cash = this.get_total_cash();
    const base_ordersize = this.get_base_ordersize();
    const safety_ordersize = this.get_safety_ordersize();
    const max_safety_orders = this.get_max_safety_orders();
    const safety_order_scaling = this.get_safety_ordersize_scaling();
    const num_bots = this.get_total_bots();
    const possible_sos = calculate_data.get_possible_extra_sos(
      extra_cash,
      base_ordersize,
      safety_ordersize,
      safety_order_scaling,
      max_safety_orders,
      num_bots
    );

    document.getElementById("possibleextrasossoutput").innerHTML = possible_sos;

    if (possible_sos <= 0) this.set_element_red("possibleextrasossoutput");
    else this.set_element_green("possibleextrasossoutput");
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

    document.getElementById("extracashoutput").innerHTML = "$" + extra;
    if (extra <= 0) this.set_element_red("extracashoutput");
    else this.set_element_green("extracashoutput");
  }

  set_element_green(element) {
    document.getElementById(element).classList.remove("red");
    document.getElementById(element).classList.add("green");
  }

  set_element_red(element) {
    document.getElementById(element).classList.remove("green");
    document.getElementById(element).classList.add("red");
  }
}
