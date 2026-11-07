import type { JsonSchema } from "./types.js";

/** Returns a list of problems, empty when `value` satisfies `schema`. */
export function validate(schema: JsonSchema, value: unknown, path = "$"): string[] {
  const problems: string[] = [];

  if (schema.enum && !schema.enum.some((x) => Object.is(x, value))) {
    problems.push(`${path}: must be one of ${JSON.stringify(schema.enum)}`);
  }

  switch (schema.type) {
    case undefined:
      break;
    case "null":
      if (value !== null) problems.push(`${path}: expected null`);
      break;
    case "string":
    case "boolean":
      if (typeof value !== schema.type) problems.push(`${path}: expected ${schema.type}`);
      break;
    case "number":
      if (typeof value !== "number" || Number.isNaN(value)) problems.push(`${path}: expected number`);
      break;
    case "integer":
      if (!Number.isInteger(value)) problems.push(`${path}: expected integer`);
      break;
    case "array":
      if (!Array.isArray(value)) {
        problems.push(`${path}: expected array`);
      } else if (schema.items) {
        value.forEach((item, i) => problems.push(...validate(schema.items!, item, `${path}[${i}]`)));
      }
      break;
    case "object": {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        problems.push(`${path}: expected object`);
        break;
      }
      const obj = value as Record<string, unknown>;
      for (const key of schema.required ?? []) {
        if (!(key in obj)) problems.push(`${path}.${key}: required`);
      }
      for (const [key, sub] of Object.entries(schema.properties ?? {})) {
        if (key in obj) problems.push(...validate(sub, obj[key], `${path}.${key}`));
      }
      break;
    }
  }

  return problems;
}

/** Pulls a JSON value out of model output, tolerating ``` fences and surrounding prose. */
export function extractJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const body = (fenced?.[1] ?? text).trim();
  try {
    return JSON.parse(body);
  } catch {
    const start = body.search(/[{[]/);
    const end = Math.max(body.lastIndexOf("}"), body.lastIndexOf("]"));
    if (start === -1 || end <= start) throw new SyntaxError("No JSON found in model output");
    return JSON.parse(body.slice(start, end + 1));
  }
}
