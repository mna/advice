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

  describe('happy mix', function() {
    it('should allow before and after on the same method', function() {
      var str = 'test',
        obj = {
          base: function(v) {
            str += 'base'
            return str
          }
        },
        fnAfter = function(v) {
          str += 'after'
          return str
        },
        fnBefore = function(v) {
          str += 'before'
          return str
        },
        spyBase = sinon.spy(obj, 'base'),
        spyAfter = sinon.spy(fnAfter),
        spyBefore = sinon.spy(fnBefore)

      sut.call(obj)
      obj.before('base', spyBefore)
      obj.after('base', spyAfter)
      expect(obj.base(str)).to.be('testbeforebase')
      expect(str).to.be('testbeforebaseafter')
      expect(spyBase.calledOnce).to.be(true)
      expect(spyBefore.calledOnce).to.be(true)
      expect(spyAfter.calledOnce).to.be(true)
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

    it('should not call the base if before gets an error', function(done) {
      var str = 'test',
        obj = {
          base: function(text, cb) {
            str += 'base'
            cb(null, str)
          }
        },
        hijack = function(text, cb) {
          str += 'hijack'
          cb(new Error(), str)
        },
        spyBase = sinon.spy(obj, 'base'),
        spyHijack = sinon.spy(hijack)

      sut.call(obj)
      obj.hijackBefore('base', spyHijack, true)
      obj.base(str, function(er, text) {
        expect(er).to.be.ok()
        expect(spyBase.callCount).to.be(0)
        expect(spyHijack.calledOnce).to.be(true)
        done()
      })
    })

    it('should call the hijack method with the same args as passed to the original', function(done) {
      var str = 'test',
        num = 8,
        dt = new Date(),
        bool = true,
        obj = {
          base: function(str, num, dt, bool, cb) {
            cb()
          }
        },
        hijack = function(str, num, dt, bool, cb) {
          cb()
        },
        spyBase = sinon.spy(obj, 'base'),
        spyHijack = sinon.spy(hijack)

      sut.call(obj)
      obj.hijackBefore('base', spyHijack)
      obj.base(str, num, dt, bool, function() {
        expect(spyBase.calledOnce).to.be(true)
        expect(spyBase.calledWith(str, num, dt, bool)).to.be(true)
        expect(spyHijack.calledOnce).to.be(true)
        expect(spyHijack.calledWith(str, num, dt, bool)).to.be(true)
        done()
      })
    })
  })

  describe('.hijackAfter()', function() {
    it('should be a function on the augmented object', function() {
      var obj = {}
      sut.call(obj)
      expect(obj.hijackAfter).to.be.a('function')
    })

    it('should call the hijack method after the original', function(done) {
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
        obj.hijackAfter('base', spyHijack)
        obj.base(str, function(text) {
          expect(text).to.be('testbasehijack')
          // Called twice because once without hijack
          expect(spyBase.calledTwice).to.be(true)
          expect(spyHijack.calledOnce).to.be(true)
          done()
        })
      })
    })

    it('should not get called if the base gets an error', function(done) {
      var str = 'test',
        obj = {
          base: function(text, cb) {
            str += 'base'
            cb(new Error())
          }
        },
        hijack = function(text, cb) {
          str += 'hijack'
        },
        spyBase = sinon.spy(obj, 'base'),
        spyHijack = sinon.spy(hijack)

      sut.call(obj)
      obj.hijackAfter('base', spyHijack, true)
      obj.base(str, function(er, text) {
        expect(er).to.be.ok()
        expect(spyBase.calledOnce).to.be(true)
        expect(spyHijack.callCount).to.be(0)
        done()
      })
    })

    it('should call the hijack method with the same args as passed to the original', function(done) {
      var str = 'test',
        num = 8,
        dt = new Date(),
        bool = true,
        obj = {
          base: function(str, num, dt, bool, cb) {
            cb()
          }
        },
        hijack = function(str, num, dt, bool, cb) {
          cb()
        },
        spyBase = sinon.spy(obj, 'base'),
        spyHijack = sinon.spy(hijack)

      sut.call(obj)
      obj.hijackAfter('base', spyHijack)
      obj.base(str, num, dt, bool, function() {
        expect(spyBase.calledOnce).to.be(true)
        expect(spyBase.calledWith(str, num, dt, bool)).to.be(true)
        expect(spyHijack.calledOnce).to.be(true)
        expect(spyHijack.calledWith(str, num, dt, bool)).to.be(true)
        done()
      })
    })
  })
})
