//doing this in ES5 to encourage fresh developers to contribute (so they avoid the headache of ES6 / JS Fatigue)

// let's run the function immediately, keeping it's contents entirely isolated from runtime
(function () {

    //lets create an API to quiz brainOrBot
    var api = {};
    window.brainOrBot = api;

    api.preClickTime = 500; //ms
    api.postClickTime = 500;
    api.get_click_times_x_positions = undefined; //defined later

    // lets create an accurate way to measure time offset
    // modified from http://gent.ilcore.com/2012/06/better-timer-for-javascript.html

    var now = (function () {
        if (performance.now) return function () {
            return performance.now()
        };
        else return function () {
            return new Date().getTime()
        }
    })();

    var start_timestamp = now();

    var click_durations_x_positions = [];
    var button_durations = [];
    //don't want to give user access to mutable data, hence deep clone of arrays of objects
    api.get_click_times_x_positions = function () {
        JSON.parse(JSON.stringify(click_durations_x_positions))
    };
    api.get_button_durations = function () {
        JSON.parse(JSON.stringify(button_durations))
    };

    //get the distribution of clicks from x to y ms in chunks of z milliseconds
    api.get_click_dist = function(from, to, ms_chunks){
       var filtered = filter_durations('click', from, to);
       return down_time(filtered, ms_chunks);
    };

    api.get_button_dist = function(from, to, ms_chunks){
        var filtered = filter_durations('button', from, to);
        return down_time(filtered, ms_chunks)
    };

    function down_time(items, ms_chunks){
        ms_chunks = ms_chunks || 1 * 1000; // 1 second chunks

        var bins = [];

        var item;
        var bin;
        var duration;
        var down_time;

        for(i=0;i<items.length;i++){
            item = items[i];
            duration = item['duration'];
            down_time = item['down_time']
            bin = Math.ceil(down_time / ms_chunks);
            while(bins.length<bin+1){
                bins.push([]);
            }
            bins[bin].push(duration);
        }


        var averages = [];
        var list;
        for(i=0;i<bins.length;i++){
            list=bins[i];
            averages.push(average(list))
        }
        return averages;
    }

    function average(list){
        if(list.length===0) return '';
        var total = 0;
        for(var i=0;i<list.length;i++){
            total += list[i];
        }
        return total / list.length;
    }

    function filter_durations(what, from, to){
        from = from || 0;

        var data;
        if(what==='click') data = click_durations_x_positions;
        else if(what==='button') data = button_durations;
        else throw('unknown data type to use for distribution');

        var item;
        var down_time;
        var filtered = []
        for(var i=0;i<data.length;i++){
            item = data[i];
            down_time = item['down_time'];
            if(to) {
                if (down_time > to) break;
            }
            if(down_time > from){
                filtered.push(item);
            }
        }

        return filtered;
    }


    // detect mouse movement and note mouse position with 'time from start'
    document.addEventListener("mousemove", mouseMoveListener);

    function mouseMoveListener(e) {
        //from https://plainjs.com/javascript/events/getting-the-current-mouse-position-16/
        e = e || window.event;

        var pageX = e.pageX;
        var pageY = e.pageY;

        // IE 8
        if (pageX === undefined) {
            pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        click_durations_x_positions.push({x: pageX, y: pageY, time: now() - start_timestamp});
    }

    function gather_movements_between(start_time, end_time) {

        var time_range = [];
        var position;
        for (var i = click_durations_x_positions.length - 1; i >= 0; i--) {
            position = click_durations_x_positions[i];
            if (position['time'] < start_time) {
                // let's remove old data
                click_durations_x_positions.splice(0, i - 1);
                break;
            }
            if (position['time'] < end_time) {
                time_range.push(position);
            }
        }
        return time_range;
    }

    var mouseDownData;
    document.addEventListener("mousedown", mouseDownListener);
    document.addEventListener("mouseup", mouseUpListener);

    function mouseDownListener(e) {
        var click_timestamp = now();
        var down_time = click_timestamp - start_timestamp;

        mouseDownData = {
            'button': e.button,
            'down_time': down_time,
            'preClick': gather_movements_between(down_time - api.preClickTime, down_time)
        };
    }

    function mouseUpListener(e) {
        if (!mouseDownData) return;
        if (mouseDownData['button'] !== e.button) return;
        var click_timestamp = now();
        var up_time = click_timestamp - start_timestamp;
        var mouse_pressed_dur = up_time - mouseDownData['down_time'];

        // need localised clone in case lots of quick button presses (and overwriting of initial var)
        var mouseData = JSON.parse(JSON.stringify(mouseDownData));
        mouseDownData = undefined;
        mouseData['up_time'] = up_time;
        mouseData['duration'] = mouse_pressed_dur;

        setTimeout(function () {
            mouseData['postClick'] = gather_movements_between(up_time, up_time + api.postClickTime);
            click_durations_x_positions.push(mouseData)
        }, api.postClickTime)
    }

    function key(e) {
        e = e || window.event;
        if(e.key){
            return e.key;
        }
        var charCode = e.keyCode || e.which;
        return String.fromCharCode(charCode);
    }

    var keyDownData = undefined;
    document.addEventListener("keydown", keydownListener);
    document.addEventListener("keyup", keyupListener);

    function keydownListener(e) {
        var k = key(e);
        //keyboard buttons can be held down. Each new letter printed emits this event.
        if (keyDownData) {
            if (keyDownData['key'] !== k) {
                keyDownData = undefined;
            }
            else {
                keyDownData['count']++;
                return
            }
        }

        var key_timestamp = now();
        var down_time = key_timestamp - start_timestamp;

        keyDownData = {
            'key': k,
            'keycode': e.keyCode || e.which,
            'location': e.location,
            'down_time': down_time,
            'count': 1
        };
    }

    function keyupListener(e) {
        var k = key(e);
        if (!keyDownData) return;
        if (keyDownData['key'] !== k) return;
        var click_timestamp = now();
        var up_time = click_timestamp - start_timestamp;
        var key_pressed_dur = up_time - keyDownData['down_time'];

        // need localised clone in case lots of quick button presses (and overwriting of initial var)
        var buttonData = JSON.parse(JSON.stringify(keyDownData));
        keyDownData = undefined;

        buttonData['up_time'] = up_time;
        buttonData['duration'] = key_pressed_dur;

        button_durations.push(buttonData);
    }


}());