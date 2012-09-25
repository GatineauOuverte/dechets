module("adresses")

test("parseAddress", function() {
    var maison = parseAddress("13, rue du Cidre");
    ok(maison.numero == "13", "");
    ok(maison.rue_id == "357", "");
});

module("urls")

test("buildURL", function() {
    var testAddress = {
        "numero" : "13",
        "rue_id" : "357"
    };
    var testURL = buildURL(testAddress);
    ok(testURL == "http://cartes.gatineau.ca/ArcGisServices/GisRecyclGat/FrmGATINEAU.aspx?Lang=FR&culture=fr-CA&NumeCivi=13&NumRue=357", "");
});

$.mockAjax("json", {
  "/user": {status: -1},
  "/user/(\\d+)": function(matches) {
    return {status: 1, user: "sample user " + matches[1]};
  }
});
 
// Unit tests.
 
test("user tests", function() {
  expect(5);
 
  stop();
  $.getJSON("/user", function(data) {
    ok(data, "data is returned from the server");
    equal(data.status, "-1", "no user specified, status should be -1");
    start();
  });
 
  stop();
  $.getJSON("/user/123", function(data) {
    ok(data, "data is returned from the server");
    equal(data.status, "1", "user found, status should be 1");
    equal(data.user, "sample user 123", "user found, id should be 123");
    start();
  });
});