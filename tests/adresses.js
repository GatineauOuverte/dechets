test("parseAddress", function() {
    var maison = parseAddress("13, rue du Cidre");
    ok(maison.numero == "13", "");
    ok(maison.rue_id == "357", "");
});
