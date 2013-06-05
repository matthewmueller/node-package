
# node-package

  Easily install node.js packages from github. Supports tags and uses github namespacing for unique packages. Can consume packages that are not published to NPM.

## Installation

    npm install node-package

## Example

```js
var Package = require('node-package');

Package('matthewmueller/cheerio@0.10.0').install(function(err) {
  if (err) throw err;
  // installed at $cwd/matthewmueller-cheerio@0.10.0
});
```

## Events

- `install` (name): emitted when the package was successfully installed
- `err` (err, name): emitted when the package installation encountered an error

## API

### Package(name)

  Initialize `Package` with the `name` of a github repository

```js
var pkg = Package('matthewmueller/cheerio');
```

### Package.dir(dirname)

  Set where the package will be installed. Defaults to `process.cwd()`.

### Package.install(fn)

  Install the package with a callback `fn(err)`.

## TODO

* use npm programmatically
* basic auth for private repos

## License

(The MIT License)

Copyright (c) 2013 Matthew Mueller &lt;mattmuelle@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
