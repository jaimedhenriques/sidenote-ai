#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const sha256 = (rel) => createHash("sha256").update(readFileSync(join(root, rel))).digest("hex");

const LICENSE_SHA = "1f7b21edb5e5810a5d2ae405ecd1882d67f410e4c2a2245e93e9de48112e5da6";
const KIT_PIN = "63c1308d112b6b1205d86244a156cca1abef5087";

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const licenseSha = sha256("LICENSE");
assert(licenseSha === LICENSE_SHA, `LICENSE sha mismatch: ${licenseSha}`);

const gtm = read("src/gtmCopy.ts");
assert(gtm.includes("monthly quota"), "gtmCopy missing monthly quota");
assert(gtm.includes("No new spend."), "gtmCopy missing no-new-spend line");
assert(gtm.includes("$10 hosted SKU"), "gtmCopy missing $10 hosted SKU refusal");
assert(gtm.includes('ctaTargetId: "new-meeting"'), "gtmCopy missing ctaTargetId");
assert(!/copilot|fitch/i.test(gtm), "gtmCopy names Copilot or Fitch");

const app = read("src/App.tsx");
assert(app.includes("from './gtmCopy'"), "App.tsx missing gtmCopy import");
assert(app.includes("from './ui/button'"), "App.tsx missing kit Button import");
assert(app.includes("SIDENOTE_GTM.quotaLine"), "App.tsx missing quotaLine");
assert(app.includes("SIDENOTE_GTM.pricingNote"), "App.tsx missing pricingNote");
assert(app.includes('className="primary hero-cta"'), "App.tsx missing primary hero-cta");
assert(app.includes("goToSidenoteCtaTarget"), "App.tsx missing CTA handler");
assert(app.includes('id="new-meeting"'), "App.tsx missing #new-meeting target");
assert(!app.includes('<a className="primary hero-cta"'), "hero CTA is still a raw anchor");
assert((app.match(/<button className="primary"/g) || []).length >= 1, "native primary buttons were removed");
assert(!/copilot|fitch/i.test(app), "App.tsx names Copilot or Fitch");

const source = read("src/ui/SOURCE.md");
assert(source.includes(KIT_PIN), "SOURCE.md missing kit pin");
assert(source.includes("button.tsx"), "SOURCE.md missing button.tsx path");
assert(!source.includes("badge.tsx"), "SOURCE.md vendors extra kit files");

const button = read("src/ui/button.tsx");
assert(button.includes('from "./utils"'), "button.tsx must import ./utils");
assert(!button.includes("radix"), "button.tsx must not import radix");
assert(!button.includes("@/"), "button.tsx must not use @/ alias");

const css = read("src/styles.css");
assert(css.includes(".quota-line"), "styles.css missing .quota-line");
assert(!css.includes("@tailwind"), "styles.css must not add Tailwind");
assert(!read("package.json").includes("tailwind"), "package.json must not add Tailwind");

const uiLicense = read("src/ui/LICENSE.md");
assert(uiLicense.includes("Copyright (c) 2023 shadcn"), "kit LICENSE.md missing shadcn MIT notice");

console.log("sidenote_quota_gtm_ok PASS");
