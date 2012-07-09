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
            console.log(num)
            return num
          }
        },
        afterFn = function(val) {
          num += val
          console.log(num)
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
  })
})
