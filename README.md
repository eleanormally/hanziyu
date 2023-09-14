# hanziyu

Sources and Code for Hanziyu Conlang

## Usage

### `parser.ts`

This reads in a list of characters and store their hanziyu transcription in `characters.json`. 

```shell
tsc
node parser.js [characters]
```

Example:

```shell
node parser.js 漢子語
```

If the character isn't already in `characters.json`, you need to press enter to confirm it.

### `reader.js`

This reads in a list of characters and outputs their respective transcription according to `characters.json`. If the character does not exist in `characters.json`, this outputs "undefined".

```shell
cp reader.js reader.mjs
node reader.mjs [characters]
```

Example:

```shell
node reader.mjs 漢子語
```
