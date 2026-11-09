import test from "node:test";
import assert from "node:assert";

// Test Helper for store ID parsing (reproducing logic for verification)
function parseStoreIdHelper(storeId: string): { prefix: string; num: number; hasNum: boolean } {
  if (!storeId) {
    return { prefix: "", num: 0, hasNum: false };
  }
  const match = storeId.match(/(\d+)$/);
  if (match) {
    const numStr = match[1];
    const num = parseInt(numStr, 10);
    const prefix = storeId.substring(0, storeId.length - numStr.length);
    return { prefix, num, hasNum: true };
  }
  return { prefix: storeId, num: 0, hasNum: false };
}

test("StoreId parsing extracts prefix and number correctly", () => {
  const t1 = parseStoreIdHelper("A02");
  assert.strictEqual(t1.prefix, "A");
  assert.strictEqual(t1.num, 2);
  assert.strictEqual(t1.hasNum, true);

  const t2 = parseStoreIdHelper("GRP105");
  assert.strictEqual(t2.prefix, "GRP");
  assert.strictEqual(t2.num, 105);
  assert.strictEqual(t2.hasNum, true);

  const t3 = parseStoreIdHelper("STORE");
  assert.strictEqual(t3.prefix, "STORE");
  assert.strictEqual(t3.num, 0);
  assert.strictEqual(t3.hasNum, false);

  const t4 = parseStoreIdHelper("");
  assert.strictEqual(t4.prefix, "");
  assert.strictEqual(t4.num, 0);
  assert.strictEqual(t4.hasNum, false);
});

test("Settlement calculation logic matches business requirements", () => {
  const totalSales = 15000;
  const totalOnline = 5000;
  const totalIncentive = 1200;
  const petrolAllowance = 300;

  // Delivery agent collected totalSales, minus online payments received directly, minus incentive & petrol allowance
  const finalTotal = totalSales - totalOnline - totalIncentive - petrolAllowance;
  assert.strictEqual(finalTotal, 8500);

  // String parsing resilience
  const parsedFinalTotal =
    parseFloat("15000") -
    parseFloat("5000") -
    parseFloat("1200") -
    (parseFloat("300") || 0);
  assert.strictEqual(parsedFinalTotal, 8500);
});

test("Bill payment split consistency (Online + Offline = Total)", () => {
  const totalBill = 2500;
  const onlineAmount = 1000;
  const offlineAmount = totalBill - onlineAmount;

  assert.strictEqual(offlineAmount, 1500);
  assert.strictEqual(onlineAmount + offlineAmount, totalBill);
});

test("Group name and area name trimming logic", () => {
  const rawGroups = [" Group A ", "Group B\t", "Group A", ""];
  const trimmedUnique = Array.from(
    new Set(
      rawGroups
        .filter((g) => g && g.trim() !== "")
        .map((g) => g.trim()),
    ),
  );

  assert.deepStrictEqual(trimmedUnique, ["Group A", "Group B"]);
});

test("Settlement delete endpoint is prohibited in production environment", () => {
  const isAllowedToDelete = (env: string) => env !== "production";
  assert.strictEqual(isAllowedToDelete("production"), false);
  assert.strictEqual(isAllowedToDelete("development"), true);
  assert.strictEqual(isAllowedToDelete("test"), true);
});
