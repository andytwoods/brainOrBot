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
    var button_durations = [];
    //don't want to give user access to mutable data, hence deep clone of arrays of objects
    api.get_click_times_x_positions = function(){JSON.parse(JSON.stringify(click_times_x_positions))};
    api.get_button_durations = function(){JSON.parse(JSON.stringify(button_durations))};

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

    var mouseDownData;
    document.addEventListener("mousedown", mouseDownListener);
    document.addEventListener("mouseup", mouseUpListener);
    function mouseDownListener(e){
        var click_timestamp = now();
        var down_time = click_timestamp - start_timestamp;

        mouseDownData = {
            'button': e.button,
            'down_time': down_time,
            'preClick': gather_movements_between(down_time - api.preClickTime, down_time)
        };
    }

    function mouseUpListener(e){
        if(!mouseDownData) return;
        if(mouseDownData['button'] !== e.button) return;
        var click_timestamp = now();
        var up_time = click_timestamp - start_timestamp;
        var mouse_pressed_dur = up_time - mouseDownData['down_time'];

        // need localised clone in case lots of quick button presses (and overwriting of initial var)
        var mouseData = JSON.parse(JSON.stringify(mouseDownData));
        mouseDownData = undefined;

        mouseData['up_time'] = up_time;
        mouseData['pressed_dur'] = mouse_pressed_dur;

        setTimeout(function () {
            mouseData['postClick'] = gather_movements_between(up_time, up_time + api.postClickTime);
            click_times_x_positions.push(mouseData)
        }, api.postClickTime)
    }

    function key(e){
        e = e || window.event;
        var charCode = e.keyCode || e.which;
        return String.fromCharCode(charCode);
    }

    var keyDownData = undefined;
    document.addEventListener("keydown", keydownListener);
    document.addEventListener("keyup", keyupListener);
    function keydownListener(e){
        var k = key(e);

        //keyboard buttons can be held down. Each new letter printed emits this event.
        if(keyDownData){
            if(keyDownData['key']!==k){
                keyDownData = undefined;
            }
            else{
                keyDownData['count']++;
                return
            }
        }

        var key_timestamp = now();
        var down_time = key_timestamp - start_timestamp;

        keyDownData = {
            'key': k,
            'down_time': down_time,
            'count': 1
        };


    }
    function keyupListener(e){
        var k = key(e);
        if(!keyDownData) return;
        if(keyDownData['key'] !== k) return;
        var click_timestamp = now();
        var up_time = click_timestamp - start_timestamp;
        var key_pressed_dur = up_time - keyDownData['down_time'];

        // need localised clone in case lots of quick button presses (and overwriting of initial var)
        var buttonData = JSON.parse(JSON.stringify(keyDownData));
        keyDownData = undefined;

        buttonData['up_time'] = up_time;
        buttonData['pressed_dur'] = key_pressed_dur;

        button_durations.push(buttonData);
    }


}());