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
