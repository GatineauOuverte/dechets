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
            
            //var events = new Array
            
            console.log(result);
            
            getCalendarEvents(result, function(error,events){
                console.log("No Error");
                console.log(events);
                
                if (error){
                    showError(error);
                    console.log("Error");
                } else {                
                    // go to results page ....
                    console.log("No Error");
                    // hide entry form
                    $("#entry").hide(); 
                         
                    // set the results
                    $("#addressResult").text(JSON.stringify(result));
                                            
                    // show the panel (before you draw the calendar!)
                    $("#result").show();
            
                    // remove and redraw the calendar
                    $('#calendar').html('').fullCalendar({
                    // add the calendar entries...
                        events: events
                    });
                    //    events: [
                    //        {
                    //            title  : 'event1',
                    //            start  : '2012-09-28'
                    //        },
                    //        {
                    //            title  : 'event2',
                    //            start  : '2012-09-28'
                    //        },
                    //        {
                    //            title  : 'event3',
                    //            start  : '2012-09-14',
                    //            allDay : false // will make the time show
                    //        }
                    //    ]
                    //}); 
                }
            });
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
        //var rand = Math.random();
        //if (rand<.33) {
        //    callback('mock parse error');
        //    return;
        //}
        //
        //// call the service
        //// var result = $.get(ur,dataFromParsedAdressInfo,function(){});
        //if (rand<.66) {
        //    callback('mock service error');
        //    return;
        //}
        // fake result
        var result = {"adresse":"25 rue Laurier","secteur":"Secteur de Hull","jour":"vendredi","MC":"2012-09-28","MR":"2012-10-05","OM":"2012-09-28"}
        callback(null,result);
        
        
        //getCalendarEvents(result);
        //return result;
    }
    
    function getCalendarEvents(info, callback){
        
        var jour = info.jour
        var date = info.MC
        var events = new Array
        
        var i = 0
        var collecteInfo =  new Array
        if (info.CR){
            collecteInfo[i] = "CR";
        } else {
            if (info.AN) {
                collecteInfo[i] = "AN";
                i ++;
            }
            if (info.MC) {
                collecteInfo[i] = "MC";
                i ++;
                if(info.MC == info.MR){
                    collecteInfo[i] = "MR";
                    i ++;    
                }else if((info.MC == info.OM)){
                    collecteInfo[i] = "OM";
                    i ++;    
                }
            }
        }
        
        console.log(collecteInfo)
        
        $.getJSON('data/collecte2012.json', function (data) {
        
            for (var i = 0, len = data.length; i < len; i++) {
                if (data[i].jour == jour && compareCollecteArray(collecteInfo, data[i].collecte) && data[i].date == date){
                    var secteur = data[i].secteur;
                }
            }
                       
            for (var i = 0, len = data.length; i < len; i++) {
                if (data[i].secteur == secteur && data[i].jour == jour){
                    events.push({title:'Test',start:data[i].date});
                }
            }

            callback(null, events);

        });
            }
    
});

function compareCollecteArray(searchResult, jsonResult){
    
    var equal = false
    
    if (searchResult.length == jsonResult.length){
        for (i = 0; i < searchResult.length; i++){
            if (searchResult[i] == jsonResult[i]){
                equal = true;
            } else{
                equal = false;
                break;
            }
        }
        //console.log(equal)
    }
    
    return equal
}

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
