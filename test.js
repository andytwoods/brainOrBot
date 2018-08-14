var test = require('tape');
var fs = require('fs');


//////////////
//let's mock some browser features
var performance = {
    now: function () {
        return 0
    }
};
var window = {};
var document = {
    addEventListener: function () {
    }, body: {scrollLeft: 0, scrollRight: 0}, clientX: 0, clientY: 0, documentElement: {scrollleft: 0, scrollTop: 0}
};
//////////////

try {
    //load in our code
    var str_code = fs.readFileSync('index.js', 'utf8');
    //break into anonymous function
    var strip_from_code = ['(function(){', '}());']
    for (var i = 0; i < strip_from_code.length; i++) {
        str_code = str_code.split(strip_from_code[i]).join('');
    }
    //let's get access to the private functions
    eval(str_code);
    //and start doing tests
    tests();
} catch (e) {
    console.log('Error:', e.stack);
}

function tests() {

    performance = {now: function(){return 123}};

    test('My first test', function (assert) {
        assert.equal(now(), 123, 'Numbers 1 and 2 are the same');
        assert.end();
    });

}