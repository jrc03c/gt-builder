# intro

`gt-builder` is a build tool for [guidedtrack](https://www.guidedtrack.com/) that:

- offers [liquid](https://liquidjs.com/) templating support
- creates inline documentation from yaml files
- generates code to clean up non-output variables
- optionally removes [gtlint](https://github.com/jrc03c/gtlint) directives from generated files

# installation

```bash
npm install --save-dev @jrc03c/gt-builder
```

# usage

## command line

```
Usage: gt-build [options] [paths...]

Options:
  -d, --dist-dir <dir>
  -w, --watch
  -h, --help            display help for command
```

examples:

```bash
# 1. build anything in "./src" and output to "./dist":
npx gt-build

# 2. watch "path/to/src" for changes and output to "path/to/dist":
npx gt-build -w -d path/to/dist path/to/src

# 3. build specific programs and output to "./dist":
npx gt-build path/to/program1 path/to/program2 path/to/program3
```

> **note:** "watching" functionality is only available at the command line.

## programmatic

```js
import { GTBuilder } from "@jrc03c/gt-build"

const builder = new GTBuilder({
  srcDir: "path/to/src",
  distDir: "path/to/dist",
})

const files = builder.build()
console.log(files)
```

# how it works

to create a new program, place two files together in a directory:

1. a `data.yml` file, and...
2. a `template.gt` file.

at build time, the builder searches the source directory (`srcDir`) recursively for `data.yml` files, uses them as data sources to compile their adjacent `template.gt` files, and writes the resulting files out to the output directory (`distDir`).

see the [template](./template) or the [demo](./demo) for examples.

variables from `data.yml` can be accessed in `template.gt` using standard liquid notation: `{{ someVar }}`. the convention is to define variables in the yaml file in _kebab-case_ (e.g., `some-var: <value>`) and then to reference the variables in `template.gt` in _camel-case_ (e.g., `{{ someVar }}`). `gt-builder` performs this conversion automatically.

variables are just the tip of the iceberg, though. the full power of liquid is available to you! thus you can use loops, conditionals, filters, and any other features offered by [liquidjs](https://liquidjs.com/tutorials/intro-to-liquid.html).

on the other hand, you don't have to use liquid templating at all if you don't want to! it's completely optional. if you don't use liquid syntax in a particular `template.gt`, then the generated output file will be identical to the `template.gt` file.

## special variables

two special variables are created dynamically at build time and made available for use in `template.gt`:

1. `docs` = an inline documentation string
2. `cleanup` = a string of variable assignments that can be used to "clean up" variables at the end of the program

it's common to place `{{ docs }}` at the very top of your `template.gt` file and `{{ cleanup }}` at the very bottom, though that's merely a convention, not a requirement. they're just standard variables that can be referenced via liquid syntax, and `template.gt` files are not required to reference them.

# demo

see the [`demo`](./demo) directory for a example.

# roadmap

features i'd like to add include:

- automatic linting via [gtlint](https://github.com/jrc03c/gtlint)
- docs customization
- liquid customization
- output file name customization