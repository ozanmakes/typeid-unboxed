import { describe, expect, it } from "@jest/globals";

import {
  typeid,
  parseTypeID,
  toUUID,
  fromUUID,
  fromString,
  getType,
} from "../src/typeid";
import validJson from "./valid";
import invalidJson from "./invalid";

describe("TypeID Functions", () => {
  describe("typeid", () => {
    it("should create a TypeID string", () => {
      const prefix = "test";
      const suffix = "00041061050r3gg28a1c60t3gf";

      const id = typeid(prefix, suffix);
      expect(typeof id).toBe("string");
      const { prefix: idPrefix, suffix: idSuffix } = parseTypeID(id);
      expect(idPrefix).toEqual(prefix);
      expect(idSuffix).toEqual(suffix);
    });

    it("should generate a suffix when none is provided", () => {
      const prefix = "test";

      const id = typeid(prefix);
      expect(typeof id).toBe("string");
      const { suffix: idSuffix } = parseTypeID(id);
      expect(idSuffix).toHaveLength(26);
    });

    it("should throw an error if prefix is not lowercase", () => {
      expect(() => {
        typeid("TEST", "00041061050r3gg28a1c60t3gf");
      }).toThrowError("Invalid prefix. Must be at most 63 ascii letters [a-z]");

      expect(() => {
        typeid("  ", "00041061050r3gg28a1c60t3gf");
      }).toThrowError("Invalid prefix. Must be at most 63 ascii letters [a-z]");
    });

    it("should throw an error if suffix length is not 26", () => {
      expect(() => {
        typeid("test", "abc");
      }).toThrowError(
        "Invalid length. Suffix should have 26 characters, got 3"
      );
    });
  });

  describe("parseTypeID", () => {
    it("should parse TypeID from a string without prefix", () => {
      const str = "00041061050r3gg28a1c60t3gf";
      const { prefix, suffix } = parseTypeID(fromString(str));

      expect(suffix).toBe(str);
      expect(prefix).toBe("");
    });

    it("should parse TypeID from a string with prefix", () => {
      const str = "prefix_00041061050r3gg28a1c60t3gf";
      const { prefix, suffix } = parseTypeID(fromString(str));

      expect(suffix).toBe("00041061050r3gg28a1c60t3gf");
      expect(prefix).toBe("prefix");
    });

    it("should throw an error for invalid TypeID string", () => {
      const invalidStr = "invalid_string_with_underscore";

      expect(() => {
        fromString(invalidStr);
      }).toThrowError(new Error(`Invalid TypeID format: ${invalidStr}`));
    });
  });

  describe("fromUUID", () => {
    it("should construct TypeID from a UUID string without prefix", () => {
      const uuid = "01889c89-df6b-7f1c-a388-91396ec314bc";
      const id = fromUUID(uuid);
      expect(typeof id).toBe("string");
      expect(toUUID(id)).toBe(uuid);
    });

    it("should construct TypeID from a UUID string with prefix", () => {
      const uuid = "01889c89-df6b-7f1c-a388-91396ec314bc";
      const id = fromUUID(uuid, "prefix");
      expect(typeof id).toBe("string");
      expect(getType(id)).toBe("prefix");
      expect(toUUID(id)).toBe(uuid);
    });
  });

  describe("spec", () => {
    validJson.forEach((testcase) => {
      it(`parses string from valid case: ${testcase.name}`, () => {
        const tid = fromString(testcase.typeid, testcase.prefix);
        expect(getType(tid)).toBe(testcase.prefix);
        expect(tid.toString()).toBe(testcase.typeid);
        expect(toUUID(tid)).toBe(testcase.uuid);
      });

      it(`encodes uuid from valid case: ${testcase.name}`, () => {
        const tid = fromUUID(testcase.uuid, testcase.prefix);
        expect(getType(tid)).toBe(testcase.prefix);
        expect(tid.toString()).toBe(testcase.typeid);
        expect(toUUID(tid)).toBe(testcase.uuid);
      });
    });

    invalidJson.forEach((testcase: { name: string; typeid: string }) => {
      it(`errors on invalid case: ${testcase.name}`, () => {
        expect(() => {
          fromString(testcase.typeid);
        }).toThrowError();
      });
    });
  });
});
