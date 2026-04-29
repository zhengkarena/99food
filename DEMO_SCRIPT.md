# 99Food City Console — 5-Minute Demo Script

**Total time budget: 5:00.** Every section has a hard cap. If you run long
on one section, sacrifice depth on the next — never extend the total.

Setup before you start:
- Browser fullscreen, dev server already running at localhost:5173
- Have `experiment_results_template.csv` open in a file manager so you can
  drag-drop without searching during the demo
- Pre-select **Goiânia** as the active city (left of nav bar should read
  "Active city · Goiânia · TIER A")
- Open on **01 · City Scorecard** tab

---

## [0:00 – 0:30] Hook · the question

> "Today I want to show you a tool I built that answers one question:
> **'Given any Brazilian city, should 99Food enter, when, how, and will it pay back?'**
> Five minutes, four modules, real data."

**Action**: stay on the City Scorecard tab. The Brazil map dominates the screen.
Point at it.

> "15 yellow dots — already launched. 5 orange — next-wave candidates.
> One **red dot in Santos** — that's the Keeta beachhead. The map already
> tells a story before I touch anything."

---

## [0:30 – 1:30] Module 1 · City Scorecard

**Action 1**: hover Santos dot.

> "Tier B, flywheel score 54.8, status: Contest. The model already
> classifies Santos as 'go fight here' — not because it's the biggest market,
> but because losing the Keeta beachhead is strategically expensive."

**Action 2**: click the **Entry Priority** toggle (top-right of analyst note).

> "Now watch the table — São Paulo just dropped from #1 to outside top 5.
> SP is the most important market, but the **most expensive to win**:
> iFood HQ city, Keeta also there, top-3 metro penalty. The tool surfaces
> what really matters for the next-wave decision: **Ribeirão Preto,
> Florianópolis, Uberlândia** — unlaunched Tier-B with the cleanest
> economics."

**Action 3** (optional, if time): drag the **Strategic Value** weight slider.

> "Re-rank live. This is a strategy tool, not a dashboard."

[Time check: should be at ~1:30]

---

## [1:30 – 3:00] Module 2 · Subsidy ROI Simulator (the soul)

**Action 1**: switch to **02 · Subsidy ROI** tab. Slider should default to R$8.

> "Here's where the model gets sharp. Pick a segment, drag the subsidy.
> You see two reference lines: green is the **theoretical sweet spot**,
> red is **industry reality** — the R$15 first-order coupon level we observe
> in iFood, Rappi, 99Food."

**Action 2**: drag slider to **R$15** (industry reality).

> "**Reality gap: R$11 of every R$15 coupon goes to people who would have
> ordered anyway, or to the diminishing-returns zone.** Industry burns
> money on the wrong levers."

**Action 3**: switch segment to **High-value retention**.

> "Same city, same model — sweet spot collapses to zero. Why? k=0.15,
> 70% organic. **Don't subsidize loyal users — invest in retention through
> non-price tools**: membership, priority dispatch, dedicated SLA."

The chips below the segment description make this concrete:
点出绿色 chips: 会员权益 / 优先派单 / 客服 SLA / 专属客服热线.

**Action 4** (the wow): switch back to **New user · first order** segment.

> "Sweet spot R$3.66. Industry reality R$15. The four-peso difference
> is where 99Food can outrun the market — by being precise."

[Time check: should be at ~3:00]

---

## [3:00 – 4:00] Module 3 · Entry Strategy

**Action 1**: switch to **03 · Entry Strategy** tab.

> "Module 1 says where; Module 2 says how. Module 3 puts them together.
> For the active city, the tool generates a one-pager: verdict, segment
> ladder, merchant ramp, budget split, 30/60/90 milestones, risk flags."

**Action 2**: scroll to the **Risk Flags** section.

> "These aren't generic — for São Paulo it flags both iFood retaliation
> and Keeta same-market presence. For Goiânia, none — clean operating
> environment."

**Action 3**: click **Export PDF** (top-right).

> "One click — clean white-on-black brief that goes straight to the
> business team. This isn't a demo, it's a tool the team can use Monday."

[Time check: should be at ~4:00]

---

## [4:00 – 4:30] Module 4 · 90-Day Forecast (flywheel ignition)

**Action 1**: switch to **04 · 90-Day Forecast** tab.

> "Three strategies overlaid: Aggressive, Balanced, **Goiânia replica**.
> Y-axis is organic share. The dashed green line is the **flywheel
> threshold** — 40% organic. Cross that line and the city is self-sustaining."

**Action 2**: point to the dot on the green (Goiânia replica) line.

> "**Day 48: Goiânia replica is the first to ignite — at one-third
> the spend of Aggressive.** This is the GM-level insight: **more spend
> doesn't mean faster ignition.** Density-focused, mobility-cross-sell
> beats brute-force cash."

