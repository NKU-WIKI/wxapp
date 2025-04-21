module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1745223150783, function(require, module, exports) {
var fs = require('fs')

var path = __dirname + '/keywords'

var map = {}

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream(path, {encoding: 'UTF-8'})
});

lineReader.on('line', function (line) {
  if(!line) return
  addWord(line)
});

function addWord(word) {

  var parent = map

  for (var i = 0; i < word.length; i++) {
    if (!parent[word[i]]) parent[word[i]] = {}
    parent = parent[word[i]]
  }
  parent.isEnd = true
}

function filter(s, cb) {
  var parent = map

  for (var i = 0; i < s.length; i++) {
    if (s[i] == '*') {
      continue
    }

    var found = false
    var skip = 0
    var sWord = ''

    for (var j = i; j < s.length; j++) {

      if (!parent[s[j]]) {
        // console.log('skip ', s[j])
        found = false
        skip = j - i
        parent = map
        break;
      }

      sWord = sWord + s[j]
      if (parent[s[j]].isEnd) {
        found = true
        skip = j - i
        break
      }
      parent = parent[s[j]]
    }

    if (skip > 1) {
      i += skip - 1
    }

    if (!found) {
      continue
    }

    var stars = '*'
    for (var k = 0; k < skip; k++) {
      stars = stars + '*'
    }

    var reg = new RegExp(sWord, 'g')
    s = s.replace(reg, stars)

  }

  if(typeof cb === 'function'){
    cb(null, s)
  }

  return s
}

module.exports = {
  filter: filter
}

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1745223150783);
})()
//miniprogram-npm-outsideDeps=["fs","readline"]
//# sourceMappingURL=index.js.map