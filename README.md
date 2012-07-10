# Advice Functional Mixins

This tiny library implements the advice functional mixins presented in Twitter's [Angus Croll][croll]'s presentation [How we learned to stop worrying and love Javascript][slides].

## Installation

`npm install advice`

## Features

Based on Croll's [gist][], the advice library augments a target object with `after`, `before`, and `around`. I added 2 more mixins well suited for node's callback style, `hijackBefore` and `hijackAfter`. Works in node as well as in the browser. Should be compliant with any CommonJS loader (require-style, such as [Browserify][]), AMD-style loader (define-style, such as [RequireJS][]), and it falls back on global variable (`window.advice`).

## Usage

To augment an object with the advices, simply call the method in the context of the object to augment:

    var myObj = {fn: function() {}},
      withAdvice = require('advice')

    withAdvice.call(myObj)
    myObj.before(fn, function() {
        // Do some crazy stuff to happen before fn()
      })

    // Then simply call the function, and the "before" function will be executed prior to the base fn() function.
    myObj.fn()

Obviously, it can also be called on an object's prototype so that every instance created with the constructor can benefit from the mixins.

    var withAdvice = require('advice')

    var User = function(name) {
      this.name = name
    }

    withAdvice.call(User.prototype)

### .before(methodName, fn)

Wraps the method identified by `methodName` so that `fn` gets called before `methodName`. The return value is the return value of the **original** `methodName` function.

### .after(methodName, fn)

Wraps the method identified by `methodName` so that `fn` gets called after `methodName`. The return value is the return value of the **original** `methodName` function.

### .around(methodName, fn)

Wraps the method identified by `methodName` and passes the original method as first argument. It is up to the new method to decide when to call the original method, and what return value to return.

### .hijackBefore(methodName, fn[, firstArgIsError])

Wraps the method identified by `methodName` so that when it gets called, the new method is called first. It basically chains the methods in this order: newFn->privateCb->oriFn->oriCb. It presumes the last argument is a callback function. If the new method returns an error as first argument, and `firstArgIsError` is set to `true`, then the base method is skipped and the error is sent to the original callback as first argument.

[croll]: https://github.com/angus-c/
[slides]: https://speakerdeck.com/u/anguscroll/p/how-we-learned-to-stop-worrying-and-love-javascript
[gist]: https://gist.github.com/2864853
[browserify]: https://github.com/substack/node-browserify
[requirejs]: http://requirejs.org/
