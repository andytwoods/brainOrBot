// let's run the function immediately, keeping it's contents entirely isolated from runtime
(function(){

    //lets create an API to quiz brainOrBot
    var api = {};
    window.brainOrBot = api;

    api.preClickTime = 500; //ms
    api.postClickTime = 500;
    api.get_click_times_x_positions = undefined; //defined later

    // lets create an accurate way to measure time offset
    // modified from http://gent.ilcore.com/2012/06/better-timer-for-javascript.html

    var now = (function() {
        if(performance.now) return function(){ return performance.now()};
        else return function(){return new Date().getTime()}
    })();

    var start_timestamp = now() ;

    var click_times_x_positions = [];
    //don't want to give user access to mutable data, hence deep clone of arrays of objects
    api.get_click_times_x_positions = function(){JSON.parse(JSON.stringify(click_times_x_positions))};

    // detect mouse movement and note mouse position with 'time from start'
    document.addEventListener("mousemove", mouseMoveListener);
    function mouseMoveListener(e){
        //from https://plainjs.com/javascript/events/getting-the-current-mouse-position-16/
        e = e || window.event;

        var pageX = e.pageX;
        var pageY = e.pageY;

        // IE 8
        if (pageX === undefined) {
            pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        click_times_x_positions.push({x: pageX, y: pageY, time: now() - start_timestamp});
    }

    function gather_movements_between(start_time, end_time){

        var time_range = [];
        var position;
        for(var i=click_times_x_positions.length-1;i>=0; i--){
            position = click_times_x_positions[i];
            if(position['time'] < start_time){
                // let's remove old data
                click_times_x_positions.splice(0, i-1);
                break;
            }
            if(position['time'] < end_time){
                time_range.push(position);
            }
        }
        return time_range;
    }

    document.addEventListener("click", mouseClickListener);
    function mouseClickListener(e){
        var click_timestamp = now();
        var click_time = click_timestamp - start_timestamp;

        var data = {
            'click_time': click_time,
            'preClick': gather_movements_between(click_time - api.preClickTime, click_time)
        };

        setTimeout(function () {
            data['postClick'] = gather_movements_between(click_time, click_time + api.postClickTime);
        }, api.postClickTime)
    }

    function key(e){
        e = e || window.event;
        var charCode = e.keyCode || e.which;
        return String.fromCharCode(charCode);
    }

    document.addEventListener("keydown", keydownListener);
    document.addEventListener("keyup", keyupListener);
    function keydownListener(e){
        var k = key(e);
    }
    function keyupListener(e){
        var k = key(e);
    }


}());