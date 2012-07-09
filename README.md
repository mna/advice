# Advice Functional Mixins

This tiny library implements the advice functional mixins presented in Twitter's [Angus Croll][croll]'s presentation [How we learned to stop worrying and love Javascript][slides].

## Installation

`npm install advice`

## Features

Based on Croll's [gist][], the advice library augments a target object with `after`, `before`, and `around`. I added 2 more mixins well suited for node's callback style, `hijackBefore` and `hijackAfter`.



[croll]: https://github.com/angus-c/
[slides]: https://speakerdeck.com/u/anguscroll/p/how-we-learned-to-stop-worrying-and-love-javascript
[gist]: https://gist.github.com/2864853
