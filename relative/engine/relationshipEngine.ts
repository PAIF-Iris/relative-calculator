
// import { RelationshipResult, Step } from '../types/types';

// // ─────────────────────────────────────────────────────
// //  Primitive walk step
// // ─────────────────────────────────────────────────────

// type G   = 'M' | 'F';
// type Age = 'e' | 'y' | 'a';

// type PrimStep =
//   | { k: 'up';  g: G }
//   | { k: 'dn';  g: G }
//   | { k: 'lat'; g: G; age: Age };

// // ─────────────────────────────────────────────────────
// //  Button → primitive walk  (the ONLY data in this file)
// // ─────────────────────────────────────────────────────

// const BTN: Record<string, PrimStep[]> = {
//   '爸爸': [{ k:'up', g:'M' }],
//   '妈妈': [{ k:'up', g:'F' }],
//   '爷爷': [{ k:'up', g:'M' }, { k:'up', g:'M' }],
//   '奶奶': [{ k:'up', g:'M' }, { k:'up', g:'F' }],
//   '姥爷': [{ k:'up', g:'F' }, { k:'up', g:'M' }],
//   '姥姥': [{ k:'up', g:'F' }, { k:'up', g:'F' }],
//   '哥哥': [{ k:'lat', g:'M', age:'e' }],
//   '姐姐': [{ k:'lat', g:'F', age:'e' }],
//   '弟弟': [{ k:'lat', g:'M', age:'y' }],
//   '妹妹': [{ k:'lat', g:'F', age:'y' }],
//   '儿子': [{ k:'dn',  g:'M' }],
//   '女儿': [{ k:'dn',  g:'F' }],
//   '舅舅': [{ k:'up', g:'F' }, { k:'lat', g:'M', age:'a' }],
//   '姨':   [{ k:'up', g:'F' }, { k:'lat', g:'F', age:'a' }],
//   '叔叔': [{ k:'up', g:'M' }, { k:'lat', g:'M', age:'y' }],
// };

// // ─────────────────────────────────────────────────────
// //  Normalize: collapse [lat → up] → [up]
// // ─────────────────────────────────────────────────────

// function normalize(walk: PrimStep[]): PrimStep[] {
//   let w = [...walk];
//   let changed = true;
//   while (changed) {
//     changed = false;
//     for (let i = 0; i < w.length - 1; i++) {
//       if (w[i].k === 'lat' && w[i + 1].k === 'up') {
//         w = [...w.slice(0, i), ...w.slice(i + 1)];
//         changed = true;
//         break;
//       }
//     }
//   }
//   return w;
// }

// // ─────────────────────────────────────────────────────
// //  Parse normalised walk → structural tuple
// // ─────────────────────────────────────────────────────

// interface Parsed {
//   ok:    boolean;
//   up:    G[];
//   lat:   { g: G; age: Age } | null;
//   dn:    G[];
//   gen:   number;  // up.length − dn.length
//   error?: string;
// }

// function parsePrims(raw: PrimStep[]): Parsed {
//   const w = normalize(raw);
//   let i = 0;
//   const up: G[] = [];
//   let lat: { g: G; age: Age } | null = null;
//   const dn: G[] = [];

//   while (i < w.length && w[i].k === 'up')  { up.push((w[i] as any).g); i++; }
//   if    (i < w.length && w[i].k === 'lat') { lat = { g: (w[i] as any).g, age: (w[i] as any).age }; i++; }
//   while (i < w.length && w[i].k === 'dn')  { dn.push((w[i] as any).g); i++; }

//   if (i < w.length) {
//     const isUp = w[i].k === 'up';
//     const msg  = isUp && dn.length > 0
//       ? '关系链绕回了自己（例如"儿子的爸爸"等于自己），无法给出称谓'
//       : '关系链在逻辑上不成立（例如"哥哥的哥哥"需按年龄直接称呼）';
//     return { ok: false, up, lat, dn, gen: up.length - dn.length, error: msg };
//   }
//   return { ok: true, up, lat, dn, gen: up.length - dn.length };
// }

// // ─────────────────────────────────────────────────────
// //  Small helpers
// // ─────────────────────────────────────────────────────

// const ORD = ['', '大', '二', '三', '四', '五', '六', '七', '八', '九'];

// /** Apply seniority ordinal to a short base character.
//  *  ord(2,'舅') → '二舅';  ord(1,'哥哥') → '大哥哥'
//  */
// function applyOrd(n: number, full: string, single?: string): string {
//   if (n <= 0 || n >= ORD.length) return full;
//   const base = single ?? full;
//   return `${ORD[n]}${base}`;
// }

// function hit(
//   term: string, formal: string, desc: string,
//   side: 'paternal' | 'maternal' | 'self',
//   gen: number,
//   note?: string,
// ): RelationshipResult {
//   return { success: true, term, formal, desc, side, gen, note };
// }

// function fail(error: string, suggestion?: string): RelationshipResult {
//   return { success: false, error, suggestion };
// }

// // ─────────────────────────────────────────────────────
// //  FAMILY A: Pure ancestor  (up+, no lat, no dn)
// // ─────────────────────────────────────────────────────

// function deriveAncestor(up: G[], o: number): RelationshipResult {
//   const n   = up.length;
//   const fg  = up[n - 1];         // gender of the target ancestor
//   const pat = up[0] === 'M';     // paternal or maternal origin

