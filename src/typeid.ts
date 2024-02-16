import { uuidv7obj, UUID } from "uuidv7";
import { parseUUID } from "./parse_uuid";
import { encode, decode } from "./base32";

export type TypeID<T> = string & { __type: T };

function isValidPrefix(str: string): boolean {
  if (str.length > 63) {
    return false;
  }

  let code;
  let i;
  let len;

  for (i = 0, len = str.length; i < len; i += 1) {
    code = str.charCodeAt(i);
    if (!(code > 96 && code < 123)) {
      // lower alpha (a-z)
      return false;
    }
  }
  return true;
}

export function typeid<T extends string>(
  prefix: T = "" as T,
  suffix: string = "",
): TypeID<T> {
  if (!isValidPrefix(prefix)) {
    throw new Error("Invalid prefix. Must be at most 63 ascii letters [a-z]");
  }

  let finalSuffix: string;
  if (suffix) {
    finalSuffix = suffix;
  } else {
    const uuid = uuidv7obj();
    finalSuffix = encode(uuid.bytes);
  }

  if (finalSuffix.length !== 26) {
    throw new Error(
      `Invalid length. Suffix should have 26 characters, got ${finalSuffix.length}`,
    );
  }

  if (finalSuffix[0] > "7") {
    throw new Error(
      "Invalid suffix. First character must be in the range [0-7]",
    );
  }

  // Validate the suffix by decoding it. If it's invalid, an error will be thrown.
  decode(finalSuffix);

  if (prefix === "") {
    return finalSuffix as TypeID<T>;
  } else {
    return `${prefix}_${finalSuffix}` as TypeID<T>;
  }
}

/**
 * Constructs a TypeID from a string representation, optionally validating against a provided prefix.
 * This function splits the input `typeId` string by an underscore `_` to separate the prefix and suffix.
 * If the `typeId` contains no underscore, it is assumed to be a suffix with an empty prefix.
 * If a `prefix` is provided, it must match the prefix part of the `typeId`, or an error is thrown.
 *
 * @param {string} typeId - The string representation of the TypeID to be parsed.
 * @param {T} [prefix] - An optional prefix to validate against the prefix in the `typeId`.
 * @returns {TypeID<T>} A new TypeID instance constructed from the parsed `typeId`.
 * @throws {Error} If the `typeId` format is invalid, the prefix is empty when there's a separator,
 *                 or there's a prefix mismatch when a `prefix` is provided.
 * @template T - A string literal type that extends string.
 */
export function fromString<T extends string>(
  typeId: string,
  prefix?: T,
): TypeID<T> {
  const parts = typeId.split("_");

  if (parts.length === 1) {
    return typeid("" as T, parts[0]);
  } else if (parts.length === 2) {
    if (parts[0] === "") {
      throw new Error(
        `Invalid TypeID. Prefix cannot be empty when there's a separator: ${typeId}`,
      );
    }

    if (prefix && parts[0] !== prefix) {
      throw new Error(
        `Invalid TypeID. Prefix mismatch. Expected ${prefix}, got ${parts[0]}`,
      );
    }

    return typeid(parts[0] as T, parts[1]);
  } else {
    throw new Error(`Invalid TypeID format: ${typeId}`);
  }
}

/**
 * Parses a TypeID string into its prefix and suffix components.
 *
 * @param {TypeID<T>} typeId - The TypeID string to parse.
 * @returns {{ prefix: T; suffix: string }} An object containing the prefix and suffix of the TypeID.
 * @throws {Error} If the TypeID format is invalid (not exactly two parts separated by an underscore).
 *
 * @example
 * // For a valid TypeID 'example_00041061050r3gg28a1c60t3gf'
 * const { prefix, suffix } = parseTypeID('example_00041061050r3gg28a1c60t3gf');
 * console.log(prefix); // 'example'
 * console.log(suffix); // '00041061050r3gg28a1c60t3gf'
 *
 * @example
 * // Throws an error for invalid TypeID format
 * try {
 *   parseTypeID('invalidTypeID');
 * } catch (error) {
 *   console.error(error.message); // 'Invalid TypeID format: invalidTypeID'
 * }
 */
export function parseTypeID<T extends string>(
  typeId: TypeID<T>,
): { prefix: T; suffix: string } {
  return { prefix: getType(typeId), suffix: getSuffix(typeId) };
}

/**
 * Retrieves the prefix from a TypeID.
 *
 * @param {TypeID<T>} typeId - The TypeID from which to extract the prefix.
 * @returns {T} The prefix of the TypeID.
 */
export function getType<T extends string>(typeId: TypeID<T>): T {
  const underscoreIndex = typeId.indexOf("_");
  if (underscoreIndex === -1) {
    return "" as T;
  }
  return typeId.substring(0, underscoreIndex) as T;
}

/**
 * Retrieves the suffix from a TypeID.
 *
 * @param {TypeID<T>} typeId - The TypeID from which to extract the suffix.
 * @returns {string} The suffix of the TypeID.
 */
export function getSuffix<T extends string>(typeId: TypeID<T>): string {
  const underscoreIndex = typeId.indexOf("_");
  if (underscoreIndex === -1) {
    return typeId;
  }
  return typeId.substring(underscoreIndex + 1);
}

export function isTypeID<T extends string>(value: string): value is TypeID<T> {
  return /^[a-z]{1,63}_[0-7][0-9a-v]{25}$/.test(value);
}

export function toUUIDBytes<T extends string>(typeId: TypeID<T>): Uint8Array {
  return decode(getSuffix(typeId));
}

export function toUUID<T extends string>(typeId: TypeID<T>) {
  const uuidBytes = toUUIDBytes(typeId);
  const uuid = UUID.ofInner(uuidBytes);
  return uuid.toString();
}

export function fromUUIDBytes(
  prefix: string,
  bytes: Uint8Array,
): TypeID<typeof prefix> {
  const suffix = encode(bytes);
  return prefix
    ? (`${prefix}_${suffix}` as TypeID<typeof prefix>)
    : (suffix as TypeID<typeof prefix>);
}

export function fromUUID<T extends string>(
  uuid: string,
  prefix?: T,
): TypeID<T> {
  const suffix = encode(parseUUID(uuid));
  return prefix ? (`${prefix}_${suffix}` as TypeID<T>) : (suffix as TypeID<T>);
}
