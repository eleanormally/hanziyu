# hanziyu

Sources and Code for Hanziyu Conlang

## Usage

### `parser.ts`

This reads in a list of characters and store their hanziyu transcription in `characters.json`. 

```shell
tsc
node parser.js [characters]
```

If the character isn't already in `characters.json`, you need to press enter to confirm it.

Example:

```shell
node parser.js 漢子語
```

may output

```
漢
{ type: '⿰', children: [ '氵', { type: '⿱', children: [Array] } ] }
diáchau̗t p dŭhə

子
dágəte
語
{ type: '⿰', children: [ '言', { type: '⿱', children: [Array] } ] }
be̅lø̠lei̗t da̅taíhəp ke̠ilə

```

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

may output

```
漢: diáchau̗t p dŭhə
子: dágəte
語: undefined
```