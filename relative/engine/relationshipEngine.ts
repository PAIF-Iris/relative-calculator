import { Step, RelationshipResult } from "../types/types"

type Gender = "M" | "F"
type Age = "older" | "younger" | "any"

// ✅ 1. Add 'num' primitive type
type Prim =
  | { t: "up"; g: Gender }
  | { t: "down"; g: Gender }
  | { t: "side"; g: Gender; age: Age }
  | { t: "spouse"; g: Gender }
  | { t: "num"; val: number }

/* ------------------------------------------------ */
/* PATH NODE */
/* ------------------------------------------------ */

// ✅ 2. Allow any relationship node to carry a 'num' modifier
type PathNode =
  | { t: "U"; g: Gender; num?: number }
  | { t: "D"; g: Gender; num?: number }
  | { t: "S"; g: Gender; age: Age; num?: number }
  | { t: "P"; g: Gender; num?: number }
  | { t: "N"; val: number }

/* ------------------------------------------------ */
/* MAP */
/* ------------------------------------------------ */

const MAP: Record<string, Prim[]> = {
  // Numbers
  "1": [{ t: "num", val: 1 }], "2": [{ t: "num", val: 2 }],
  "3": [{ t: "num", val: 3 }], "4": [{ t: "num", val: 4 }],
  "5": [{ t: "num", val: 5 }], "6": [{ t: "num", val: 6 }],
  "7": [{ t: "num", val: 7 }], "8": [{ t: "num", val: 8 }],
  "9": [{ t: "num", val: 9 }],

  爸爸: [{ t: "up", g: "M" }],
  妈妈: [{ t: "up", g: "F" }],

  爷爷: [{ t: "up", g: "M" }, { t: "up", g: "M" }],
  奶奶: [{ t: "up", g: "M" }, { t: "up", g: "F" }],

  姥爷: [{ t: "up", g: "F" }, { t: "up", g: "M" }],
  姥姥: [{ t: "up", g: "F" }, { t: "up", g: "F" }],

  哥哥: [{ t: "side", g: "M", age: "older" }],
  弟弟: [{ t: "side", g: "M", age: "younger" }],

  姐姐: [{ t: "side", g: "F", age: "older" }],
  妹妹: [{ t: "side", g: "F", age: "younger" }],

  儿子: [{ t: "down", g: "M" }],
  女儿: [{ t: "down", g: "F" }],

  舅舅: [{ t: "up", g: "F" }, { t: "side", g: "M", age: "any" }],
  姨: [{ t: "up", g: "F" }, { t: "side", g: "F", age: "any" }],

  叔叔: [{ t: "up", g: "M" }, { t: "side", g: "M", age: "younger" }],

  妻子: [{ t: "spouse", g: "F" }],
  丈夫: [{ t: "spouse", g: "M" }]
}

/* ------------------------------------------------ */
/* BUILD PATH */
/* ------------------------------------------------ */

function buildPath(prims: Prim[]): PathNode[] {
  return prims.map(p => {
    if (p.t === "up") return { t: "U", g: p.g }
    if (p.t === "down") return { t: "D", g: p.g }
    if (p.t === "side") return { t: "S", g: p.g, age: p.age }
    if (p.t === "spouse") return { t: "P", g: p.g }
    return { t: "N", val: p.val }
  })
}

/* ------------------------------------------------ */
/* SIMPLIFY */
/* ------------------------------------------------ */

function simplify(path: PathNode[]): PathNode[] {
  const res: PathNode[] = []

  for (const cur of path) {
    
    // ✅ 3. Number Binding: If the last item was a Number, attach it to the current Node
    if (res.length > 0 && res[res.length - 1].t === "N" && cur.t !== "N") {
      const numNode = res.pop() as { t: "N", val: number }
      cur.num = numNode.val
    }

    res.push(cur)

    while (res.length >= 2) {
      const last = res[res.length - 1]
      const prev = res[res.length - 2]

      // Don't simplify if one of them is an unbound Number
      if (prev.t === "N" || last.t === "N") break

      if (prev.t === "U" && last.t === "D") {
        res.pop(); res.pop(); continue
      }
      if (prev.t === "P" && last.t === "P" && prev.g !== last.g) {
        res.pop(); res.pop(); continue
      }
      if (prev.t === "P" && last.t === "D") {
        const numToKeep = last.num // Preserve the number if it exists!
        res.splice(res.length - 2, 1) 
        if (numToKeep !== undefined) {
          const remainingNode = res[res.length - 1] as any
          if (remainingNode?.t !== "N") {
            remainingNode.num = numToKeep
          }
        }
        continue
      }
      if (prev.t === "U" && last.t === "P" && prev.g !== last.g) {
        const numToKeep = last.num
        const newU: PathNode = { t: "U", g: last.g, num: numToKeep }
        res.pop(); res.pop()
        res.push(newU)
        continue
      }
      break
    }
  }
  return res
}

