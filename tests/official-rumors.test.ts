import assert from "node:assert/strict";
import test from "node:test";

import { parseCsvRows, parseOfficialRumorCsv } from "../src/lib/official-rumors";

test("CSV 解析支援引號、逗號、換行與雙引號跳脫", () => {
  const rows = parseCsvRows('編號,標題,發佈時間,發佈內容\r\n1,"假客服,退款",2026/07/18 10:00,"第一行\n第二行說""不要點"""');
  assert.deepEqual(rows, [
    ["編號", "標題", "發佈時間", "發佈內容"],
    ["1", "假客服,退款", "2026/07/18 10:00", '第一行\n第二行說"不要點"'],
  ]);
});

test("官方闢謠資料依日期排序、縮短內容並限制筆數", () => {
  const longContent = "請先停止操作並改從官方管道查證。".repeat(30);
  const csv = [
    "編號,標題,發佈時間,發佈內容",
    '1,較舊消息,2026/07/01 09:00,"舊內容"',
    `2,最新消息,2026/07/18 10:00,"${longContent}"`,
  ].join("\n");
  const items = parseOfficialRumorCsv(csv, 1);
  assert.equal(items.length, 1);
  assert.equal(items[0].id, "2");
  assert.equal(items[0].title, "最新消息");
  assert.equal(items[0].excerpt.endsWith("…"), true);
  assert.equal(items[0].excerpt.length <= 220, true);
});

test("官方 CSV 欄位異動時拒絕猜測解析", () => {
  assert.throws(
    () => parseOfficialRumorCsv("id,title,date,content\n1,test,2026-01-01,text"),
    /OFFICIAL_RUMOR_SCHEMA_CHANGED/,
  );
});