//   // ── gen 1 ─────────────────────────────────────────
//   if (n === 1) {
//     return fg === 'M'
//       ? hit('爸爸', '父亲', '自己的父亲', 'self', 1)
//       : hit('妈妈', '母亲', '自己的母亲', 'self', 1);
//   }

//   // ── gen 2 ─────────────────────────────────────────
//   if (n === 2) {
//     if (up[0]==='M' && up[1]==='M') return hit('爷爷','祖父','爸爸的父亲','paternal',2);
//     if (up[0]==='M' && up[1]==='F') return hit('奶奶','祖母','爸爸的母亲','paternal',2);
//     if (up[0]==='F' && up[1]==='M') return hit('姥爷','外祖父','妈妈的父亲','maternal',2,'北方叫姥爷，南方叫外公');
//     if (up[0]==='F' && up[1]==='F') return hit('姥姥','外祖母','妈妈的母亲','maternal',2,'北方叫姥姥，南方叫外婆');
//   }

//   // ── gen 3 ─────────────────────────────────────────
//   if (n === 3) {
//     // Build a readable path string for the desc
//     const gp = gpName(up[0], up[1]);
//     const side: 'paternal'|'maternal' = pat ? 'paternal' : 'maternal';
//     const px = pat ? '' : '外';
//     return fg === 'M'
//       ? hit(`${px}曾祖父`, `${px}曾祖父`, `${gp}的父亲`, side, 3,
//             pat ? '太爷爷' : '太姥爷')
//       : hit(`${px}曾祖母`, `${px}曾祖母`, `${gp}的母亲`, side, 3,
//             pat ? '太奶奶' : '太姥姥');
//   }

//   // ── gen 4 ─────────────────────────────────────────
//   if (n === 4) {
//     const side: 'paternal'|'maternal' = pat ? 'paternal' : 'maternal';
//     const px  = pat ? '' : '外';
//     const sfx = fg === 'M' ? '父' : '母';
//     return hit(`${px}高祖${sfx}`, `${px}高祖${sfx}`, `四代以上祖先`, side, 4);
//   }

//   // ── gen 5+ ────────────────────────────────────────
//   const side: 'paternal'|'maternal' = pat ? 'paternal' : 'maternal';
//   const px   = pat ? '' : '外';
//   const GN: Record<number,string> = {5:'天祖',6:'烈祖',7:'太祖',8:'远祖',9:'鼻祖'};
//   const gname = GN[n] ?? `${n}代祖`;
//   const sfx   = fg === 'M' ? '父' : '母';
//   return hit(`${px}${gname}${sfx}`, `${px}${gname}${sfx}`,
//              `${n}代以上祖先`, side, n);
// }

// /** Readable name for a 2-step grandparent */
// function gpName(g0: G, g1: G): string {
//   if (g0==='M'&&g1==='M') return '爷爷';
//   if (g0==='M'&&g1==='F') return '奶奶';
//   if (g0==='F'&&g1==='M') return '姥爷';
//   return '姥姥';
// }

// // ─────────────────────────────────────────────────────
// //  FAMILY B: Own sibling  ([], lat, [])
// // ─────────────────────────────────────────────────────

// function deriveSibling(lat: { g: G; age: Age }, o: number): RelationshipResult {
//   const { g, age } = lat;
//   if (g === 'M') {
//     if (age === 'e') return hit(applyOrd(o,'哥哥','哥'), '兄',    '年长的兄弟', 'self', 0);
//     if (age === 'y') return hit(applyOrd(o,'弟弟','弟'), '弟',    '年幼的兄弟', 'self', 0);
//     return hit('兄弟', '兄弟', '哥哥或弟弟（按年龄）', 'self', 0);
//   } else {
//     if (age === 'e') return hit(applyOrd(o,'姐姐','姐'), '姊',    '年长的姐妹', 'self', 0);
//     if (age === 'y') return hit(applyOrd(o,'妹妹','妹'), '妹',    '年幼的姐妹', 'self', 0);
//     return hit('姐妹', '姐妹', '姐姐或妹妹（按年龄）', 'self', 0);
//   }
// }

// // ─────────────────────────────────────────────────────
// //  FAMILY C: Own descendant  ([], null, dn+)
// // ─────────────────────────────────────────────────────

// function deriveOwnDesc(dn: G[]): RelationshipResult {
//   const n = dn.length;

//   if (n === 1)
//     return dn[0]==='M'
//       ? hit('儿子','子','自己的儿子','self',-1)
//       : hit('女儿','女','自己的女儿','self',-1);

//   if (n === 2) {
//     if (dn[0]==='M'&&dn[1]==='M') return hit('孙子',  '孙',   '儿子的儿子','self',-2);
//     if (dn[0]==='M'&&dn[1]==='F') return hit('孙女',  '孙女', '儿子的女儿','self',-2);
//     if (dn[0]==='F'&&dn[1]==='M') return hit('外孙',  '外孙', '女儿的儿子','self',-2);
//     if (dn[0]==='F'&&dn[1]==='F') return hit('外孙女','外孙女','女儿的女儿','self',-2);
//   }

//   // gen 3+
//   const throughSon = dn[0] === 'M';
//   const finalM     = dn[n-1] === 'M';
//   const px         = throughSon ? '' : '外';
//   const prefixes   = ['','','','曾','玄'];  // index = depth
//   const pre        = n < prefixes.length ? prefixes[n] : `${n}代`;
//   return hit(
//     `${px}${pre}孙${finalM?'':'女'}`,
//     `${px}${pre}孙${finalM?'':'女'}`,
//     `${n}代孙${finalM?'子':'女'}`, 'self', -n,
//   );
// }

