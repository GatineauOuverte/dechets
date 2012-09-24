$(document).ready(function() {    
    // wire up the submt and return buttons
    $('#entryform').submit(submitAddress);    
    $('#restart').click(returnToAddressEntry);

    initAutocomplete();
    
    // console.log('coco');
    
    
    function initAutocomplete() {
        $.getJSON('data/rue.json', function (data) {
            var autoCompleteData = [],
                $searchInput = $('#addressInfo'),
                civicNumberRx = /^\d+ ?/,
                typeRx = /, ([^,]+)/,
                type,
                item,
                street,
                pluginInstance,
                oldSearchFn;
                
            function onFocusOrSelect(event, ui) {
                this.value = pluginInstance.civicNumber + ui.item.label;
                    
                return false;
            }
            
            //prepare data for the autocomplete plugin
            for (var i = 0, len = data.length; i < len; i++) {
                street = (item = data[i]).rue;
                type = (type = street.match(typeRx)) ? type[1] : '';
                
                autoCompleteData.push({
                    value: item.id,
                    label: type + ' ' + street.replace(/,.+/, '')
                });
            }
            
            //init the plugin
            $searchInput.autocomplete({
                source: function(request, response) {
                    var results = $.ui.autocomplete.filter(autoCompleteData, request.term);
            
                    //limit the results to 10
                    response(results.slice(0, 10));
                },
                minLength: 4,
                delay: 400,
                focus: onFocusOrSelect,
                select: onFocusOrSelect,
                search: function (event, ui) {
                    //do not search if no civic number is entered
                    return civicNumberRx.test(this.value);
                }
            });
            
            pluginInstance = $searchInput.data('autocomplete');
            oldSearchFn = pluginInstance._search;
            
            $.extend(pluginInstance, {
                _search: function (val) {
                    
                    this.civicNumber = val.match(civicNumberRx)[0];
                    
                    oldSearchFn.call(this, val.replace(civicNumberRx, '')); 
                },
                
                //override the default item template
                _renderItem: function( ul, item) {
                    return $("<li></li>")
                        .data( "item.autocomplete", item)
                        .append( $( "<a></a>" ).text(this.civicNumber + item.label))
                        .appendTo( ul );
                }
            });
        });
    }
    
    function submitAddress(event){
        event.preventDefault();
        var addressInfo = $('#addressInfo').val();
        // parse the address and lookup the info
        getCollectionInfo(addressInfo,function(error,result){
            console.log('addressInfo',addressInfo);
            if (error){
                showError(error);
            } else {                
                // go to results page ....

                // hide entry form
                $("#entry").hide(); 
                
                // set the results
                $("#addressResult").text(JSON.stringify(result));
                                
                // show the panel (before you draw the calendar!)
                $("#result").show();

                // remove and redraw the calendar
                $('#calendar').html('').fullCalendar({
                    // put your options and callbacks here
                });
                // add the calendar entries...
                
            }
        });
    }

    function showError(message){
        if ($('#addressError').length===0) {
            var $err=$('<div id="addressError" class="alert alert-error"><button type="button" class="close" data-dismiss="alert">×</button><strong>Erreur</strong> <span id="addressErrorMessage"></span></div>');
            $('#entryform').append($err);
        }
        $('#addressErrorMessage').text(message);
        $('#addressError').show();
    }
    function hideError(){
        $('#addressError').remove();        
    }
    
    // navigation back to initial address entry screen
    function returnToAddressEntry(){
        $("#result").hide();
        // remove the calendar, so it is ready to be redrawn on next submit
        $('#calendar').html('');

        hideError();
        $("#entry").show(); 
    }
    
    // -cette fonction parse l'addresse soumise,
    // -va chercher l'info sur le site de la ville
    // parse l'info retourne par lle service
    // the callback's signature should be callback(error,result)
    function getCollectionInfo(addressInfo, callback){
        if (!addressInfo){
            callback('Le champs addresse est requis.');
            return;
        }
        var rand = Math.random();
        if (rand<.33) {
            callback('mock parse error');
            return;
        }
        
        // call the service
        // var result = $.get(ur,dataFromParsedAdressInfo,function(){});
        if (rand<.66) {
            callback('mock service error');
            return;
        }
        // fake result
        var result = {"adresse":"25 rue Laurier","secteur":"Secteur de Hull","jour":"vendredi","MC":"28-09-2012","MR":"05-10-2012","OM":"28-09-2012"}
        callback(null,result);
    }
    
    function fillCalendar(info){
       var days = getCalendarFromInfo(info);
       mycal.apiMethod1();
    }
    
});

function parseAddress(rawAddress) {
    var parsedAddress = {
        "numero" : "13",
        "rue_id" : "357"
    };
    return parsedAddress;
}

function buildURL(sourceAddress) {
    var resourceURL = "http://cartes.gatineau.ca/ArcGisServices/GisRecyclGat/FrmGATINEAU.aspx?Lang=FR&culture=fr-CA"
    var numeroCivique = "&NumeCivi=" + sourceAddress.numero;
    var numRue = "&NumRue=" + sourceAddress.rue_id;
    return resourceURL + numeroCivique + numRue;
}
