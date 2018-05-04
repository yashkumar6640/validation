(function() {
  if (!Element.prototype.matches)
    Element.prototype.matches =
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;

  if (!Element.prototype.closest)
    Element.prototype.closest = function(s) {
      var el = this;
      if (!document.documentElement.contains(el)) return null;
      do {
        if (el.matches(s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  var lib_controllers = {};
  var forms = {};
  var Form = function(name) {
    this.name = name;
    this.touched = false;
    this.pristine = true;
    this.dirty = false;
    this.invalid_elements = {};
    this.valid = true;
    this.invalid = false;
  };

  Form.prototype = {
    checkAgainstPattern: function(pattern, text, e) {
      var regexp = new RegExp(pattern);
      if (regexp.test(text)) {
        return true;
      } else {
        return false;
      }
    },

    checkForMinLength: function(e) {
      if (
        e.target.value.length < parseInt(e.target.getAttribute("minlength"))
      ) {
        return false;
      } else {
        return true;
      }
    },

    checkForMaxLength: function(e) {
      if (e.target.value < e.target.getAttribute("maxlength")) {
        return false;
      }
      return true;
    },

    checkForRequired: function(e) {
      if (e.target.value === "") {
        return false;
      } else {
        return true;
      }
    },

    runValidations: function(event, e) {
      console.log(event, this);
      if (this.touched === false) {
        this.touched = true;
      }
      if (this.pristine === true) {
        this.pristine = false;
      }
      if (this.dirty === false) {
        this.dirty = true;
      }
      if (e.target && e.target.closest) {
        var form_ele = e.target.closest("form[name]");
        var form_name = form_ele.getAttribute("name");
        var formReference = form_ele.dataset.formReference;
      }
      if (e.target && e.target.matches("[data-" + event + "]")) {
        let fn = e.target.dataset[event];
        let element_form_instance = forms[form_name];

        let isFormValid = true;
        let isElementValid = true;

        if (event === "submit") {
          if (Object.keys(this.invalid_elements).length > 0) {
            isFormValid = false;
            this.invalid = true;
          }
        }

        if (e.target.dataset.pattern) {
          var pattern_error_ele = document.querySelector(
            "[data-showIf=" +
              '"' +
              formReference +
              "." +
              e.target.name +
              ".pattern" +
              '"' +
              "]"
          );

          let isValid = element_form_instance.checkAgainstPattern(
            e.target.dataset.pattern,
            e.target.value,
            e
          );
          if (isValid) {
            pattern_error_ele.setAttribute("hidden", "");
          } else {
            pattern_error_ele.removeAttribute("hidden");
            isFormValid = false;
            this.invalid = true;
            isElementValid = false;
          }
        }

        if (e.target.hasAttribute("minlength")) {
          var minLengthEle = document.querySelector(
            "[data-showif=" +
              '"' +
              formReference +
              "." +
              e.target.name +
              ".minlength" +
              '"' +
              "]"
          );
          let isValid = element_form_instance.checkForMinLength(e);

          if (isValid) {
            minLengthEle.setAttribute("hidden", "");
          } else {
            minLengthEle.removeAttribute("hidden");
            isFormValid = false;
            this.invalid = true;
            isElementValid = false;
          }
        }

        if (e.target.hasAttribute("maxlength")) {
          if (e.target.value.length > e.target.getAttribute("maxlength")) {
            isFormValid = false;
            this.invalid = true;
            isElementValid = false;
          }
        }

        if (e.target.dataset.required === "") {
          var requiredEle = document.querySelector(
            "[data-showif=" +
              '"' +
              formReference +
              "." +
              e.target.name +
              ".required" +
              '"' +
              "]"
          );
          let isValid = element_form_instance.checkForRequired(e);
          if (isValid) {
            requiredEle.setAttribute("hidden", "");
          } else {
            requiredEle.removeAttribute("hidden");

            isFormValid = false;
            this.invalid = true;
            isElementValid = false;
          }
        }

        if (isElementValid) {
          if (this.invalid_elements[e.target.name]) {
            delete this.invalid_elements[e.target.name];
          }
        } else {
          if (e.target.name !== "stdForm") {
            this.invalid_elements[e.target.name] = true;
          }
        }

        if (event !== "submit") {
          lib_controllers[form_name][fn](e);
        }
        if (Object.keys(this.invalid_elements).length > 0) {
          this.invalid = true;
          this.valid = false;
        } else {
          this.invalid = false;
          this.valid = true;
        }
        console.log(this);

        if (isFormValid && this.valid && event === "submit") {
          if (this.invalid_elements[e.target.name]) {
            delete this.invalid_elements[e.target.name];
          }

          lib_controllers[form_name][fn](e);
        }
      }
    }
  };

  let hidden_elements = document.querySelectorAll("[data-showIf]");
  let length = hidden_elements.length;

  for (let i = 0; i < length; i++) {
    hidden_elements[i].setAttribute("hidden", "");
  }

  function initializeAllForms() {
    let f = document.querySelectorAll("form[name]");
    let l = f.length;
    for (let i = 0; i < l; i++) {
      let name = f[i].getAttribute("name");
      forms[name] = new Form(name);
      ["focusin", "focusout", "click", "change", "input", "submit"].forEach(
        event => {
          if (f[i].addEventListener) {
            f[i].addEventListener(event, function(e) {
              forms[name].runValidations(event, e);
            });
          } else if (f[i].attachEvent) {
            f[i].attachEvent(event, function(e) {
              forms[name].runValidations(event, e);
            });
          }
        }
      );
    }
  }

  function initApplication() {
    for (let controller in controllers) {
      lib_controllers[controller] = controllers[controller]();
    }
  }

  document.onreadystatechange = function(e) {
    if (document.readyState === "interactive") {
      initializeAllForms();
    }
    if (document.readyState === "complete") {
      initApplication();
    }
  };

  /*----------main application-----------*/
  var controllers = {
    form1: form1Controller,
    form2: form2Controller
  };

  function form1Controller() {
    var user_info = {};
    var handleClick = function(e) {
      "Inside Click";
    };

    var handleSubmit = function(e) {
      console.log("Inside Submit");
    };

    var handleBlur = function(e) {
      console.log(e, "Blurred");
    };

    var handleFocus = function(e) {
      console.log("handle Focus");
    };
    var handleChange = function(e) {
      console.log("inside handleChange");
    };

    var handleInput = function(e) {
      console.log("Inside handleInput function");
    };

    return {
      handleClick: handleClick,
      handleChange: handleChange,
      handleSubmit: handleSubmit,
      handleBlur: handleBlur,
      handleFocus: handleFocus,
      handleInput: handleInput
    };
  }

  function form2Controller() {
    var user_info = {};
    var handleClick = function(e) {};

    var handleSubmit = function(e) {
      console.log("Inside Submit");
    };

    var handleBlur = function(e) {
      console.log(e, "Blurred");
    };

    var handleChange = function(e) {
      console.log("inside handleChange", this);
    };

    var handleFocus = function(e) {
      console.log("handle focus");
    };

    var handleInput = function(e) {
      console.log("Inside handleInput function");
    };

    return {
      handleClick: handleClick,
      handleChange: handleChange,
      handleSubmit: handleSubmit,
      handleBlur: handleBlur,
      handleFocus: handleFocus,
      handleInput: handleInput
    };
  }
})();
