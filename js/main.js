$(document).ready(function() {    
    // wire up the submt and return buttons
    $('#entryform').submit(submitAddress);    
    $('#restart').click(returnToAddressEntry);

    // console.log('coco');
    
    function submitAddress(event){
        event.preventDefault();
        var addressInfo = $('#addressInfo').val();
        // parse the address and lookup the info
        getCollectionInfo(addressInfo,function(error,result){
            console.log('addressInfo',addressInfo);
            if (error){
                $('#addressErrorMessage').text(error);
                $('#addressError').show();
            } else {
                $("#entry").hide(); 
                
                $("#addressResult").text(JSON.stringify(result));
                
                $("#result").show();
                
                // remove and redraw the calendar
                $('#calendar').html('').fullCalendar({
                    // put your options and callbacks here
                });
            }
        });
    }
    
    // navigation back to initial address entry screen
    function returnToAddressEntry(){
        $("#result").hide();
        // remove the calendar, so it is ready to be redrawn on next submit
        $('#calendar').html('');

        $('#addressErrorMessage').text('');
        $('#addressError').hide();
        $("#entry").show(); 
    }
    
    // -cette fonction parse l'addresse soumise,
    // -va chercher l'info sur le site de la ville
    // parse l'info retourne par lle service
    // the callback's signature should be callback(error,result)
    function getCollectionInfo(addressInfo, callback){
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
