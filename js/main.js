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
        var result = traitment();
        var result = $.get(function(){});
        cb(result);
    }
    
    function fillCalendar(info){
       var days = getCalendarFromInfo(info);
       mycal.apiMethod1();
    }
    
});
