// Qty rules helpers — when product.qtyRules is set, enforce min + increment on stepper/input.
// Step per +/- click is `min * increment` (e.g. min 5, increment 2 → 5, 15, 25, 35...).
export const stepOf = (rules) => {
  const min = rules?.min ?? 1;
  const inc = rules?.increment ?? 1;
  return rules ? min * inc : inc;
};

export const stepUp = (curr, rules) => {
  const min = rules?.min ?? 1;
  if (curr <= 0) return min;
  if (curr < min) return min;
  return curr + stepOf(rules);
};

export const stepDown = (curr, rules) => {
  const min = rules?.min ?? 1;
  if (curr <= min) return 0;
  return curr - stepOf(rules);
};

export const snapQty = (val, rules) => {
  const num = Math.max(0, parseInt(val) || 0);
  if (!rules || num === 0) return num;
  const min = rules.min ?? 1;
  const step = stepOf(rules);
  if (num < min) return min;
  const offset = Math.round((num - min) / step);
  return min + offset * step;
};