// // ─────────────────────────────────────────────────────
// //  FAMILY D: Sibling's descendant  ([], lat, dn+)
// //  侄 / 外甥 / 侄孙 / 外甥孙 …
// // ─────────────────────────────────────────────────────

// function deriveSibDesc(lat: { g: G; age: Age }, dn: G[], o: number): RelationshipResult {
//   const sibMale = lat.g === 'M';
//   const finalM  = dn[dn.length-1] === 'M';
//   const n       = dn.length;

//   if (n === 1) {
//     if (sibMale) {
//       return finalM
//         ? hit(applyOrd(o,'侄子','侄'), '侄',   '兄弟的儿子','self',-1)
//         : hit(applyOrd(o,'侄女'),      '侄女', '兄弟的女儿','self',-1);
//     } else {
//       return finalM
//         ? hit(applyOrd(o,'外甥'),   '外甥',  '姐妹的儿子','self',-1)
//         : hit(applyOrd(o,'外甥女'), '外甥女','姐妹的女儿','self',-1);
//     }
//   }

//   if (n === 2) {
//     if (sibMale) {
//       return finalM
//         ? hit('侄孙',  '侄孙',  '兄弟的孙子','self',-2)
//         : hit('侄孙女','侄孙女','兄弟的孙女','self',-2);
//     } else {
//       return finalM
//         ? hit('外甥孙',  '外甥孙',  '姐妹的孙子','self',-2)
//         : hit('外甥孙女','外甥孙女','姐妹的孙女','self',-2);
//     }
//   }

//   // n >= 3
//   const rel = sibMale ? '兄弟' : '姐妹';
//   const pfx = sibMale ? '侄' : '外甥';
//   return hit(
//     `${pfx}${n-1 > 1 ? n-1+'代' : ''}孙${finalM?'':'女'}`,
//     `${pfx}孙后代`,
//     `${rel}的${n}代后人`, 'self', -n,
//     '较远晚辈，无固定专用称谓',
//   );
// }

// // ─────────────────────────────────────────────────────
// //  FAMILY E: Ancestor's sibling  (up+, lat, [])
// // ─────────────────────────────────────────────────────

// function deriveAncestorSib(up: G[], lat: { g: G; age: Age }, o: number): RelationshipResult {
//   const n   = up.length;
//   const lg  = lat.g;          // gender of the sibling
//   const age = lat.age;
//   const pat = up[0] === 'M';  // whole chain starts on dad's side
//   const gpG = up[n-1];        // gender of the ancestor whose sibling this is

//   // ── gen+1 : parent's sibling ────────────────────────
//   if (n === 1) {
//     const side: 'paternal'|'maternal' = pat ? 'paternal' : 'maternal';
//     if (pat) {
//       // Dad's sibling
//       if (lg === 'M') {
//         if (age==='e') return hit(applyOrd(o,'伯伯','伯'),'伯父','爸爸的哥哥',side,1,'北方叫大爷');
//         if (age==='y') return hit(applyOrd(o,'叔叔','叔'),'叔父','爸爸的弟弟',side,1);
//         return hit(applyOrd(o,'叔伯'),'叔父/伯父','爸爸的兄弟',side,1,
//                    '比爸爸年长叫伯伯，比爸爸年幼叫叔叔');
//       } else {
//         return hit(applyOrd(o,'姑姑','姑'),'姑母','爸爸的姐妹',side,1);
//       }
//     } else {
//       // Mom's sibling
//       if (lg === 'M') return hit(applyOrd(o,'舅舅','舅'),'舅父','妈妈的兄弟',side,1);
//       else            return hit(applyOrd(o,'姨妈','姨'),'姨母','妈妈的姐妹',side,1,'也叫阿姨');
//     }
//   }

//   // ── gen+2 : grandparent's sibling ────────────────────
//   if (n === 2) {
//     const side: 'paternal'|'maternal' = pat ? 'paternal' : 'maternal';
//     const ancestor = gpName(up[0], up[1]);

//     if (pat) {
//       // Paternal grandparent's sibling
//       if (gpG === 'M') {
//         // 爷爷's sibling
//         if (lg === 'M') {
//           if (age==='e') return hit(applyOrd(o,'大爷爷','爷'),'伯祖父',`${ancestor}的哥哥`,side,2);
//           if (age==='y') return hit(applyOrd(o,'叔爷爷','爷'),'叔祖父',`${ancestor}的弟弟`,side,2);
//           return hit(applyOrd(o,'叔爷爷/大爷爷'),'祖父辈',`${ancestor}的兄弟`,side,2,
//                      '比爷爷年长叫大爷爷，年幼叫叔爷爷');
//         } else {
//           return hit(applyOrd(o,'姑奶奶','姑'),'姑祖母',`${ancestor}的姐妹`,side,2);
//         }
//       } else {
//         // 奶奶's sibling
//         if (lg === 'M') return hit(applyOrd(o,'舅爷爷','舅'),'舅祖父',`${ancestor}的兄弟`,side,2);
//         else            return hit(applyOrd(o,'姑奶奶','姑'),'姑祖母',`${ancestor}的姐妹`,side,2,
//                                    '奶奶的姐妹，与爷爷姐妹同称');
//       }
//     } else {
//       // Maternal grandparent's sibling
//       if (gpG === 'M') {
//         // 姥爷's sibling
//         if (lg === 'M') {
//           if (age==='e') return hit(applyOrd(o,'大姥爷','姥'),'舅祖父',`${ancestor}的哥哥`,side,2);
//           if (age==='y') return hit(applyOrd(o,'小姥爷','姥'),'舅祖父',`${ancestor}的弟弟`,side,2);
//           return hit(applyOrd(o,'姥爷辈'),'舅祖父',`${ancestor}的兄弟`,side,2);
//         } else {
//           return hit(applyOrd(o,'姨姥','姨'),'姨祖母',`${ancestor}的姐妹`,side,2);
//         }
//       } else {
//         // 姥姥's sibling
//         if (lg === 'M') return hit(applyOrd(o,'舅姥爷','舅'),'舅祖父',`${ancestor}的兄弟`,side,2);
//         else            return hit(applyOrd(o,'姨姥姥','姨'),'姨祖母',`${ancestor}的姐妹`,side,2);
//       }
//     }
//   }

