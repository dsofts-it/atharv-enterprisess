import { mkdir, writeFile } from "node:fs/promises";
const directory = "public/images/illustrations";
await mkdir(directory, { recursive: true });
const c = {
  navy: "#173554",
  blue: "#70cbe7",
  cyan: "#19afca",
  pale: "#e7f5fc",
  sage: "#9bc9b4",
  skin: "#c98b66",
  dark: "#243954",
  pink: "#e88bb1",
};
const person = (
  x,
  y,
  scale = 1,
  shirt = c.cyan,
  hair = c.dark,
  pose = "standing",
) =>
  `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-27 63Q-32 15 0 13Q32 15 27 63Z" fill="${shirt}"/><path d="M-13 60L-17 108M13 60L18 108" stroke="${c.navy}" stroke-width="14" stroke-linecap="round"/><path d="M-15 110H-29M18 110H31" stroke="${c.dark}" stroke-width="9" stroke-linecap="round"/><path d="M-22 30L-39 62M23 30L${pose === "help" ? "58 42" : "39 60"}" stroke="${c.skin}" stroke-width="10" stroke-linecap="round"/><rect x="-6" y="3" width="12" height="16" rx="5" fill="${c.skin}"/><ellipse cy="-9" rx="19" ry="24" fill="${c.skin}"/><path d="M-19-8Q-25-35 0-37Q27-36 19-7L12-24Q-7-15-16-23Z" fill="${hair}"/><path d="M-5 1Q2 6 8 0" fill="none" stroke="#8c553c" stroke-width="2" stroke-linecap="round"/><circle cx="-6" cy="-7" r="1.5" fill="${c.navy}"/><circle cx="8" cy="-7" r="1.5" fill="${c.navy}"/></g>`;
