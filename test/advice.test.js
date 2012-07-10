var expect = require('expect.js'),
  sinon = require('sinon'),
  sut = require(process.env.ADV_COV ? '../lib-cov/advice' : '../lib/advice')

describe('advice', function() {
  it('should export a function', function() {
    expect(sut).to.be.a('function')
  })

  it('should augment an object with the mixins', function() {
    var obj = {
      fn: function() {}
    }

    sut.call(obj)
    expect(obj).to.only.have.keys('before', 'after', 'around', 'hijackBefore', 'hijackAfter', 'fn')
  })

  it('should leave the object working as before', function() {
    var obj = {
      fn: function() {return 'test'}
    }

    sut.call(obj)
    expect(obj.fn()).to.be('test')
  })

  describe('.before()', function() {
    it('should be a function on the augmented object', function() {
      var obj = {}
      sut.call(obj)
      expect(obj.before).to.be.a('function')
    })

    it('should call the before function as well as the base target', function() {
      var num = 0,
        obj = {
          fn: function(val) {
            num += val * 2
            return num
          }
        },
        beforeFn = function(val) {
          num += val
          return num
        },
        spy = sinon.spy(beforeFn)

      sut.call(obj)
      obj.before('fn', spy)

      expect(obj.fn(2)).to.be(6)
      expect(spy.calledOnce).to.be(true)
    })

    it('should call the before function before the base target', function() {
      var num = 0,
        obj = {
          fn: function(val) {
            num += val * 2
            return num
          }
        },
        beforeFn = function(val) {
          num += val
          return num
        },
        spyBase = sinon.spy(obj, 'fn'),
        spyBefore = sinon.spy(beforeFn)

      sut.call(obj)
      obj.before('fn', spyBefore)
      obj.fn(4)

      expect(spyBase.calledOnce).to.be(true)
      expect(spyBefore.calledOnce).to.be(true)
      expect(spyBefore.calledBefore(spyBase)).to.be(true)
    })

    it('should allow multiple before functions', function() {
      var num = 0,
        obj = {
          fn: function(val) {
            num += val * 2
            return num
          }
        },
        beforeFn = function(val) {
          num += val
          return num
        },
        beforeFn2 = function(val) {
          num += val + 1
          return num
        },
        spyBase = sinon.spy(obj, 'fn'),
        spyBefore = sinon.spy(beforeFn),
        spyBefore2 = sinon.spy(beforeFn2)

      sut.call(obj)
      obj.before('fn', spyBefore)
      obj.before('fn', spyBefore2)

      expect(obj.fn(3)).to.be(13)
      expect(spyBase.calledOnce).to.be(true)
      expect(spyBefore.calledOnce).to.be(true)
      expect(spyBefore2.calledOnce).to.be(true)
      expect(spyBefore.calledBefore(spyBase)).to.be(true)
      expect(spyBefore2.calledBefore(spyBefore)).to.be(true)
    })
  })

  describe('.after()', function() {
    it('should be a function on the augmented object', function() {
      var obj = {}
      sut.call(obj)
      expect(obj.after).to.be.a('function')
    })

    it('should call the after function as well as the base target', function() {
      var num = 0,
        obj = {
          fn: function(val) {
            num += val * 2
            return num
          }
        },
        afterFn = function(val) {
          num += val
          return num
        },
        spy = sinon.spy(afterFn)

      sut.call(obj)
      obj.after('fn', spy)
      obj.fn(5)

      expect(num).to.be(15)
      expect(spy.calledOnce).to.be(true)
    })

    it('should call the after function after the base target', function() {
      var num = 0,
        obj = {
          fn: function(val) {
            num += val * 2
            return num
          }
        },
        afterFn = function(val) {
          num += val
          return num
        },
        spyBase = sinon.spy(obj, 'fn'),
        spyAfter = sinon.spy(afterFn)

      sut.call(obj)
      obj.after('fn', spyAfter)
      obj.fn(4)

      expect(spyBase.calledOnce).to.be(true)
      expect(spyAfter.calledOnce).to.be(true)
      expect(spyAfter.calledAfter(spyBase)).to.be(true)
    })

    it('should allow multiple after functions', function() {
      var num = 0,
        obj = {
          fn: function(val) {
            num += val * 2
            return num
          }
        },
        afterFn = function(val) {
          num += val
          return num
        },
        afterFn2 = function(val) {
          num += val + 1
          return num
        },
        spyBase = sinon.spy(obj, 'fn'),
        spyAfter = sinon.spy(afterFn),
        spyAfter2 = sinon.spy(afterFn2)

      sut.call(obj)
      obj.after('fn', spyAfter)
      obj.after('fn', spyAfter2)

      // The returned value is the one from the original method!
      expect(obj.fn(4)).to.be(8)
      expect(num).to.be(17)
      expect(spyBase.calledOnce).to.be(true)
      expect(spyAfter.calledOnce).to.be(true)
      expect(spyAfter2.calledOnce).to.be(true)
      expect(spyAfter.calledAfter(spyBase)).to.be(true)
      expect(spyAfter2.calledAfter(spyAfter)).to.be(true)
    })
  })

  describe('.around()', function() {
    it('should be a function on the augmented object', function() {
      var obj = {}
      sut.call(obj)
      expect(obj.after).to.be.a('function')
    })

    it('should call the new method with the original method as first argument', function() {
      var obj = {
          fn: function(a) {
            return a + 'original'
          }
        },
        aroundFn = function(baseFn, a) {
          a = a + 'ar'
          return baseFn(a) + 'ound'
        },
        spy = sinon.spy(aroundFn)

        sut.call(obj)
        obj.around('fn', spy)
        
        expect(obj.fn('vide')).to.be('videaroriginalound')
        expect(spy.calledOnce).to.be(true)
    })
  })

  describe('.hijackBefore()', function() {
    it('should be a function on the augmented object', function() {
      var obj = {}
      sut.call(obj)
      expect(obj.hijackBefore).to.be.a('function')
    })

    it('should call the hijack method before the original', function(done) {
      var str = 'test',
        obj = {
          base: function(text, cb) {
            str += 'base'
            cb(str)
          }
        },
        hijack = function(text, cb) {
          str += 'hijack'
          cb(str)
        },
        spyBase = sinon.spy(obj, 'base'),
        spyHijack = sinon.spy(hijack)

      sut.call(obj)
      obj.base(str, function(text) {
        expect(text).to.be('testbase')
        expect(str).to.be('testbase')

        str = 'test'
        obj.hijackBefore('base', spyHijack)
        obj.base(str, function(text) {
          expect(text).to.be('testhijackbase')
          // Called twice because once without hijack
          expect(spyBase.calledTwice).to.be(true)
          expect(spyHijack.calledOnce).to.be(true)
          done()
        })
      })
    })
  })
})