//   // ── gen+3 and beyond: great-grandparent's sibling ────
//   const side: 'paternal'|'maternal' = pat ? 'paternal' : 'maternal';
//   const ggname = n === 3
//     ? (pat ? '曾祖' : '外曾祖') + (gpG==='M' ? '父' : '母')
//     : `${n}代祖先`;
//   const relDesc = lg === 'M' ? '的兄弟' : '的姐妹';
//   const pfx     = pat ? '' : '外';
//   const sfx     = lg === 'M' ? '叔祖' : '姑祖';
//   return hit(
//     `${pfx}${n}代${sfx}`,
//     `${pfx}${n}代${sfx}`,
//     `${ggname}${relDesc}`,
//     side, n,
//     '较远亲属，民间无固定专用称谓',
//   );
// }

// // ─────────────────────────────────────────────────────
// //  FAMILY F: Ancestor's sibling's descendant  (up+, lat, dn+)
// //  Cousins and generation-shifted relatives
// // ─────────────────────────────────────────────────────

// /**
//  * Core cousin rule:
//  *  堂 = dad's BROTHER's children  →  up[0]=M AND lat.g=M
//  *  表 = everything else
//  *       • dad's sister's children
//  *       • mom's any sibling's children
//  *       • any deeper chain via a female link
//  *
//  * Generation delta (gen = up.length − dn.length):
//  *  gen=0  → same generation (cousins proper)
//  *  gen>0  → older relative (e.g. 堂叔, 表叔)
//  *  gen<0  → younger relative (e.g. 堂侄, 表侄)
//  *
//  * Degree:
//  *  up.length=1  → 1st-degree (堂/表兄弟)
//  *  up.length=2  → 2nd-degree (再从堂/表)
//  *  up.length=3  → 3rd-degree (族/远亲)
//  */
// function deriveCousin(
//   up: G[], lat: { g: G; age: Age }, dn: G[], o: number,
// ): RelationshipResult {
//   const pat  = up[0] === 'M';
//   const side: 'paternal'|'maternal' = pat ? 'paternal' : 'maternal';
//   const gen  = up.length - dn.length;

//   // Is this a 堂 (same-clan) or 表 (cross-clan) relationship?
//   // 堂 requires EVERY link to be through males until the lateral step,
//   // AND the lateral step is to a brother.
//   const isTang = pat && lat.g === 'M';   // 堂
//   const tang   = isTang ? '堂' : '表';

//   // Degree prefix for 2nd/3rd degree cousins
//   const degree = up.length;
//   const degPfx = degree === 1 ? '' : degree === 2 ? '再从' : '族';

//   const finalM = dn[dn.length - 1] === 'M';

//   // ── gen = 0 : same generation (true cousins) ─────────
//   if (gen === 0) {
//     const desc = buildCousinDesc(up, lat, dn);
//     if (finalM) {
//       // Whether they are older or younger than you
//       return hit(
//         applyOrd(o, `${degPfx}${tang}哥哥/弟弟`, `${tang}哥`),
//         `${degPfx}${tang}兄/弟`,
//         desc, side, 0,
//         '比你年长称' + tang + '哥，比你年幼称' + tang + '弟',
//       );
//     } else {
//       return hit(
//         applyOrd(o, `${degPfx}${tang}姐姐/妹妹`, `${tang}姐`),
//         `${degPfx}${tang}姊/妹`,
//         desc, side, 0,
//         '比你年长称' + tang + '姐，比你年幼称' + tang + '妹',
//       );
//     }
//   }

//   // ── gen > 0 : they are in an OLDER generation than you ─
//   if (gen > 0) {
//     const desc = buildCousinDesc(up, lat, dn);
//     // They are aunt/uncle level, grandparent level, etc.
//     if (gen === 1) {
//       // Parent-generation relative reached via grandparent's sibling
//       if (finalM) {
//         return isTang
//           ? hit(applyOrd(o,'堂叔/堂伯','堂叔'),'堂叔父/堂伯父', desc, side, 1,
//                 '比爸爸年长叫堂伯，年幼叫堂叔')
//           : hit(applyOrd(o,'表叔/表伯','表叔'),'表叔父/表伯父', desc, side, 1,
//                 '比爸爸年长叫表伯，年幼叫表叔');
//       } else {
//         return isTang
//           ? hit(applyOrd(o,'堂姑','堂'),'堂姑母', desc, side, 1)
//           : hit(applyOrd(o,'表姑/表姨','表'),'表姑/表姨', desc, side, 1);
//       }
//     }
//     if (gen === 2) {
//       // Grandparent-generation relative
//       if (finalM) {
//         return isTang
//           ? hit('堂爷爷/堂叔爷','堂祖父辈', desc, side, 2)
//           : hit('表爷爷/表叔爷','表祖父辈', desc, side, 2);
//       } else {
//         return isTang
//           ? hit('堂奶奶/堂姑奶','堂祖母辈', desc, side, 2)
//           : hit('表奶奶/表姑奶','表祖母辈', desc, side, 2);
//       }
//     }
//     // gen >= 3
//     const sfx = finalM ? '公' : '婆';
//     return hit(`${tang}${gen}代长辈`, `${tang}祖先辈`, desc, side, gen,
//                '较远亲属，泛称即可');
//   }

