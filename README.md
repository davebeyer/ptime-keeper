# Pomodoro Time Keeper (ptime-keeper)

## Build instructions

To clone and build, do:

```
git clone  https://github.com/davebeyer/ptime-keeper
cd ptime-keeper
tsd install
npm install
```

## Development tools that may be needed

```
sudo npm install -g http-server
sudo npm install -g gulp
sudo npm install -g tsc    # However, currently using tsify plugin as part of the browserify process
sudo npm install -g firebase-tools
```


## Development

To build, start an http-server on localhost, and kickoff watchify/browserify to watch for & compile any changes, do:

```
./bin/start-dev
```

Then you should be able to visit:

```
http://localhost:8095
```

## Code documentation

Using the [Typedoc tool](http://typedoc.io/guides/usage.html).

To generate the source code documentation:

```
npm run doc
```

or, do the following:

```
typedoc --experimentalDecorators  --target es5 --module commonjs --out doc/code client/app/main.ts
```

Then, open doc/code/index.html in the browser.


## Technologies Employed

* Angular2-Alpha 
* .. plus some jquery
* Typescript
* Firebase
* Bootstrap-CSS
* node, npm, browserify, tsify, watchify, gulp
