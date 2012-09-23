$(document).ready(function() {    
    
    $('#entryform').submit(function(){
        $("#entry").hide(); 
        $("#result").show();
        
        $('#calendar').html('').fullCalendar({
            // put your options and callbacks here
        });
        return false;
    });
    
    $('#restart').click(function(){
        $("#entry").show(); 
        $("#result").hide();
    });    
    function getCollectionInfo(address, cb){
        var location = parseAddress(address);
        var result = $.get(function(){});
        cb(result);
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