//   // ── gen < 0 : they are in a YOUNGER generation than you ─
//   const desc = buildCousinDesc(up, lat, dn);
//   if (gen === -1) {
//     // Nephew/niece level via cousin
//     if (finalM) {
//       return isTang
//         ? hit(applyOrd(o,'堂侄'),'堂侄', desc, side, -1)
//         : hit(applyOrd(o,'表侄'),'表侄', desc, side, -1);
//     } else {
//       return isTang
//         ? hit(applyOrd(o,'堂侄女'),'堂侄女', desc, side, -1)
//         : hit(applyOrd(o,'表侄女'),'表侄女', desc, side, -1);
//     }
//   }
//   if (gen === -2) {
//     return finalM
//       ? hit(`${tang}侄孙`, `${tang}侄孙`, desc, side, -2)
//       : hit(`${tang}侄孙女`, `${tang}侄孙女`, desc, side, -2);
//   }
//   return hit(`${tang}晚辈`, `${tang}后辈`, desc, side, gen,
//              '较远晚辈，泛称即可');
// }

// /** Build a human-readable desc from the parsed walk */
// function buildCousinDesc(up: G[], lat: { g: G; age: Age }, dn: G[]): string {
//   const upStr = up.map(g => g==='M' ? '爸爸' : '妈妈').join('的') + '的';
//   const latStr = lat.g==='M' ? '哥哥/弟弟' : '姐姐/妹妹';
//   const dnStr  = dn.length ? '的' + dn.map(g => g==='M' ? '儿子' : '女儿').join('的') : '';
//   return `${upStr}${latStr}${dnStr}`;
// }

// // ─────────────────────────────────────────────────────
// //  FAMILY G: Ancestor's direct descendant  (up+, null, dn+)
// //  e.g. 爷爷的儿子, 爸爸的女儿, 奶奶的儿子
// //  These are relatives in a different branch without
// //  naming the lateral step explicitly.
// // ─────────────────────────────────────────────────────

// function deriveAncestorDesc(up: G[], dn: G[]): RelationshipResult {
//   const gen    = up.length - dn.length;
//   const pat    = up[0] === 'M';
//   const finalM = dn[dn.length-1] === 'M';
//   const side: 'paternal'|'maternal' = pat ? 'paternal' : 'maternal';

//   // gen = 0 → parent's child = me or my sibling
//   if (gen === 0) {
//     return finalM
//       ? hit('自己或兄弟', '兄弟（含自己）',
//             `${up.map(g=>g==='M'?'爸爸':'妈妈').join('的')}的儿子（可能是你自己）`,
//             'self', 0, '这可能指的是你自己，或者你的兄弟')
//       : hit('自己或姐妹', '姐妹（含自己）',
//             `${up.map(g=>g==='M'?'爸爸':'妈妈').join('的')}的女儿（可能是你自己）`,
//             'self', 0, '这可能指的是你自己，或者你的姐妹');
//   }

//   // gen = +1 → grandparent's child = parent level
//   if (gen === 1 && up.length === 2) {
//     const ancestor = gpName(up[0], up[1]);
//     if (pat) {
//       if (finalM)
//         return hit('爸爸/伯伯/叔叔','父辈男性', `${ancestor}的儿子`, side, 1,
//                    '是自己的爸爸，或者是伯伯、叔叔');
//       else
//         return hit('姑姑','姑母', `${ancestor}的女儿`, side, 1);
//     } else {
//       if (finalM)
//         return hit('舅舅','舅父', `${ancestor}的儿子`, side, 1);
//       else
//         return hit('妈妈/姨妈','母辈女性', `${ancestor}的女儿`, side, 1,
//                    '是自己的妈妈，或者是姨妈');
//     }
//   }

//   // gen = +2 → great-grandparent's child = grandparent level
//   if (gen === 2 && up.length === 3) {
//     const ancestor = '曾祖' + (up[0]==='M'?'':'外');
//     if (finalM)
//       return hit(pat?'爷爷辈':'姥爷辈', '祖父辈', `${ancestor}的儿子`, side, 2,
//                  '祖父级别的亲属');
//     else
//       return hit(pat?'奶奶辈':'姥姥辈', '祖母辈', `${ancestor}的女儿`, side, 2,
//                  '祖母级别的亲属');
//   }

//   // General fallback
//   const upStr = up.map(g=>g==='M'?'爸爸':'妈妈').join('的');
//   const dnStr = dn.map(g=>g==='M'?'儿子':'女儿').join('的');
//   return hit(
//     `${gen > 0 ? '长辈' : '晚辈'}`,
//     `${gen}代关系`,
//     `${upStr}的${dnStr}`,
//     side, gen,
//     '此关系链没有专用称谓，建议拆开分步查询',
//   );
// }

// // ─────────────────────────────────────────────────────
// //  Master dispatch
// // ─────────────────────────────────────────────────────

