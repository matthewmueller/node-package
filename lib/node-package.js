/**
 * Module Dependencies
 */

var command = require('shelly');
var tar = require('tar');
var zlib = require('zlib');
var request = require('request');
var exec = require('child_process').exec;
var rm = require('rimraf');
var fs = require('fs');
var exists = fs.existsSync;
var path = require('path');
var join = path.join;
var Emitter = require('events').EventEmitter;
var debug = require('debug')('package');

/**
 * Export `Package`
 */

module.exports = Package;

/**
 * Initialize `Package`
 *
 * @param {String} name
 * @param {Object} opts
 * @return {Package}
 * @api public
 */

function Package(name) {
  if (!(this instanceof Package)) return new Package(name);
  var parts = name.split('@');
  this.name = parts[0];
  this.ref =  parts[1] || 'master';
  this.slug = this.name.replace(/\//, '-');
  this.pkg = ('master' == this.ref) ? this.name : [this.name, this.ref].join('@')
  this.pkg = this.pkg.replace(/\//g, '-');
  this.root = process.cwd();
  this.cwd = path.join(this.root, this.pkg);
  this.tmp = path.join(this.root, 'tmp-' + this.slug);
}

/**
 * Mixin an emitter
 */

Package.prototype.__proto__ = Emitter.prototype;

/**
 * Specify a directory to install into
 *
 * @param {String} dirname
 * @return {Package}
 * @api public
 */

Package.prototype.dir = function(dirname) {
  this.root = dirname;
  this.cwd = path.join(this.root, this.pkg);
  this.tmp = path.join(this.root, 'tmp-' + this.slug);
  return this;
};

/**
 * Install the package
 *
 * @param {Function} fn
 * @return {Package}
 * @api public
 */

Package.prototype.install = function(fn) {
  var self = this;
  debug('installing %s', this.name);
  this.download(function(err) {
    if (err) return done(err);
    self.installDependencies(function(err) {
      if (err) return done(err);
      done();
    })
  });

  function done(err) {
    if (err) {
      self.emit('err', err, self.name);
      fn(err);
    } else {
      self.emit('install', self.name);
      fn();
    }
  }
}

/**
 * Download the package
 *
 * @param {Function} fn
 * @api private
 */

Package.prototype.download = function(fn) {
  var self = this;
  var root = this.root;
  var pkg = this.pkg;
  var dir = join(this.root, this.pkg);
  var isExtracted = new RegExp(this.slug + '\-\\d+');
  var url = 'https://api.github.com/repos/' + this.name + '/tarball/' + this.ref;
  var tarPath = join(this.root, this.slug + '.tar.gz');
  var write = fs.createWriteStream(tarPath);

  // If path already exists return
  if ('master' !== this.ref && exists(dir)) {
    debug('package already exists');
    return fn();
  }

  // Handle errors in the response
  function response(err, res, body) {
    if (err || res.statusCode != 200) {
      var status = res.statusCode;
      rm(tarPath, function(e) {
        if (err || e) return fn(err || e);
        else if (404 == status) return fn(new Error('"' + self.name + '" package not found'))
        else return fn(new Error(body));
      });
    }
  }

  debug('fetching the tarball from github: %s', url);
  var r = request({
    url : url,
    headers : { 'User-Agent' : 'automon' },
  }, response);

  // pipe the response stream to the tar file
  var stream = r.pipe(write);

  // untar the response
  stream.on('close', function() {
    debug('fetched the tarball');
    self.untar(tarPath, dir, function(err) {
      if (err) return fn(err);
      debug('untarred the package to %s', dir);
      rm(tarPath, function(err) {
        if (err) return fn(err);
        debug('removed the tarball');
        fn();
      });
    });
  });

  return this;
};

/**
 * Install the dependencies
 *
 * TODO: Programmatically install from NPM
 *
 * @param {Function} fn
 * @return {Package}
 * @api private
 */

Package.prototype.installDependencies = function(fn) {
  debug('installing node dependencies');
  var cmd = command('npm install -s');
  this.exec(cmd, fn);
  return this;
};

/**
 * Execute a command
 *
 * @param {String} cmd
 * @param {String} cwd
 * @param {Function} fn
 * @return {Package}
 * @api private
 */

Package.prototype.exec = function(cmd, cwd, fn) {
  if (arguments.length < 3) {
    fn = cwd;
    cwd = this.cwd;
  }

  debug('executing %s in %s', cmd, cwd);
  exec(cmd, { cwd : cwd }, fn);
  return this;
};

/**
 * Untar the tar
 *
 * @param {String} path
 * @param {String} dest
 * @param {Function} fn
 * @return {Package}
 * @api private
 */

Package.prototype.untar = function(src, dest, fn) {
  var stream = fs.createReadStream(src);

  stream
    .pipe(zlib.createGunzip())
    .pipe(tar.Extract({
      path : dest,
      strip : 1
    }));

  stream.on('error', fn);
  stream.on('end', fn);
  return this;
};
