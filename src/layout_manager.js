export class LayoutManager {
  // the constructor
  constructor() {
    this.init_inputs();
  }

  init_inputs() {
    // get the input elements
    const input_elements = document.querySelectorAll("input[type='number']");
    // add event listeners
    input_elements.forEach((element) => {
      console.log("adding");
      element.addEventListener("keyup", () => {
        console.log("hello");
      });
    });
  }
}