// function derive(parsed: Parsed, seniority: number): RelationshipResult {
//   if (!parsed.ok) return fail(parsed.error!, '请检查关系链是否合理');
//   const { up, lat, dn } = parsed;

//   const hasUp  = up.length  > 0;
//   const hasLat = lat !== null;
//   const hasDn  = dn.length  > 0;

//   // A: up only
//   if  (hasUp  && !hasLat && !hasDn) return deriveAncestor(up, seniority);
//   // B: lat only
//   if  (!hasUp &&  hasLat && !hasDn) return deriveSibling(lat!, seniority);
//   // C: dn only
//   if  (!hasUp && !hasLat &&  hasDn) return deriveOwnDesc(dn);
//   // D: lat + dn
//   if  (!hasUp &&  hasLat &&  hasDn) return deriveSibDesc(lat!, dn, seniority);
//   // E: up + lat
//   if  (hasUp  &&  hasLat && !hasDn) return deriveAncestorSib(up, lat!, seniority);
//   // F: up + lat + dn  (cousins / generation-shifted)
//   if  (hasUp  &&  hasLat &&  hasDn) return deriveCousin(up, lat!, dn, seniority);
//   // G: up + dn (no lateral named explicitly)
//   if  (hasUp  && !hasLat &&  hasDn) return deriveAncestorDesc(up, dn);

//   return fail('无法识别此关系');
// }

// // ─────────────────────────────────────────────────────
// //  Public Engine
// // ─────────────────────────────────────────────────────

// export class RelationshipEngine {
//   /**
//    * Calculate the kinship term for a list of Steps.
//    * Each Step = { relation: string, seniority: number }
//    * seniority 0 = unspecified, 1 = eldest/first, 2 = second…
//    */
//   calculate(steps: Step[]): RelationshipResult {
//     if (!steps || steps.length === 0)
//       return fail('请先输入亲戚关系');

//     // Build the combined primitive walk from all steps
//     const walk: PrimStep[] = [];
//     for (const step of steps) {
//       const prims = BTN[step.relation];
//       if (!prims) return fail(`未知按钮: ${step.relation}`);
//       walk.push(...prims);
//     }

//     // Seniority = the last step's ordinal (the thing being named)
//     const seniority = steps[steps.length - 1].seniority ?? 0;

//     const parsed = parsePrims(walk);
//     return derive(parsed, seniority);
//   }

//   /**
//    * Format steps into a display string.
//    * e.g. [{relation:'爸爸',seniority:0},{relation:'姐姐',seniority:2}]
//    *   →  '爸爸的2姐姐'
//    */
//   formatDisplay(steps: Step[], pendingSeniority = 0): string {
//     if (steps.length === 0)
//       return pendingSeniority > 0 ? String(pendingSeniority) : '';

//     const parts = steps.map((s, i) => {
//       const senior = s.seniority > 0 ? String(s.seniority) : '';
//       const de     = i > 0 ? '的' : '';
//       return `${de}${senior}${s.relation}`;
//     });

//     let result = parts.join('');
//     if (pendingSeniority > 0) result += `的${pendingSeniority}`;
//     return result;
//   }
// }

// export const relationshipEngine = new RelationshipEngine();


/**
 * src/engine/relationshipEngine.ts
 *
 * Full Chinese Kinship Engine
 * Supports:
 * • blood relations
 * • spouse relations
 * • affinal propagation (姻亲)
 */

// import { RelationshipResult, Step } from "../types/types"

// type G = "M" | "F"
// type Age = "e" | "y" | "a"

// type PrimStep =
//   | { k: "up"; g: G }
//   | { k: "dn"; g: G }
//   | { k: "lat"; g: G; age: Age }
//   | { k: "spouse" }

// /* -------------------------------------------------- */
// /* BUTTON DEFINITIONS */
// /* -------------------------------------------------- */

// const BTN: Record<string, PrimStep[]> = {
//   爸爸: [{ k: "up", g: "M" }],
//   妈妈: [{ k: "up", g: "F" }],

//   爷爷: [
//     { k: "up", g: "M" },
//     { k: "up", g: "M" },
//   ],
//   奶奶: [
//     { k: "up", g: "M" },
//     { k: "up", g: "F" },
//   ],

//   姥爷: [
//     { k: "up", g: "F" },
//     { k: "up", g: "M" },
//   ],
//   姥姥: [
//     { k: "up", g: "F" },
//     { k: "up", g: "F" },
//   ],

//   哥哥: [{ k: "lat", g: "M", age: "e" }],
//   弟弟: [{ k: "lat", g: "M", age: "y" }],
//   姐姐: [{ k: "lat", g: "F", age: "e" }],
//   妹妹: [{ k: "lat", g: "F", age: "y" }],

//   儿子: [{ k: "dn", g: "M" }],
//   女儿: [{ k: "dn", g: "F" }],

//   舅舅: [
//     { k: "up", g: "F" },
//     { k: "lat", g: "M", age: "a" },
//   ],

//   姨: [
//     { k: "up", g: "F" },
//     { k: "lat", g: "F", age: "a" },
//   ],

//   叔叔: [
//     { k: "up", g: "M" },
//     { k: "lat", g: "M", age: "y" },
//   ],

//   妻子: [{ k: "spouse" }],
//   丈夫: [{ k: "spouse" }],
// }

// /* -------------------------------------------------- */
// /* NORMALIZATION */
// /* -------------------------------------------------- */

// function normalize(walk: PrimStep[]): PrimStep[] {
//   let w = [...walk]