/* ------------------------------------------------ */
/* EXTENDED SIDE */
/* ------------------------------------------------ */

function resolveExtendedUncle(level: number, g: Gender, isMaternal: boolean) {
  const base = isMaternal
    ? (g === "M" ? "舅公" : "姨婆")
    : (g === "M" ? "伯/叔祖父" : "姑奶奶")

  if (level === 2) return base
  if (level === 3) return "曾" + base
  if (level === 4) return "高" + base
  return "远" + base
}

/* ------------------------------------------------ */
/* APPLY NUMBER PREFIX (NEW) */
/* ------------------------------------------------ */

function applyNumberPrefix(term: string, num: number): string {
  const prefix = ["", "大", "二", "三", "四", "五", "六", "七", "八", "九"][num]
  if (!prefix) return term

  // Shorten specific terms when a number is applied (e.g. 姨妈 -> 二姨)
  const mappings: Record<string, string> = {
    "舅舅": "舅", "姨妈": "姨", "伯父": "伯", "叔叔": "叔", "姑姑": "姑",
    "哥哥": "哥", "姐姐": "姐", "弟弟": "弟", "妹妹": "妹",
    "嫂子": "嫂", "婶婶": "婶",
    "小叔子": "叔子", "小姑子": "姑子", "小舅子": "舅子", "小姨子": "姨子"
  }

  return prefix + (mappings[term] || term)
}

/* ------------------------------------------------ */
/* CORE RESOLVE */
/* ------------------------------------------------ */

