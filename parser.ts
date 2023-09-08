import * as fs from 'fs'
const promptSync = require('prompt-sync')()

process.stdin.setEncoding('utf8');

// This function reads only one line on console synchronously. After pressing `enter` key the console will stop listening for data.
function readlineSync() {
  return new Promise((resolve, reject) => {
    process.stdin.resume();
    process.stdin.on('data', function(data) {
      process.stdin.pause(); // stops after one line reads
      resolve(data);
    });
  });
}
const mapToObj = m => {
  return Array.from(m).reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});
};

interface DictionaryEntry {
  definition?: string
  decomposition: string
  etymology?: any
  radical: string
  matches: number[][]
}

interface RadicalEntry {
  reading: string
  full: string
}
interface RadicalEquivalent {
  equivalent: string
}

enum DecompositionType {
  horizontal = "⿰",
  vertical = "⿱",
  tripleHorizontal = "⿲",
  tripleVertical = "⿳",
  insert = "⿴",
  insertBelow = "⿵",
  insertAbove = "⿶",
  insertRight = "⿷",
  insertBottomRight = "⿸",
  insertBottomLeft = "⿹",
  insertTopRight = "⿺",
  overlay = "⿻",
  invalid = "？"
}

enum DecompositionSuffix {
  "⿰" = "t",
  "⿱" = "p",
  "⿲" = "tt",
  "⿳" = "pp",
  "⿴" = "m",
  "⿵" = "mm",
  "⿶" = "n",
  "⿷" = "ng",
  "⿸" = "k",
  "⿹" = "kk",
  "⿺" = "r",
  "⿻" = "l",
}

interface DecompositionNode {
  type: DecompositionType
  children: (DecompositionNode | string)[]
}

function getDecompType(char: string): DecompositionType | null {
  const type = (Object.entries(DecompositionType).find((entry) => entry[1] === char) ?? [0, null])[1]
  return type
}

function generateDecompTree(decompString: string) {
  const initialChar = decompString.charAt(0)

  const type = getDecompType(initialChar) ?? DecompositionType.invalid

  if (type === DecompositionType.invalid) return {
    type: type,
    children: []
  }

  const baseNode: DecompositionNode = {
    type: type,
    children: []
  }

  let level = 0
  const subsequents: number[] = [type === DecompositionType.tripleVertical || type === DecompositionType.tripleHorizontal ? 3 : 2]
  for (const c of decompString.slice(1, decompString.length)) {
    if (subsequents[subsequents.length - 1] === 0) {
      level--
      subsequents.pop()
    }
    if (subsequents.length === 0) break
    subsequents[subsequents.length - 1]--

    //pushing to child of n iterations
    let referenceNode = baseNode
    for (let i = 0; i < level; i++) {
      if (referenceNode.children.length === 0) {
        console.error('attempted to index beyond existence')
      }
      referenceNode = referenceNode.children[referenceNode.children.length - 1] as DecompositionNode
    }
    const type = getDecompType(c)

    if (type !== null && type !== DecompositionType.invalid) {
      referenceNode.children.push({
        type: type,
        children: []
      })
    }
    else {
      referenceNode.children.push(c)
    }

    if (type !== null && type !== DecompositionType.invalid) {
      level++
      if (type === DecompositionType.tripleVertical || type === DecompositionType.tripleHorizontal) {
        subsequents.push(3)
      } else {
        subsequents.push(2)
      }
    }
  }
  return baseNode

}

class Character {
  character: string
  strokeCount: number | undefined
  radical: string | undefined
  decomposition: DecompositionNode
  needsManualDefinition: boolean

  constructor(char: string, dict: Map<string, DictionaryEntry>) {
    this.character = char
    this.strokeCount === undefined
    this.radical = undefined
    this.decomposition = undefined

    const entry = dict.get(char)
    if (entry === undefined) {
      this.needsManualDefinition = true
      return
    }

    this.strokeCount = entry.matches.length
    this.radical = entry.radical

    this.decomposition = generateDecompTree(entry.decomposition)
    this.needsManualDefinition = this.decomposition.type === DecompositionType.invalid && !this.isRadical()



  }

  isRadical() { return this.character === this.radical }

}