//   let changed = true

//   while (changed) {
//     changed = false

//     for (let i = 0; i < w.length - 1; i++) {
//       if (w[i].k === "lat" && w[i + 1].k === "up") {
//         w = [...w.slice(0, i), ...w.slice(i + 1)]
//         changed = true
//         break
//       }
//     }
//   }

//   return w
// }

// /* -------------------------------------------------- */
// /* PARSER */
// /* -------------------------------------------------- */

// interface Parsed {
//   ok: boolean
//   up: G[]
//   lat: { g: G; age: Age } | null
//   dn: G[]
//   gen: number
//   spouse: boolean
//   error?: string
// }

// function parsePrims(raw: PrimStep[]): Parsed {
//   let spouse = false

//   const filtered: PrimStep[] = []

//   for (const s of raw) {
//     if (s.k === "spouse") spouse = true
//     else filtered.push(s)
//   }

//   const w = normalize(filtered)

//   let i = 0
//   const up: G[] = []
//   let lat: { g: G; age: Age } | null = null
//   const dn: G[] = []

//   while (i < w.length && w[i].k === "up") {
//     up.push((w[i] as any).g)
//     i++
//   }

//   if (i < w.length && w[i].k === "lat") {
//     lat = { g: (w[i] as any).g, age: (w[i] as any).age }
//     i++
//   }

//   while (i < w.length && w[i].k === "dn") {
//     dn.push((w[i] as any).g)
//     i++
//   }

//   return {
//     ok: true,
//     up,
//     lat,
//     dn,
//     gen: up.length - dn.length,
//     spouse,
//   }
// }

// /* -------------------------------------------------- */
// /* RESULT HELPERS */
// /* -------------------------------------------------- */

// function hit(term: string, desc: string): RelationshipResult {
//   return {
//     success: true,
//     term,
//     desc,
//     formal: term,
//     side: "self",
//     gen: 0,
//   }
// }

// function fail(msg: string): RelationshipResult {
//   return { success: false, error: msg }
// }

// /* -------------------------------------------------- */
// /* SIMPLE DERIVATION (demo core) */
// /* -------------------------------------------------- */

// function derive(parsed: Parsed): RelationshipResult {
//   const { up, lat, dn } = parsed

//   if (up.length === 1 && !lat && !dn.length) {
//     return hit(up[0] === "M" ? "爸爸" : "妈妈", "父母")
//   }

//   if (up.length === 2 && !lat && !dn.length) {
//     if (up[0] === "M" && up[1] === "M") return hit("爷爷", "祖父")
//     if (up[0] === "M" && up[1] === "F") return hit("奶奶", "祖母")
//     if (up[0] === "F" && up[1] === "M") return hit("姥爷", "外祖父")
//     if (up[0] === "F" && up[1] === "F") return hit("姥姥", "外祖母")
//   }

//   if (lat && !up.length && !dn.length) {
//     if (lat.g === "M") return hit("兄弟", "兄弟")
//     return hit("姐妹", "姐妹")
//   }

//   if (up.length === 1 && lat && !dn.length) {
//     if (up[0] === "M") {
//       if (lat.g === "M") return hit("叔叔", "父亲的兄弟")
//       return hit("姑姑", "父亲的姐妹")
//     } else {
//       if (lat.g === "M") return hit("舅舅", "母亲的兄弟")
//       return hit("姨妈", "母亲的姐妹")
//     }
//   }

//   return hit("亲戚", "较远亲属")
// }

// /* -------------------------------------------------- */
// /* SPOUSE MAP */
// /* -------------------------------------------------- */

// const SPOUSE_MAP: Record<string, string> = {
//   哥哥: "嫂子",
//   弟弟: "弟媳",
//   姐姐: "姐夫",
//   妹妹: "妹夫",

//   伯伯: "伯母",
//   叔叔: "婶婶",
//   姑姑: "姑父",
//   舅舅: "舅妈",
//   姨妈: "姨夫",

//   堂哥: "堂嫂",
//   堂弟: "堂弟媳",
//   表哥: "表嫂",
//   表弟: "表弟媳",
// }

// /* -------------------------------------------------- */
// /* AFFINAL PROPAGATION */
// /* -------------------------------------------------- */

// function applyAffinal(term: string): string {
//   if (SPOUSE_MAP[term]) return SPOUSE_MAP[term]

//   if (term.startsWith("堂")) {
//     if (term.includes("哥")) return "堂嫂"
//     if (term.includes("弟")) return "堂弟媳"
//   }

//   if (term.startsWith("表")) {
//     if (term.includes("哥")) return "表嫂"
//     if (term.includes("弟")) return "表弟媳"
//   }

//   return term + "的配偶"
// }

// /* -------------------------------------------------- */
// /* ENGINE */
// /* -------------------------------------------------- */

// export class RelationshipEngine {
//   calculate(steps: Step[]): RelationshipResult {
//     if (!steps.length) return fail("请输入关系")

//     const walk: PrimStep[] = []

//     for (const s of steps) {
//       const prims = BTN[s.relation]
//       if (!prims) return fail("未知按钮")

//       walk.push(...prims)
//     }

//     const parsed = parsePrims(walk)

//     let res = derive(parsed)

//     if (!res.success) return res

//     if (parsed.spouse) {
//       if (res.term) {
//             res.term = applyAffinal(res.term)
//         }
//       res.desc += "的配偶"
//     }

//     return res
//   }

//   formatDisplay(steps: Step[]) {
//     return steps.map((s, i) => (i ? "的" : "") + s.relation).join("")
//   }
// }

