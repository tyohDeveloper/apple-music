// §5.2 every DATA file validates against the JSON Schema bound to it in architecture.json.
import { Ajv2020 } from "ajv/dist/2020.js";
import { globToRegExp } from "../globToRegExp.ts";
import type { Repository } from "../repository.ts";
import { violation, type Violation } from "../violation.ts";

function validateFile(repository: Repository, ajv: Ajv2020, file: string, schemaFile: string): Violation[] {
  const validate = ajv.compile(JSON.parse(repository.text(schemaFile)) as object);
  if (validate(JSON.parse(repository.text(file)))) return [];
  const detail = (validate.errors ?? []).map((error) => `${error.instancePath || "/"} ${error.message ?? ""}`).join("; ");
  return [violation("§5.2", file, `does not match ${schemaFile}: ${detail}`)];
}

export function checkData(repository: Repository): Violation[] {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const dataFiles = repository.files.filter((file) => file.startsWith("data/") && !file.startsWith("data/schemas/"));
  return dataFiles.flatMap((file) => {
    const bindings = repository.architecture.dataSchemas.filter((binding) => globToRegExp(binding.files).test(file));
    if (bindings.length !== 1) return [violation("§5.2", file, `expected one schema binding, found ${bindings.length}`)];
    return validateFile(repository, ajv, file, bindings[0]?.schema ?? "");
  });
}
