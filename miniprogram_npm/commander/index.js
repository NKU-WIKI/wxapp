module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1745223150777, function(require, module, exports) {
/*!
 * commander
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter
  , spawn = require('child_process').spawn
  , keypress = require('keypress')
  , fs = require('fs')
  , exists = fs.existsSync
  , path = require('path')
  , tty = require('tty')
  , dirname = path.dirname
  , basename = path.basename;

/**
 * Expose the root command.
 */

exports = module.exports = new Command;

/**
 * Expose `Command`.
 */

exports.Command = Command;

/**
 * Expose `Option`.
 */

exports.Option = Option;

/**
 * Initialize a new `Option` with the given `flags` and `description`.
 *
 * @param {String} flags
 * @param {String} description
 * @api public
 */

function Option(flags, description) {
  this.flags = flags;
  this.required = ~flags.indexOf('<');
  this.optional = ~flags.indexOf('[');
  this.bool = !~flags.indexOf('-no-');
  flags = flags.split(/[ ,|]+/);
  if (flags.length > 1 && !/^[[<]/.test(flags[1])) this.short = flags.shift();
  this.long = flags.shift();
  this.description = description || '';
}

/**
 * Return option name.
 *
 * @return {String}
 * @api private
 */

Option.prototype.name = function(){
  return this.long
    .replace('--', '')
    .replace('no-', '');
};

/**
 * Check if `arg` matches the short or long flag.
 *
 * @param {String} arg
 * @return {Boolean}
 * @api private
 */

Option.prototype.is = function(arg){
  return arg == this.short
    || arg == this.long;
};

/**
 * Initialize a new `Command`.
 *
 * @param {String} name
 * @api public
 */

function Command(name) {
  this.commands = [];
  this.options = [];
  this._args = [];
  this._name = name;
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Command.prototype.__proto__ = EventEmitter.prototype;

/**
 * Add command `name`.
 *
 * The `.action()` callback is invoked when the
 * command `name` is specified via __ARGV__,
 * and the remaining arguments are applied to the
 * function for access.
 *
 * When the `name` is "*" an un-matched command
 * will be passed as the first arg, followed by
 * the rest of __ARGV__ remaining.
 *
 * Examples:
 *
 *      program
 *        .version('0.0.1')
 *        .option('-C, --chdir <path>', 'change the working directory')
 *        .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
 *        .option('-T, --no-tests', 'ignore test hook')
 *     
 *      program
 *        .command('setup')
 *        .description('run remote setup commands')
 *        .action(function(){
 *          console.log('setup');
 *        });
 *     
 *      program
 *        .command('exec <cmd>')
 *        .description('run the given remote command')
 *        .action(function(cmd){
 *          console.log('exec "%s"', cmd);
 *        });
 *     
 *      program
 *        .command('*')
 *        .description('deploy the given env')
 *        .action(function(env){
 *          console.log('deploying "%s"', env);
 *        });
 *     
 *      program.parse(process.argv);
  *
 * @param {String} name
 * @param {String} [desc]
 * @return {Command} the new command
 * @api public
 */

Command.prototype.command = function(name, desc){
  var args = name.split(/ +/);
  var cmd = new Command(args.shift());
  if (desc) cmd.description(desc);
  if (desc) this.executables = true;
  this.commands.push(cmd);
  cmd.parseExpectedArgs(args);
  cmd.parent = this;
  if (desc) return this;
  return cmd;
};

/**
 * Add an implicit `help [cmd]` subcommand
 * which invokes `--help` for the given command.
 *
 * @api private
 */

Command.prototype.addImplicitHelpCommand = function() {
  this.command('help [cmd]', 'display help for [cmd]');
};

/**
 * Parse expected `args`.
 *
 * For example `["[type]"]` becomes `[{ required: false, name: 'type' }]`.
 *
 * @param {Array} args
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.parseExpectedArgs = function(args){
  if (!args.length) return;
  var self = this;
  args.forEach(function(arg){
    switch (arg[0]) {
      case '<':
        self._args.push({ required: true, name: arg.slice(1, -1) });
        break;
      case '[':
        self._args.push({ required: false, name: arg.slice(1, -1) });
        break;
    }
  });
  return this;
};

/**
 * Register callback `fn` for the command.
 *
 * Examples:
 *
 *      program
 *        .command('help')
 *        .description('display verbose help')
 *        .action(function(){
 *           // output help here
 *        });
 *
 * @param {Function} fn
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.action = function(fn){
  var self = this;
  this.parent.on(this._name, function(args, unknown){    
    // Parse any so-far unknown options
    unknown = unknown || [];
    var parsed = self.parseOptions(unknown);
    
    // Output help if necessary
    outputHelpIfNecessary(self, parsed.unknown);
    
    // If there are still any unknown options, then we simply 
    // die, unless someone asked for help, in which case we give it
    // to them, and then we die.
    if (parsed.unknown.length > 0) {      
      self.unknownOption(parsed.unknown[0]);
    }
    
    // Leftover arguments need to be pushed back. Fixes issue #56
    if (parsed.args.length) args = parsed.args.concat(args);
    
    self._args.forEach(function(arg, i){
      if (arg.required && null == args[i]) {
        self.missingArgument(arg.name);
      }
    });
    
    // Always append ourselves to the end of the arguments,
    // to make sure we match the number of arguments the user
    // expects
    if (self._args.length) {
      args[self._args.length] = self;
    } else {
      args.push(self);
    }
    
    fn.apply(this, args);
  });
  return this;
};

/**
 * Define option with `flags`, `description` and optional
 * coercion `fn`. 
 *
 * The `flags` string should contain both the short and long flags,
 * separated by comma, a pipe or space. The following are all valid
 * all will output this way when `--help` is used.
 *
 *    "-p, --pepper"
 *    "-p|--pepper"
 *    "-p --pepper"
 *
 * Examples:
 *
 *     // simple boolean defaulting to false
 *     program.option('-p, --pepper', 'add pepper');
 *
 *     --pepper
 *     program.pepper
 *     // => Boolean
 *
 *     // simple boolean defaulting to false
 *     program.option('-C, --no-cheese', 'remove cheese');
 *
 *     program.cheese
 *     // => true
 *
 *     --no-cheese
 *     program.cheese
 *     // => true
 *
 *     // required argument
 *     program.option('-C, --chdir <path>', 'change the working directory');
 *
 *     --chdir /tmp
 *     program.chdir
 *     // => "/tmp"
 *
 *     // optional argument
 *     program.option('-c, --cheese [type]', 'add cheese [marble]');
 *
 * @param {String} flags
 * @param {String} description
 * @param {Function|Mixed} fn or default
 * @param {Mixed} defaultValue
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.option = function(flags, description, fn, defaultValue){
  var self = this
    , option = new Option(flags, description)
    , oname = option.name()
    , name = camelcase(oname);

  // default as 3rd arg
  if ('function' != typeof fn) defaultValue = fn, fn = null;

  // preassign default value only for --no-*, [optional], or <required>
  if (false == option.bool || option.optional || option.required) {
    // when --no-* we make sure default is true
    if (false == option.bool) defaultValue = true;
    // preassign only if we have a default
    if (undefined !== defaultValue) self[name] = defaultValue;
  }

  // register the option
  this.options.push(option);

  // when it's passed assign the value
  // and conditionally invoke the callback
  this.on(oname, function(val){
    // coercion
    if (null != val && fn) val = fn(val);

    // unassigned or bool
    if ('boolean' == typeof self[name] || 'undefined' == typeof self[name]) {
      // if no value, bool true, and we have a default, then use it!
      if (null == val) {
        self[name] = option.bool
          ? defaultValue || true
          : false;
      } else {
        self[name] = val;
      }
    } else if (null !== val) {
      // reassign
      self[name] = val;
    }
  });

  return this;
};

/**
 * Parse `argv`, settings options and invoking commands when defined.
 *
 * @param {Array} argv
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.parse = function(argv){
  // implicit help
  if (this.executables) this.addImplicitHelpCommand();

  // store raw args
  this.rawArgs = argv;

  // guess name
  this._name = this._name || basename(argv[1]);

  // process argv
  var parsed = this.parseOptions(this.normalize(argv.slice(2)));
  var args = this.args = parsed.args;
 
  // executable sub-commands, skip .parseArgs()
  if (this.executables) return this.executeSubCommand(argv, args, parsed.unknown);

  return this.parseArgs(this.args, parsed.unknown);
};

/**
 * Execute a sub-command executable.
 *
 * @param {Array} argv
 * @param {Array} args
 * @param {Array} unknown
 * @api private
 */

Command.prototype.executeSubCommand = function(argv, args, unknown) {
  args = args.concat(unknown);

  if (!args.length) this.help();
  if ('help' == args[0] && 1 == args.length) this.help();

  // <cmd> --help
  if ('help' == args[0]) {
    args[0] = args[1];
    args[1] = '--help';
  }

  // executable
  var dir = dirname(argv[1]);
  var bin = basename(argv[1]) + '-' + args[0];

  // check for ./<bin> first
  var local = path.join(dir, bin);
  if (exists(local)) bin = local;

  // run it
  args = args.slice(1);
  var proc = spawn(bin, args, { stdio: 'inherit', customFds: [0, 1, 2] });
  proc.on('exit', function(code){
    if (code == 127) {
      console.error('\n  %s(1) does not exist\n', bin);
    }
  });
};

/**
 * Normalize `args`, splitting joined short flags. For example
 * the arg "-abc" is equivalent to "-a -b -c".
 * This also normalizes equal sign and splits "--abc=def" into "--abc def".
 *
 * @param {Array} args
 * @return {Array}
 * @api private
 */

Command.prototype.normalize = function(args){
  var ret = []
    , arg
    , index;

  for (var i = 0, len = args.length; i < len; ++i) {
    arg = args[i];
    if (arg.length > 1 && '-' == arg[0] && '-' != arg[1]) {
      arg.slice(1).split('').forEach(function(c){
        ret.push('-' + c);
      });
    } else if (/^--/.test(arg) && ~(index = arg.indexOf('='))) {
      ret.push(arg.slice(0, index), arg.slice(index + 1));
    } else {
      ret.push(arg);
    }
  }

  return ret;
};

/**
 * Parse command `args`.
 *
 * When listener(s) are available those
 * callbacks are invoked, otherwise the "*"
 * event is emitted and those actions are invoked.
 *
 * @param {Array} args
 * @return {Command} for chaining
 * @api private
 */

Command.prototype.parseArgs = function(args, unknown){
  var cmds = this.commands
    , len = cmds.length
    , name;

  if (args.length) {
    name = args[0];
    if (this.listeners(name).length) {
      this.emit(args.shift(), args, unknown);
    } else {
      this.emit('*', args);
    }
  } else {
    outputHelpIfNecessary(this, unknown);
    
    // If there were no args and we have unknown options,
    // then they are extraneous and we need to error.
    if (unknown.length > 0) {      
      this.unknownOption(unknown[0]);
    }
  }

  return this;
};

/**
 * Return an option matching `arg` if any.
 *
 * @param {String} arg
 * @return {Option}
 * @api private
 */

Command.prototype.optionFor = function(arg){
  for (var i = 0, len = this.options.length; i < len; ++i) {
    if (this.options[i].is(arg)) {
      return this.options[i];
    }
  }
};

/**
 * Parse options from `argv` returning `argv`
 * void of these options.
 *
 * @param {Array} argv
 * @return {Array}
 * @api public
 */

Command.prototype.parseOptions = function(argv){
  var args = []
    , len = argv.length
    , literal
    , option
    , arg;

  var unknownOptions = [];

  // parse options
  for (var i = 0; i < len; ++i) {
    arg = argv[i];

    // literal args after --
    if ('--' == arg) {
      literal = true;
      continue;
    }

    if (literal) {
      args.push(arg);
      continue;
    }

    // find matching Option
    option = this.optionFor(arg);

    // option is defined
    if (option) {
      // requires arg
      if (option.required) {
        arg = argv[++i];
        if (null == arg) return this.optionMissingArgument(option);
        if ('-' == arg[0]) return this.optionMissingArgument(option, arg);
        this.emit(option.name(), arg);
      // optional arg
      } else if (option.optional) {
        arg = argv[i+1];
        if (null == arg || '-' == arg[0]) {
          arg = null;
        } else {
          ++i;
        }
        this.emit(option.name(), arg);
      // bool
      } else {
        this.emit(option.name());
      }
      continue;
    }
    
    // looks like an option
    if (arg.length > 1 && '-' == arg[0]) {
      unknownOptions.push(arg);
      
      // If the next argument looks like it might be
      // an argument for this option, we pass it on.
      // If it isn't, then it'll simply be ignored
      if (argv[i+1] && '-' != argv[i+1][0]) {
        unknownOptions.push(argv[++i]);
      }
      continue;
    }
    
    // arg
    args.push(arg);
  }
  
  return { args: args, unknown: unknownOptions };
};

/**
 * Argument `name` is missing.
 *
 * @param {String} name
 * @api private
 */

Command.prototype.missingArgument = function(name){
  console.error();
  console.error("  error: missing required argument `%s'", name);
  console.error();
  process.exit(1);
};

/**
 * `Option` is missing an argument, but received `flag` or nothing.
 *
 * @param {String} option
 * @param {String} flag
 * @api private
 */

Command.prototype.optionMissingArgument = function(option, flag){
  console.error();
  if (flag) {
    console.error("  error: option `%s' argument missing, got `%s'", option.flags, flag);
  } else {
    console.error("  error: option `%s' argument missing", option.flags);
  }
  console.error();
  process.exit(1);
};

/**
 * Unknown option `flag`.
 *
 * @param {String} flag
 * @api private
 */

Command.prototype.unknownOption = function(flag){
  console.error();
  console.error("  error: unknown option `%s'", flag);
  console.error();
  process.exit(1);
};


/**
 * Set the program version to `str`.
 *
 * This method auto-registers the "-V, --version" flag
 * which will print the version number when passed.
 *
 * @param {String} str
 * @param {String} flags
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.version = function(str, flags){
  if (0 == arguments.length) return this._version;
  this._version = str;
  flags = flags || '-V, --version';
  this.option(flags, 'output the version number');
  this.on('version', function(){
    console.log(str);
    process.exit(0);
  });
  return this;
};

/**
 * Set the description `str`.
 *
 * @param {String} str
 * @return {String|Command}
 * @api public
 */

Command.prototype.description = function(str){
  if (0 == arguments.length) return this._description;
  this._description = str;
  return this;
};

/**
 * Set / get the command usage `str`.
 *
 * @param {String} str
 * @return {String|Command}
 * @api public
 */

Command.prototype.usage = function(str){
  var args = this._args.map(function(arg){
    return arg.required
      ? '<' + arg.name + '>'
      : '[' + arg.name + ']';
  });

  var usage = '[options'
    + (this.commands.length ? '] [command' : '')
    + ']'
    + (this._args.length ? ' ' + args : '');

  if (0 == arguments.length) return this._usage || usage;
  this._usage = str;

  return this;
};

/**
 * Return the largest option length.
 *
 * @return {Number}
 * @api private
 */

Command.prototype.largestOptionLength = function(){
  return this.options.reduce(function(max, option){
    return Math.max(max, option.flags.length);
  }, 0);
};

/**
 * Return help for options.
 *
 * @return {String}
 * @api private
 */

Command.prototype.optionHelp = function(){
  var width = this.largestOptionLength();
  
  // Prepend the help information
  return [pad('-h, --help', width) + '  ' + 'output usage information']
    .concat(this.options.map(function(option){
      return pad(option.flags, width)
        + '  ' + option.description;
      }))
    .join('\n');
};

/**
 * Return command help documentation.
 *
 * @return {String}
 * @api private
 */

Command.prototype.commandHelp = function(){
  if (!this.commands.length) return '';
  return [
      ''
    , '  Commands:'
    , ''
    , this.commands.map(function(cmd){
      var args = cmd._args.map(function(arg){
        return arg.required
          ? '<' + arg.name + '>'
          : '[' + arg.name + ']';
      }).join(' ');

      return pad(cmd._name
        + (cmd.options.length 
          ? ' [options]'
          : '') + ' ' + args, 22)
        + (cmd.description()
          ? ' ' + cmd.description()
          : '');
    }).join('\n').replace(/^/gm, '    ')
    , ''
  ].join('\n');
};

/**
 * Return program help documentation.
 *
 * @return {String}
 * @api private
 */

Command.prototype.helpInformation = function(){
  return [
      ''
    , '  Usage: ' + this._name + ' ' + this.usage()
    , '' + this.commandHelp()
    , '  Options:'
    , ''
    , '' + this.optionHelp().replace(/^/gm, '    ')
    , ''
    , ''
  ].join('\n');
};

/**
 * Prompt for a `Number`.
 *
 * @param {String} str
 * @param {Function} fn
 * @api private
 */

Command.prototype.promptForNumber = function(str, fn){
  var self = this;
  this.promptSingleLine(str, function parseNumber(val){
    val = Number(val);
    if (isNaN(val)) return self.promptSingleLine(str + '(must be a number) ', parseNumber);
    fn(val);
  });
};

/**
 * Prompt for a `Date`.
 *
 * @param {String} str
 * @param {Function} fn
 * @api private
 */

Command.prototype.promptForDate = function(str, fn){
  var self = this;
  this.promptSingleLine(str, function parseDate(val){
    val = new Date(val);
    if (isNaN(val.getTime())) return self.promptSingleLine(str + '(must be a date) ', parseDate);
    fn(val);
  });
};

/**
 * Single-line prompt.
 *
 * @param {String} str
 * @param {Function} fn
 * @api private
 */

Command.prototype.promptSingleLine = function(str, fn){
  if ('function' == typeof arguments[2]) {
    return this['promptFor' + (fn.name || fn)](str, arguments[2]);
  }

  process.stdout.write(str);
  process.stdin.setEncoding('utf8');
  process.stdin.once('data', function(val){
    fn(val.trim());
  }).resume();
};

/**
 * Multi-line prompt.
 *
 * @param {String} str
 * @param {Function} fn
 * @api private
 */

Command.prototype.promptMultiLine = function(str, fn){
  var buf = [];
  console.log(str);
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function(val){
    if ('\n' == val || '\r\n' == val) {
      process.stdin.removeAllListeners('data');
      fn(buf.join('\n'));
    } else {
      buf.push(val.trimRight());
    }
  }).resume();
};

/**
 * Prompt `str` and callback `fn(val)`
 *
 * Commander supports single-line and multi-line prompts.
 * To issue a single-line prompt simply add white-space
 * to the end of `str`, something like "name: ", whereas
 * for a multi-line prompt omit this "description:".
 *
 *
 * Examples:
 *
 *     program.prompt('Username: ', function(name){
 *       console.log('hi %s', name);
 *     });
 *     
 *     program.prompt('Description:', function(desc){
 *       console.log('description was "%s"', desc.trim());
 *     });
 *
 * @param {String|Object} str
 * @param {Function} fn
 * @api public
 */

Command.prototype.prompt = function(str, fn){
  var self = this;

  if ('string' == typeof str) {
    if (/ $/.test(str)) return this.promptSingleLine.apply(this, arguments);
    this.promptMultiLine(str, fn);
  } else {
    var keys = Object.keys(str)
      , obj = {};

    function next() {
      var key = keys.shift()
        , label = str[key];

      if (!key) return fn(obj);
      self.prompt(label, function(val){
        obj[key] = val;
        next();
      });
    }

    next();
  }
};

/**
 * Prompt for password with `str`, `mask` char and callback `fn(val)`.
 *
 * The mask string defaults to '', aka no output is
 * written while typing, you may want to use "*" etc.
 *
 * Examples:
 *
 *     program.password('Password: ', function(pass){
 *       console.log('got "%s"', pass);
 *       process.stdin.destroy();
 *     });
 *
 *     program.password('Password: ', '*', function(pass){
 *       console.log('got "%s"', pass);
 *       process.stdin.destroy();
 *     });
 *
 * @param {String} str
 * @param {String} mask
 * @param {Function} fn
 * @api public
 */

Command.prototype.password = function(str, mask, fn){
  var self = this
    , buf = '';

  // default mask
  if ('function' == typeof mask) {
    fn = mask;
    mask = '';
  }

  keypress(process.stdin);

  function setRawMode(mode) {
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(mode);
    } else {
      tty.setRawMode(mode);
    }
  };
  setRawMode(true);
  process.stdout.write(str);

  // keypress
  process.stdin.on('keypress', function(c, key){
    if (key && 'enter' == key.name) {
      console.log();
      process.stdin.pause();
      process.stdin.removeAllListeners('keypress');
      setRawMode(false);
      if (!buf.trim().length) return self.password(str, mask, fn);
      fn(buf);
      return;
    }

    if (key && key.ctrl && 'c' == key.name) {
      console.log('%s', buf);
      process.exit();
    }

    process.stdout.write(mask);
    buf += c;
  }).resume();
};

/**
 * Confirmation prompt with `str` and callback `fn(bool)`
 *
 * Examples:
 *
 *      program.confirm('continue? ', function(ok){
 *        console.log(' got %j', ok);
 *        process.stdin.destroy();
 *      });
 *
 * @param {String} str
 * @param {Function} fn
 * @api public
 */


Command.prototype.confirm = function(str, fn, verbose){
  var self = this;
  this.prompt(str, function(ok){
    if (!ok.trim()) {
      if (!verbose) str += '(yes or no) ';
      return self.confirm(str, fn, true);
    }
    fn(parseBool(ok));
  });
};

/**
 * Choice prompt with `list` of items and callback `fn(index, item)`
 *
 * Examples:
 *
 *      var list = ['tobi', 'loki', 'jane', 'manny', 'luna'];
 *      
 *      console.log('Choose the coolest pet:');
 *      program.choose(list, function(i){
 *        console.log('you chose %d "%s"', i, list[i]);
 *        process.stdin.destroy();
 *      });
 *
 * @param {Array} list
 * @param {Number|Function} index or fn
 * @param {Function} fn
 * @api public
 */

Command.prototype.choose = function(list, index, fn){
  var self = this
    , hasDefault = 'number' == typeof index;

  if (!hasDefault) {
    fn = index;
    index = null;
  }

  list.forEach(function(item, i){
    if (hasDefault && i == index) {
      console.log('* %d) %s', i + 1, item);
    } else {
      console.log('  %d) %s', i + 1, item);
    }
  });

  function again() {
    self.prompt('  : ', function(val){
      val = parseInt(val, 10) - 1;
      if (hasDefault && isNaN(val)) val = index;

      if (null == list[val]) {
        again();
      } else {
        fn(val, list[val]);
      }
    });
  }

  again();
};


/**
 * Output help information for this command
 *
 * @api public
 */

Command.prototype.outputHelp = function(){
  process.stdout.write(this.helpInformation());
  this.emit('--help');
};

/**
 * Output help information and exit.
 *
 * @api public
 */

Command.prototype.help = function(){
  this.outputHelp();
  process.exit();
};

/**
 * Camel-case the given `flag`
 *
 * @param {String} flag
 * @return {String}
 * @api private
 */

function camelcase(flag) {
  return flag.split('-').reduce(function(str, word){
    return str + word[0].toUpperCase() + word.slice(1);
  });
}

/**
 * Parse a boolean `str`.
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

function parseBool(str) {
  return /^y|yes|ok|true$/i.test(str);
}

/**
 * Pad `str` to `width`.
 *
 * @param {String} str
 * @param {Number} width
 * @return {String}
 * @api private
 */

function pad(str, width) {
  var len = Math.max(0, width - str.length);
  return str + Array(len + 1).join(' ');
}

/**
 * Output help information if necessary
 *
 * @param {Command} command to output help for
 * @param {Array} array of options to search for -h or --help
 * @api private
 */

function outputHelpIfNecessary(cmd, options) {
  options = options || [];
  for (var i = 0; i < options.length; i++) {
    if (options[i] == '--help' || options[i] == '-h') {
      cmd.outputHelp();
      process.exit(0);
    }
  }
}

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1745223150777);
})()
//miniprogram-npm-outsideDeps=["events","child_process","keypress","fs","path","tty"]
//# sourceMappingURL=index.js.map