function resolve(path: PathNode[]): string {
  if (path.length === 0) return "我"

  const codeStr = path.map(x => {
    if (x.t === "N") return `N${x.val}`
    if (x.t === "S") return `S${x.g}${x.age === 'older' ? 'o' : x.age === 'younger' ? 'y' : 'a'}`
    return `${x.t}${x.g}`
  }).join(",")

  const EXACT_MATCHES: Record<string, string> = {
    "UM": "爸爸", "UF": "妈妈", "DM": "儿子", "DF": "女儿",
    "SMo": "哥哥", "SMy": "弟弟", "SMa": "兄弟",
    "SFo": "姐姐", "SFy": "妹妹", "SFa": "姐妹",
    "PM": "丈夫", "PF": "妻子",

    "UM,UM": "爷爷", "UM,UF": "奶奶", "UF,UM": "姥爷", "UF,UF": "姥姥",

    "UM,SMo": "伯父", "UM,SMy": "叔叔", "UM,SMa": "伯/叔",
    "UM,SFo": "姑姑", "UM,SFy": "姑姑", "UM,SFa": "姑姑",
    "UF,SMo": "舅舅", "UF,SMy": "舅舅", "UF,SMa": "舅舅",
    "UF,SFo": "姨妈", "UF,SFy": "姨妈", "UF,SFa": "姨妈",

    "SMo,DM": "侄子", "SMy,DM": "侄子", "SMa,DM": "侄子",
    "SMo,DF": "侄女", "SMy,DF": "侄女", "SMa,DF": "侄女",
    "SFo,DM": "外甥", "SFy,DM": "外甥", "SFa,DM": "外甥",
    "SFo,DF": "外甥女", "SFy,DF": "外甥女", "SFa,DF": "外甥女",

    "SMo,PF": "嫂子", "SMy,PF": "弟媳", "SMa,PF": "弟媳",
    "SFo,PM": "姐夫", "SFy,PM": "妹夫", "SFa,PM": "姐夫/妹夫",

    "UM,SMo,PF": "伯母", "UM,SMy,PF": "婶婶", "UM,SMa,PF": "婶婶",
    "UM,SFo,PM": "姑父", "UM,SFy,PM": "姑父", "UM,SFa,PM": "姑父",
    "UF,SMo,PF": "舅妈", "UF,SMy,PF": "舅妈", "UF,SMa,PF": "舅妈",
    "UF,SFo,PM": "姨父", "UF,SFy,PM": "姨父", "UF,SFa,PM": "姨父",

    "PM,UM": "公公", "PM,UF": "婆婆",
    "PF,UM": "岳父", "PF,UF": "岳母",

    "PM,SMo": "大伯子", "PM,SMy": "小叔子", "PM,SMa": "大伯/小叔",
    "PM,SFo": "大姑子", "PM,SFy": "小姑子", "PM,SFa": "大姑/小姑",
    "PF,SMo": "大舅哥", "PF,SMy": "小舅子", "PF,SMa": "大舅/小舅",
    "PF,SFo": "大姨子", "PF,SFy": "小姨子", "PF,SFa": "大姨/小姨",

    "DM,PF": "儿媳", "DF,PM": "女婿",

    "DM,DM": "孙子", "DM,DF": "孙女",
    "DF,DM": "外孙", "DF,DF": "外孙女",
  }

  const noAgeCodeStr = path.map(x => {
    if (x.t === "N") return `N${x.val}`
    return `${x.t}${x.g}`
  }).join(",")

  const NO_AGE_MATCHES: Record<string, string> = {
    "UM,SM": "叔伯", "UM,SF": "姑姑",
    "UF,SM": "舅舅", "UF,SF": "姨妈",
    "SM,DM": "侄子", "SM,DF": "侄女",
    "SF,DM": "外甥", "SF,DF": "外甥女",
    "SM,PF": "嫂/弟媳", "SF,PM": "姐夫/妹夫",
    "UM,SM,PF": "伯母/婶婶", "UM,SF,PM": "姑父",
    "UF,SM,PF": "舅妈", "UF,SF,PM": "姨父",
    "PM,SM": "大伯/小叔子", "PM,SF": "大姑/小姑子",
    "PF,SM": "大舅/小舅子", "PF,SF": "大姨/小姨子",
  }

  let term = "暂不支持"

  if (EXACT_MATCHES[codeStr]) {
    term = EXACT_MATCHES[codeStr]
  } else if (NO_AGE_MATCHES[noAgeCodeStr]) {
    term = NO_AGE_MATCHES[noAgeCodeStr]
  } else if (path.every(x => x.t === "U")) {
    const level = path.length
    const isMaternal = path[0].g === "F"
    const lastM = path[path.length - 1].g === "M"
    if (level === 3) term = isMaternal ? (lastM ? "曾外祖父" : "曾外祖母") : (lastM ? "曾祖父" : "曾祖母")
    if (level === 4) term = isMaternal ? (lastM ? "高外祖父" : "高外祖母") : (lastM ? "高祖父" : "高祖母")
    if (level > 4) term = "远祖"
  } else if (path.every(x => x.t === "D")) {
    const level = path.length
    const lastM = path[path.length - 1].g === "M"
    if (level === 3) term = lastM ? "曾孙" : "曾孙女"
    if (level === 4) term = lastM ? "玄孙" : "玄孙女"
    if (level > 4) term = "远孙"
  } else if (path.length >= 3 && path.slice(0, -1).every(x => x.t === "U") && path[path.length - 1].t === "S") {
    const level = path.length - 1
    const lastNode = path[path.length - 1]
    const firstNode = path[0]
    const isMaternal = firstNode.t !== "N" && firstNode.g === "F"
    if (lastNode.t === "S") {
      term = resolveExtendedUncle(level, lastNode.g, isMaternal)
    }
  } else if (path.length === 3 && path[0].t === "U" && path[1].t === "S" && path[2].t === "D") {
    if (path[0].g === "M" && path[1].g === "M") {
      term = path[2].g === "M" ? "堂哥/弟" : "堂姐/妹"
    } else {
      term = path[2].g === "M" ? "表哥/弟" : "表姐/妹"
    }
  }

  // ✅ 4. Final Hook: Check if the last node has a number bound to it, and apply the prefix
  if (term !== "暂不支持") {
    const lastNode = path[path.length - 1]
    if (lastNode && lastNode.t !== "N" && lastNode.num) {
      term = applyNumberPrefix(term, lastNode.num)
    }
  }

  return term
}

/* ------------------------------------------------ */
/* ENGINE */
/* ------------------------------------------------ */

export class RelationshipEngine {
  calculate(steps: Step[]): RelationshipResult {
    const prims: Prim[] = []

    for (const s of steps) {
      const p = MAP[s.relation]
      if (!p) return { success: false, error: "未知关系" }
      prims.push(...p)
    }

    let path = buildPath(prims)
    path = simplify(path)
    const term = resolve(path)

    if (term === "暂不支持") {
      return { success: false, error: "暂不支持" }
    }

    return { success: true, term, desc: term }
  }

  // ✅ 5. Format display correctly so numbers attach cleanly (妈妈的2姐)
  formatDisplay(steps: Step[]) {
    let res = "";
    for (let i = 0; i < steps.length; i++) {
      const cur = steps[i].relation;
      const isNum = /^[1-9]$/.test(cur);

      if (i === 0) {
        res += cur;
      } else {
        const prev = steps[i - 1].relation;
        const prevIsNum = /^[1-9]$/.test(prev);

        if (isNum) {
          // If the current step is a number, we still need "的" before it
          res += `的${cur}`;
        } else if (prevIsNum) {
          // If the previous step was a number, DO NOT put "的" before the current relationship
          res += cur;
        } else {
          // Normal case
          res += `的${cur}`;
        }
      }
    }
    return res;
  }
}

export const relationshipEngine = new RelationshipEngine()