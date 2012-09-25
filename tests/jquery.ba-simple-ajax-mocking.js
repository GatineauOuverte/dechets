/*!
 * Simple jQuery (1.5+) AJAX Mocking - v0.1.1 - 2012-08-17
 * http://benalman.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 * https://gist.github.com/1371254
 */

(function($) {

  // Process all rules for a given AJAX request.
  function processRules(options) {
    // The dataType (eg. "json").
    var dataType = options.dataType || '*';
    // If a rule is matched, override the built-in transport.
    var transport;
    // Iterate over all specified rules for this dataType, defaulting to
    // catch-all "*" rules if there are no dataType-specific rules.
    var rules = $.mockAjax.rules[dataType] || $.mockAjax.rules['*'] || [];
    $.each(rules, function(_, rule) {
      // Test the AJAX request URL against this rule's regexp.
      var matches = options.url.match(rule.re);
      // If there was a match, override the default transport.
      if (matches) {
        transport = {
          // Override the transport's send to immediately return a result.
          send: function(_, done) {
            // Get the response value.
            var response = rule.response;
            // If the response is a function, invoke it, passing in the matches
            // array and the AJAX request options, and get its result.
            if ($.isFunction(response)) {
              response = response(matches, options);
            }
            // If the dataType is "json" or "jsonp" and not a string, serialize
            // it into a valid JSON string. Note: requires JSON!
            if (/^json/.test(dataType) && typeof response !== "string") {
              response = window.JSON ? JSON.stringify(response) : String(response);
            }
            // Respond successfully!
            var delay = $.mockAjax.options.delay;
            setTimeout(function() {
              done("200", "success", {status: response});
            }, $.isFunction(delay) ? delay() : delay);
          },
          // Don't do anything on abort. Don't abort. Should this do anything?
          abort: $.noop
        };
        // Don't process any other rules for this AJAX request.
        return false;
      }
    });
    return transport;
  }

  // Mock AJAX requests for a given dataType and map of rules.
  $.mockAjax = function(dataType, userRules) {
    if (arguments.length === 1) {
      userRules = dataType;
      dataType = '*';
    }

    var rules = $.mockAjax.rules[dataType];

    // If no rules exist for this datatype, create a place to store them and
    // register an ajax transport handler for that datatype.
    if (!rules) {
      rules = $.mockAjax.rules[dataType] = {};
      $.ajaxTransport(dataType === '*' ? '+*' : dataType, processRules);
    }

    // For each user rule specified, add an entry into this dataType's rules
    // object, overwriting any already-existing rule with the same pattern.
    $.each(userRules, function(pattern, response) {
      rules[pattern] = {
        // Compile a matching regexp up-front to save processing later.
        re: new RegExp("^" + pattern + "$"),
        // Store the response value / function.
        response: response
      };
    });
  };

  // Initialize an empty rules object.
  $.mockAjax.rules = {};

  // Options.
  $.mockAjax.options = {
    delay: function() { return Math.random() * 250 + 50; }
  };

}(jQuery));
