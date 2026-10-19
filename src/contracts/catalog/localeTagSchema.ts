// A BCP 47 language tag such as "en", "ja-Latn" or "zh-Hant-TW".
import Type from "typebox";

export const localeTagSchema = Type.String({ pattern: "^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$", maxLength: 35 });