**Action 3**: click **What-if Keeta @ D45** toggle.

> "Defensive scenario. CAC × 1.5, growth × 0.7. Watch ignition slip
> 14 days. Even under attack, Goiânia replica still ignites — but the
> margin gets thin. Worst-case answer for the GM: yes we still pay
> back, but the playbook needs to be precision-led, not spend-led."

---

## [4:30 – 5:00] Module 5 (bonus) · Custom data upload

**Action 1**: click **Upload data** (top-right).

**Action 2**: drag `experiment_results_template.csv` into the A/B tab.

> "GM uploads their own A/B data. Modal closes. Bottom-right
> panel: **before vs after k value**. Real data shows higher elasticity
> than industry priors — model recalibrates."

**Action 3**: click "See updated curves in Subsidy ROI →" link.

> "Subsidy curves redrawn with their k values. **This isn't a one-shot
> demo, it's a product the team can keep using as their A/B data grows.**"

---

## [5:00] Close

> "Five minutes, four modules, one Brazilian map full of decisions.
> Real IBGE data, real Reuters benchmarks, every estimate documented in
> DATA_SOURCES.md. Built in a week. I'd love to walk through the next
> wave with the team."

---

## Time-budget cheatsheet

| Time | Section | Hard cap |
|---|---|---|
| 0:00 | Open · the question | 0:30 |
| 0:30 | City Scorecard + Entry Priority toggle | 1:30 |
| 1:30 | Subsidy ROI · sweet spot vs reality gap vs segment | 3:00 |
| 3:00 | Strategy brief + PDF export | 4:00 |
| 4:00 | 90-day forecast + flywheel ignition + Keeta what-if | 4:30 |
| 4:30 | Custom upload · before/after | 5:00 |

## If you run over

- **At 1:30**: skip the weight slider drag (Action 3 of Module 1)
- **At 3:00**: skip the segment-switch back to "New user" (Action 4 of Module 2)
- **At 4:00**: skip the Risk Flags scroll (Action 2 of Module 3); just say "Risk flags surface iFood + Keeta automatically"
- **At 4:30**: skip the Keeta what-if (Action 3 of Module 4)
- **At 5:00**: skip the close speech; the upload demo IS the close

## If GM asks: "这种工具能 productize 吗？"

A 90-second answer. Memorize the structure, vary the wording. Don't read it.

> **(0–20s) 现状定位**
> "现在你看到的是个单机 demo——所有数据要么是公开数据（IBGE 2022 / Reuters /
> 媒体）、要么是来自我自己的研究估算、要么是 GM 你上传进来的 CSV。它跑在
> 浏览器里，没后端，30 秒部署到 Vercel。"

> **(20–50s) 落地路径**
> "真正接入团队需要做三件事：(1) 把上传的 CSV 接口换成 99Food 内部
> BI 数据源——schema 我已经验证过兼容性，这就是为什么我设计了 cities.csv
> 这套 schema；(2) 把 elasticity k 值从行业先验切到 99Food 真实 A/B 数据，
> 现在 refit 算法已经在工具里跑通了；(3) 加一层简单的权限和审计日志。"

> **(50–80s) 时间表**
> "我估算 6 周可以做出一个让 pilot 团队内部使用的版本：第 1–2 周接数据
> pipeline，第 3–4 周加权限+审计，第 5 周内部联调，第 6 周对接 4–5 个
> 城市策略 PM 试用。我自己来做这个 productization 没问题。"

> **(80–90s) 收尾**
> "工具的灵魂不在代码，在它把'市场重要性 vs 进入优先级'、
> '甜点补贴 vs 行业现实'、'飞轮启动 vs 盈亏平衡'这三组对比框架做出来了。
> 这些框架接哪份数据都成立。代码只是把它们做成了可交互的形式。"

**Key beats**: 现状 → 落地 3 步 → 6 周时间表 → 框架不依赖代码。
Don't get pulled into "but how do we handle X edge case" — pivot back:
"这是上线后第一周做的，不是 demo 阶段做的。"

## If GM interrupts with questions

Each module has anticipated answers built in:

- **"Why 80% iFood share, not 87%?"** → Reuters primary. 87% is secondary media exaggeration. (Module 1, lower analyst note)
- **"What about retaining high-value users you stop subsidizing?"** → Show RFM ladder bottom row: non-price tactics. (Module 3)
- **"How do I know your k values are right?"** → Upload your A/B data, watch the curves recalibrate. (Module 5 bonus)
- **"What if Keeta moves first?"** → Toggle in Module 4. Defensive scenario built in.
- **"Why Tier B, not Tier A, as Enter threshold?"** → 99Food has taken 100% of Tier S/A; the real next-wave question is which Tier B can run density. (Module 1, Entry Priority analyst note)
