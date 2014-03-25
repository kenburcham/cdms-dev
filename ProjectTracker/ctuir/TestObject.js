define(['dojo/_base/declare'], function (declare) {

    var privateValue = 55;

    return declare(null, {

        theOtherValue: 10,

        increment: function () {
            privateValue++;
        },
        decrement: function () {
            privateValue--;
        },
        getValue: function () {
            return privateValue;
        },

        sayHi: function() {
            console.log("Hi there: " + privateValue);
            this.decrement();
            console.log("and now: " + privateValue);

            console.log("Hi there2: " + this.theOtherValue);
            this.theOtherValue--;
            console.log("and now2: " + this.theOtherValue);

        }

    });
});