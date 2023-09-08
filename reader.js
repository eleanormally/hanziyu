import fs from "fs"

let inStr = "根据目前所有已知的飞行定律蜜蜂是不可能飞起来的它们的翅膀小得根本无法让胖乎乎的身体离开地面当然蜜蜂终究还是飞起来了因为它们根本不在意那些在人类看来不可能的事情"
// const inStr = "根據目前所有已知的飛行定律蜜蜂是不可能飛起來的它們的翅膀小得根本無法讓胖乎乎的身體離開地面當然蜜蜂終究還是飛起來了因為它們根本不在意那些在人類看來不可能的事情"
// const inStr = "大家好这是汉子语一个人造语言"

if (process.argv.length > 2) {
  inStr = process.argv[2]
}

const characters = new Map(Object.entries(JSON.parse(fs.readFileSync('./characters.json', { encoding: 'utf8' }))))

for (const c of inStr) {
  process.stdout.write(c + ": ")
  process.stdout.write(characters.get(c) + '\n')
}
