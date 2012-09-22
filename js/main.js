$(document).ready(function() {

    $('#calendar').fullCalendar({
        // put your options and callbacks here
    })
    
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