const plant = `<g transform="translate(339 205)"><path d="M0 0V-79" stroke="#568d80" stroke-width="4"/><path d="M0-38Q-48-69-29-85Q-5-85 0-38M0-23Q38-61 43-38Q39-18 0-23M0-58Q25-92 29-72Q28-56 0-58" fill="${c.sage}"/><path d="M-19 0H20L15 38H-13Z" fill="#c8dce8"/></g>`;
const calendar = `<g transform="translate(101 47)"><rect width="195" height="164" rx="18" fill="white" stroke="#a9d7e6" stroke-width="3"/><path d="M0 42H195" stroke="#cde8f3" stroke-width="3"/><path d="M43-8V12M151-8V12" stroke="${c.navy}" stroke-width="7" stroke-linecap="round"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${26 + (i % 4) * 41}" y="${62 + Math.floor(i / 4) * 30}" width="20" height="15" rx="5" fill="${i === 6 ? c.cyan : "#dfeff6"}"/>`).join("")}<circle cx="173" cy="148" r="33" fill="${c.sage}"/><path d="M159 147L170 159L189 136" stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const document = `<g transform="translate(120 31)"><rect width="151" height="194" rx="15" fill="white" stroke="#b4d7e8" stroke-width="3"/><rect x="25" y="30" width="53" height="10" rx="5" fill="${c.cyan}"/>${[65, 88, 111, 134].map((y, i) => `<rect x="25" y="${y}" width="${95 - i * 10}" height="6" rx="3" fill="#d8e9f2"/>`).join("")}<path d="M27 167L39 178L61 155" stroke="${c.sage}" stroke-width="7" stroke-linecap="round" fill="none"/></g>`;
const sofa = `<rect x="55" y="133" width="253" height="72" rx="25" fill="#c3e3ef"/><rect x="64" y="177" width="237" height="38" rx="13" fill="#a1d0e4"/><path d="M79 211V232M283 211V232" stroke="${c.navy}" stroke-width="7"/>`;
const shield = `<path d="M200 33L278 63V123Q279 185 200 223Q121 185 122 123V63Z" fill="${c.cyan}"/><path d="M163 122L189 148L239 95" stroke="white" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const scenes = {
  "home-nursing": `<rect x="45" y="65" width="117" height="119" rx="12" fill="white"/><path d="M103 87V130M81 109H125" stroke="#90d8eb" stroke-width="10"/>${person(165, 119, 0.88, c.cyan, c.dark, "help")}${person(249, 144, 0.68, "#e6b7c7", "#b2b7bb")}<rect x="209" y="169" width="48" height="33" rx="6" fill="${c.navy}"/>${plant}`,
  "elderly-care": `${plant}<path d="M69 220Q185 150 291 220" fill="#cae5ed"/>${person(143, 117, 0.95, c.cyan, c.dark, "help")}${person(232, 127, 0.85, c.sage, "#cad0d5")}<path d="M271 169V225M271 169Q272 154 283 163" stroke="${c.navy}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  "patient-attendant": `<circle cx="226" cy="203" r="34" fill="white" stroke="${c.navy}" stroke-width="7"/><circle cx="283" cy="229" r="9" fill="${c.navy}"/><path d="M198 139V194H271L282 226M196 138H182" stroke="${c.cyan}" stroke-width="10" fill="none" stroke-linecap="round"/>${person(223, 112, 0.6, c.sage, "#c1c6cd")}${person(131, 103, 0.97, c.cyan, c.dark, "help")}${plant}`,
  "post-operative-care": `${sofa}${person(177, 108, 0.67, "#b4cc9f", c.dark)}${person(275, 93, 0.94, c.cyan, c.dark, "help")}<g transform="translate(71 81)"><circle r="28" fill="white"/><path d="M-12 0L-3 9L14-12" stroke="${c.sage}" stroke-width="5" fill="none"/></g>${plant}`,
  "24-hour-care": `${calendar}<circle cx="75" cy="90" r="25" fill="#f0d498"/><path d="M305 119Q346 121 338 77Q367 102 349 129Q325 151 305 119" fill="${c.navy}"/><path d="M72 155Q56 203 105 220M297 225Q339 222 345 169" stroke="${c.cyan}" stroke-width="4" stroke-dasharray="6 7" fill="none"/>`,
  "bedridden-care": `<rect x="48" y="167" width="274" height="45" rx="13" fill="#a2cbe0"/><path d="M50 135V237M320 177V237" stroke="${c.navy}" stroke-width="7" stroke-linecap="round"/><rect x="64" y="148" width="64" height="25" rx="12" fill="white"/><circle cx="126" cy="151" r="17" fill="${c.skin}"/><path d="M144 147Q209 133 266 163V180H142Z" fill="${c.sage}"/>${person(268, 78, 0.88, c.cyan, c.dark, "help")}${plant}`,
  family: `${sofa}${person(125, 101, 0.7, c.sage, c.dark)}${person(203, 107, 0.64, "#e9bdcc", "#b1bbc4")}${person(286, 101, 0.84, c.cyan, c.dark, "help")}${plant}`,
  booking: `${calendar}${person(72, 119, 0.96, c.cyan, c.dark, "help")}<path d="M67 143L117 126L130 155L82 173Z" fill="${c.navy}"/>`,
  verification: `${document}${person(98, 111, 0.95, c.cyan)}<circle cx="273" cy="166" r="38" fill="${c.sage}"/><path d="M255 166L269 180L292 150" stroke="white" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  scheduling: `${calendar}${plant}`,
  coordination: `<rect x="62" y="167" width="270" height="15" rx="7" fill="${c.navy}"/><path d="M79 180V237M315 180V237" stroke="${c.navy}" stroke-width="7"/>${person(119, 100, 0.67, c.cyan)}${person(276, 103, 0.67, c.sage)}<path d="M153 118H232L222 170H161Z" fill="#b1d8ed"/><circle cx="192" cy="142" r="6" fill="white"/>`,
  trust: `${shield}${person(73, 139, 0.64, c.sage)}${person(326, 138, 0.64, c.cyan)}`,
  welcome: `${calendar}${person(78, 109, 0.99, c.cyan, c.dark, "help")}${plant}`,
  caregiver: `${person(139, 111, 1.04, c.cyan, c.dark, "help")}<rect x="211" y="64" width="90" height="133" rx="13" fill="white" stroke="#b5dae9" stroke-width="3"/><path d="M231 99L238 106L249 91M231 132L238 139L249 124M231 163L238 170L249 155" stroke="${c.sage}" stroke-width="4" fill="none"/><path d="M263 99H283M263 132H283M263 163H283" stroke="#b5dae9" stroke-width="4"/>${plant}`,
  "empty-booking": `${calendar}<path d="M189 120H225M207 102V138" stroke="${c.cyan}" stroke-width="7" stroke-linecap="round"/>`,
  notification: `<circle cx="200" cy="134" r="91" fill="#d5edf7"/><path d="M146 167H255L242 141V104Q242 66 201 66Q160 66 160 104V141Z" fill="white" stroke="${c.navy}" stroke-width="4"/><path d="M188 181Q200 201 214 181" stroke="${c.cyan}" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="258" cy="73" r="19" fill="${c.pink}"/><path d="M200 51V43" stroke="${c.navy}" stroke-width="5" stroke-linecap="round"/>`,
  invoice: `${document}<circle cx="280" cy="176" r="38" fill="#c5e7de"/><path d="M266 160H293M266 170H293M270 160Q293 162 283 174L271 176L289 194" fill="none" stroke="${c.navy}" stroke-width="4" stroke-linecap="round"/>`,
  contact: `${person(192, 113, 1.04, c.cyan)}<path d="M168 100Q155 50 193 49Q229 48 218 100M217 99L202 111" stroke="${c.navy}" stroke-width="7" stroke-linecap="round" fill="none"/><rect x="61" y="59" width="85" height="57" rx="15" fill="white"/><path d="M130 107L140 131L105 114" fill="white"/><path d="M79 80H125M79 93H110" stroke="#a1d7e9" stroke-width="5" stroke-linecap="round"/>${plant}`,
  team: `${person(104, 126, 0.86, c.sage)}${person(201, 101, 1.08, c.cyan)}${person(297, 129, 0.84, "#e0b4c8")}`,
  faq: `${document}<circle cx="263" cy="99" r="44" fill="#bce7f3"/><path d="M251 86Q251 69 268 75Q283 83 267 95L263 108M263 121V123" stroke="${c.navy}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  journey: `<path d="M53 192Q122 80 200 150T348 101" stroke="#9ad2e8" stroke-width="7" fill="none" stroke-dasharray="7 9"/>${[75, 195, 329].map((x, i) => `<circle cx="${x}" cy="${[164, 150, 121][i]}" r="23" fill="${[c.sage, c.cyan, c.pink][i]}"/><path d="M${x - 9} ${[164, 150, 121][i]}L${x - 2} ${[171, 157, 128][i]}L${x + 10} ${[156, 142, 113][i]}" stroke="white" stroke-width="4" fill="none"/>`).join("")}`,
};
for (const [name, scene] of Object.entries(scenes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" fill="none"><ellipse cx="202" cy="140" rx="165" ry="112" fill="${c.pale}"/><circle cx="68" cy="61" r="8" fill="#b8e6f2"/><path d="M322 36V52M314 44H330" stroke="#b3d8df" stroke-width="3" stroke-linecap="round"/><ellipse cx="202" cy="242" rx="141" ry="8" fill="#c5deea" opacity=".45"/>${scene}</svg>`;
  await writeFile(`${directory}/${name}.svg`, svg);
}
await writeFile(
  `${directory}/manifest.json`,
  JSON.stringify(
    Object.fromEntries(
      Object.keys(scenes).map((name) => [
        name,
        {
          src: `/images/illustrations/${name}.svg`,
          kind: "Original code-native SVG illustration",
          subjects: "Fictional illustrative people",
          use: name,
        },
      ]),
    ),
    null,
    2,
  ),
);
console.log(`Created ${Object.keys(scenes).length} original illustrations.`);