// export const relationshipEngine = new RelationshipEngine()

import { Step, RelationshipResult } from "../types/types"

type Gender = "M" | "F"
type Age = "older" | "younger" | "any"

type Prim =
  | { t: "up"; g: Gender }
  | { t: "down"; g: Gender }
  | { t: "side"; g: Gender; age: Age }
  | { t: "spouse" }

interface Parsed {
  up: Gender[]
  down: Gender[]
  side?: { g: Gender; age: Age }
  spouse: boolean
}

/* ------------------------------------------------ */
/* BUTTON → primitive mapping */
/* ------------------------------------------------ */

const MAP: Record<string, Prim[]> = {

  爸爸:[{t:"up",g:"M"}],
  妈妈:[{t:"up",g:"F"}],

  爷爷:[{t:"up",g:"M"},{t:"up",g:"M"}],
  奶奶:[{t:"up",g:"M"},{t:"up",g:"F"}],

  姥爷:[{t:"up",g:"F"},{t:"up",g:"M"}],
  姥姥:[{t:"up",g:"F"},{t:"up",g:"F"}],

  哥哥:[{t:"side",g:"M",age:"older"}],
  弟弟:[{t:"side",g:"M",age:"younger"}],

  姐姐:[{t:"side",g:"F",age:"older"}],
  妹妹:[{t:"side",g:"F",age:"younger"}],

  儿子:[{t:"down",g:"M"}],
  女儿:[{t:"down",g:"F"}],

  舅舅:[{t:"up",g:"F"},{t:"side",g:"M",age:"any"}],
  姨:[{t:"up",g:"F"},{t:"side",g:"F",age:"any"}],

  叔叔:[{t:"up",g:"M"},{t:"side",g:"M",age:"younger"}],

  妻子:[{t:"spouse"}],
  丈夫:[{t:"spouse"}]
}

/* ------------------------------------------------ */
/* PARSE WALK */
/* ------------------------------------------------ */

function parse(prims: Prim[]): Parsed {

  let spouse=false

  const up:Gender[]=[]
  const down:Gender[]=[]
  let side

  for(const p of prims){

    if(p.t==="spouse") spouse=true
    else if(p.t==="up") up.push(p.g)
    else if(p.t==="down") down.push(p.g)
    else if(p.t==="side") side=p

  }

  return {up,down,side,spouse}
}

/* ------------------------------------------------ */
/* GENERATION PREFIX */
/* ------------------------------------------------ */

function ancestorPrefix(level:number){

  if(level===1) return ""
  if(level===2) return "祖"
  if(level===3) return "曾祖"
  if(level===4) return "高祖"

  return "远祖"
}

function descendantPrefix(level:number){

  if(level===1) return ""
  if(level===2) return "孙"
  if(level===3) return "曾孙"
  if(level===4) return "玄孙"

  return "远孙"
}

/* ------------------------------------------------ */
/* BLOOD RELATION */
/* ------------------------------------------------ */

function blood(parsed:Parsed):string{

  const {up,down,side}=parsed

  if(up.length===1 && !side && !down.length){
    return up[0]==="M" ? "爸爸":"妈妈"
  }

  if(up.length>=2 && !side){

    const prefix=ancestorPrefix(up.length)

    if(up[up.length-1]==="M") return prefix+"父"
    else return prefix+"母"

  }

  if(down.length>=1 && !side){

    const prefix=descendantPrefix(down.length)

    if(down[down.length-1]==="M") return prefix+"子"
    else return prefix+"女"

  }

  if(up.length===1 && side){

    if(up[0]==="M"){

      if(side.g==="M")
        return side.age==="older" ? "伯父":"叔叔"

      else
        return "姑姑"
    }

    if(up[0]==="F"){

      if(side.g==="M")
        return "舅舅"

      else
        return "姨妈"
    }
  }

  if(side && down.length===1){

    if(side.g==="M")
      return down[0]==="M"?"侄子":"侄女"

    else
      return down[0]==="M"?"外甥":"外甥女"
  }

  return "亲戚"
}

/* ------------------------------------------------ */
/* SPOUSE PROPAGATION */
/* ------------------------------------------------ */

const SPOUSE:Record<string,string>={

  伯父:"伯母",
  叔叔:"婶婶",

  姑姑:"姑父",

  舅舅:"舅妈",
  姨妈:"姨父",

  哥哥:"嫂子",
  弟弟:"弟媳",

  姐姐:"姐夫",
  妹妹:"妹夫",

  儿子:"儿媳",
  女儿:"女婿",

  爸爸:"公公",
  妈妈:"婆婆"
}

/* ------------------------------------------------ */
/* ENGINE */
/* ------------------------------------------------ */

export class RelationshipEngine{

  calculate(steps:Step[]):RelationshipResult{

    const prims:Prim[]=[]

    for(const s of steps){

      const p=MAP[s.relation]

      if(!p)
        return {success:false,error:"未知关系"}

      prims.push(...p)
    }

    const parsed=parse(prims)

    let term=blood(parsed)

    if(parsed.spouse){

      if(SPOUSE[term])
        term=SPOUSE[term]
      else
        term=term+"的配偶"
    }

    return {
      success:true,
      term,
      desc:term
    }
  }

  formatDisplay(steps:Step[]){

    return steps
      .map((s,i)=>i===0?s.relation:`的${s.relation}`)
      .join("")
  }
}

export const relationshipEngine=new RelationshipEngine()