function generateFullDecompTree(node: DecompositionNode, dict: Map<string, DictionaryEntry>, endAtRadical?: boolean): DecompositionNode {
  return {
    type: node.type,
    children: node.children.map((child) => {
      if (typeof child === 'string' && dict.has(child)) {
        const char = new Character(child, dict)
        if (char.decomposition.type === DecompositionType.invalid || (endAtRadical && char.isRadical())) return child
        return generateFullDecompTree(char.decomposition, dict, endAtRadical)
      }
      return child
    })
  }

}

async function decompToString(
  node: DecompositionNode,
  radicals: Map<string, RadicalEntry | RadicalEquivalent>,
  components: Map<string, string>,
): Promise<string> {
  let out = ''
  if (node.type === DecompositionType.invalid) {
    console.log("character:")
    const newVal = (await readlineSync() as string).trimEnd()
    return newVal
  }
  for (const child of node.children) {
    if (typeof child === 'string') {
      if (radicals.has(child)) {
        if ((radicals.get(child) as RadicalEquivalent).equivalent !== undefined) {
          out += (radicals.get((radicals.get(child) as RadicalEquivalent).equivalent) as RadicalEntry).reading
        }
        else {
          out += (radicals.get(child) as RadicalEntry).reading
        }
      }
      else if (components.has(child)) out += components.get(child)
      else {
        // add to components map and save
        console.log(child + ': ')
        const newVal = (await readlineSync() as string).trimEnd()
        process.stdin.pause()
        if (child !== "？") {
          components.set(child, newVal)
          fs.writeFileSync('./components.json', JSON.stringify(mapToObj(components)))
        }
        out += newVal
      }
    }
    else {
      out += await decompToString(child, radicals, components)
    }
    if (child !== node.children.at(node.children.length - 1)) {
      out += DecompositionSuffix[node.type]
      out += ' '
    }
  }
  return out
}



let inStr: string = "根據目前所有已知的飛行定律蜜蜂是不可能飛起來的它們的翅膀小得根本無法讓胖乎乎的身體離開地面當然蜜蜂終究還是飛起來了因為它們根本不在意那些在人類看來不可能的事情"
//inStr = "根据目前所有已知的飞行定律蜜蜂是不可能飞起来的它们的翅膀小得根本无法让胖乎乎的身体离开地面当然蜜蜂终究还是飞起来了因为它们根本不在意那些在人类看来不可能的事情"
// inStr = "大家好这是汉子语一个人造语言"
if (process.argv.length > 2) {
  inStr = process.argv[2]
}

const dict = new Map<string, DictionaryEntry>(Object.entries(JSON.parse(fs.readFileSync('./dictionary.json', { encoding: 'utf8' }))))
const radicals = new Map<string, RadicalEntry | RadicalEquivalent>(Object.entries(JSON.parse(fs.readFileSync('./radical-decomp.json', { encoding: 'utf8' }))))
const components = new Map<string, string>(Object.entries(JSON.parse(fs.readFileSync('./components.json', { encoding: 'utf8' }))))
const characters = new Map<string, string>(Object.entries(JSON.parse(fs.readFileSync('./characters.json', { encoding: 'utf8' }))))

async function main() {
  for (const c of inStr) {
    const char = new Character(c, dict)
    console.log(char.character)
    if (!characters.has(char.character)) {
      if (radicals.has(char.character)) {
        const eq = (radicals.get(char.character) as RadicalEquivalent).equivalent
        if (eq !== undefined) {
          characters.set(char.character, (radicals.get(eq) as RadicalEntry).reading)
        }
        else {
          characters.set(char.character, (radicals.get(char.character) as RadicalEntry).reading)
        }
        console.log(characters.get(char.character))
        await readlineSync()
        fs.writeFileSync('./characters.json', JSON.stringify(mapToObj(characters)))
      }
      else {
        const fullTree = generateFullDecompTree(char.decomposition, dict, true)
        console.log(fullTree)
        const word = await decompToString(fullTree, radicals, components)
        console.log(word)
        await readlineSync()
        characters.set(char.character, word)
        fs.writeFileSync('./characters.json', JSON.stringify(mapToObj(characters)))
      }
    }
    else {
      console.log(characters.get(char.character))
    }
  }
}
main()
