module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1745317231124, function(require, module, exports) {


module.exports = levenshtein

var cache = []
var codes = []

function levenshtein(value, other, insensitive) {
  var length
  var lengthOther
  var code
  var result
  var distance
  var distanceOther
  var index
  var indexOther

  if (value === other) {
    return 0
  }

  length = value.length
  lengthOther = other.length

  if (length === 0) {
    return lengthOther
  }

  if (lengthOther === 0) {
    return length
  }

  if (insensitive) {
    value = value.toLowerCase()
    other = other.toLowerCase()
  }

  index = 0

  while (index < length) {
    codes[index] = value.charCodeAt(index)
    cache[index] = ++index
  }

  indexOther = 0

  while (indexOther < lengthOther) {
    code = other.charCodeAt(indexOther)
    result = distance = indexOther++
    index = -1

    while (++index < length) {
      distanceOther = code === codes[index] ? distance : distance + 1
      distance = cache[index]
      cache[index] = result =
        distance > result
          ? distanceOther > result
            ? result + 1
            : distanceOther
          : distanceOther > distance
          ? distance + 1
          : distanceOther
    }
  }

  return result
}

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1745317231124);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map