$(document).ready(function() {
    
    var typeMap = {
            'arbres de noël': 'AN',
            'collecte reportée au lendemain': 'CR',
            'matières compostables': 'MC',
            'matières recyclables': 'MR',
            'ordures ménagères': 'OM' 
        },
        monthMap = {
            'janvier': 0,
            'février': 1,
            'mars': 2,
            'avril': 3,
            'mai': 4,
            'juin': 5,
            'juillet': 6,
            'août': 7,
            'septembre': 8,
            'octobre': 9,
            'novembre': 10,
            'décembre': 11
        },
        rues;
    
    // wire up the submt and return buttons
    $('#entryform').submit(submitAddress);    
    $('#restart').click(returnToAddressEntry);

    initAutocomplete();
    
    function parseCollectTextareaContent(content) {
        
        console.log(content);
        var types = [],
            result = {},
            collectRx, groups, k, day, v;
        
        for (k in typeMap) {
            types.push(k);
        }
        
        collectRx = new RegExp(
            '\\((' + types.join('|') + ')\\)' //(map_key)
            + '\\s+:\\s+(?:(\\w+),\\s+(\\d+)\\s+(\\w+)\\s+(\\d+))?' // : day_name, day month year (optionnal)
        , 'ig');
        
        while(groups = collectRx.exec(content)) {
            type = typeMap[groups[1]];
            
            if (day = groups[3]) {
                result[type] = new Date(groups[5], monthMap[groups[4]], day);
                
                if (!result.jour) {
                    result.jour = groups[2];
                }
            }
        }
        
        result.MC = result.MR < result.OM ? result.MR : result.OM;
        
        //convert dates back as strings
        for (k in result) {
            if (k !== 'jour') {
                v = result[k];
                result[k] = v.toISOString().substring(0, 10);
            }
        }
        
        return result;
    }
    
    function getStreetId(parsedAddress) {
        var selectedItem = $('#addressInfo').data('autocomplete').selectedItem,
            item;
        
        if (selectedItem) {
            return selectedItem.value;
        }
        
        for (var i = 0, len = rues.length; i < len; i++) {
            item = rues[i];
            if (item.street.toLowerCase() === parsedAddress.nom) {
                return item.value;
            }
        }
        
        return null;
    }
    
    function initAutocomplete() {
        $.getJSON('data/rue.json', function (data) {
            var autoCompleteData = [],
                $searchInput = $('#addressInfo'),
                civicNumberRx = /^\d+ ?/,
                typeRx = /, ([^,]+)/,
                type,
                item,
                street,
                $pluginInstance,
                oldSearchFn,
                streetName;
            
            //Make rue data accessible globally
            rues = autoCompleteData;
                
            function onFocusOrSelect(event, ui) {
                this.value = $pluginInstance.civicNumber + ui.item.label;
                    
                return false;
            }
            
            //prepare data for the autocomplete plugin
            for (var i = 0, len = data.length; i < len; i++) {
                street = (item = data[i]).rue;
                type = (type = street.match(typeRx)) ? type[1] : '';
                streetName = street.replace(/,.+/, '');
                
                autoCompleteData.push({
                    value: item.id,
                    label: type + ' ' + streetName,
                    street: streetName
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
                    //do not search if no civic number is entered or if we are not in the search screen
                    return civicNumberRx.test(this.value) && $('#entry').css('display') !== 'none';
                }
            });
            
            $pluginInstance = $searchInput.data('autocomplete');
            oldSearchFn = $pluginInstance._search;
            
            $.extend($pluginInstance, {
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
    
    function submitAddress(event) {
        event.preventDefault();
        
        var addressInfo = $('#addressInfo').val();
        
        // parse the address and lookup the info
        getCollectionInfo(addressInfo, function(error,result){
            
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
                    
                    //Make sure the autocomplete list is hidden
                    $('#addressInfo').autocomplete('close');
            
                    // remove and redraw the calendar
                    $('#calendar').html('').fullCalendar({
                    // add the calendar entries...
                        events: events
                    });
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
        
        var addressParsed, streetId, query;
        
        if (!addressInfo){
            callback('Le champs addresse est requis.');
            return;
        }
        
        
        addressParsed = parseAddress(addressInfo);
        
        streetId = getStreetId(addressParsed);
        
        query = [
            'select * from html where url = ',
            "'http://cartes.gatineau.ca/ArcGisServices/GisRecyclGat/FrmGATINEAU.aspx?",
            'NumeCivi=', addressParsed.numero, '&NumRue=', streetId, "'",
            "and xpath = '//textarea'"
        ].join('');
        
        
        $.YQL(query, function (data) {
            var content = data.query.results.textarea.content;
            
            callback(null, parseCollectTextareaContent(content));
        });
        
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
        
        //jour date keys
        //var result = {"adresse":"25 rue Laurier","secteur":"Secteur de Hull","jour":"vendredi","MC":"2012-09-28","MR":"2012-10-05","OM":"2012-09-28"}
        //callback(null,result);
    }
    
    function parseAddress(address){
        var addressParsed = {numero: 0,nom:''}
        var parseArray = []
        
        parseArray = address.match(/^(\d+)\s+(.+)/)
        addressParsed.numero = parseArray[1]
        addressParsed.nom = parseArray[2]
                
        return addressParsed
        
    }
    
    function getCalendarEvents(info, callback){
        
        var jour = info.jour
        var date = info.MC
        var events = []
        
        // Format collect info (from city service) to be able to get the sector
        var i = 0
        var collecteInfo = []
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
        
        $.getJSON('data/collecte2012.json', function (data) {
            
            var colorMap = {MC:'#8A4117',MR:'#2554C7',OM:'gray',AN:'#F62217',CR:'#3E3535'}
            var dataRow
            
            // Get the sector depending on the day, date and collecteInfo
            for (var i = 0, len = data.length; i < len; i++) {
                dataRow = data[i];
                if (dataRow.jour == jour && compareCollecteArray(collecteInfo, dataRow.collecte) && dataRow.date == date){
                    var secteur = dataRow.secteur;
                }
            }
            
            // Generate calendar events depending on sector and date            
            for (var i = 0, len = data.length; i < len; i++) {
                if (data[i].secteur == secteur && data[i].jour == jour){
                    for(var x = 0, collectLen = data[i].collecte.length; x < collectLen; x++){
                        dataRow = data[i].collecte[x]
                        events.push({title:dataRow,start:data[i].date,color:colorMap[dataRow]});
                    }
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



function buildURL(sourceAddress) {
    var resourceURL = "http://cartes.gatineau.ca/ArcGisServices/GisRecyclGat/FrmGATINEAU.aspx?Lang=FR&culture=fr-CA"
    var numeroCivique = "&NumeCivi=" + sourceAddress.numero;
    var numRue = "&NumRue=" + sourceAddress.rue_id;
    return resourceURL + numeroCivique + numRue;
}
