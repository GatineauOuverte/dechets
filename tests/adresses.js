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
    ok(testURL == "13", "");
});

module( "validation" );
test( "test 1", function () {
  ok( true, "bool succeeds" );
});
test( "test 2", function () {
  equal( 5, 5.0, "equal succeeds" );
});
 
module( "tooltip" );
test( "test 3", function () {
  deepEqual( 3 === 3, true, "deepEqual succeeds" );
});
test( "test 4", function () {
  ok( false, "fails!" );
});
 
module( "other" );
test( "test 5", function () {
  equal( 3, 5, "equal fails" );
});
