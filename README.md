# typeid-unboxed

### An alternative TypeScript implementation of [TypeIDs](https://github.com/jetpack-io/typeid), using strings for runtime representation.

TypeIDs are modern, **type-safe**, globally unique identifiers based on the upcoming
UUIDv7 standard. They offer numerous advantages, making them an excellent choice for
primary identifiers in databases, APIs, and distributed systems. Learn more about TypeIDs in their [spec](https://github.com/jetpack-io/typeid).

This package, `typeid-unboxed`, is an alternative implementation of the original TypeID concept by [jetpack.io](https://jetpack.io), which uses class instances at runtime. In contrast, `typeid-unboxed` utilizes strings in runtime while achieving type safety through branded types, offering a lightweight and flexible approach that does not require serialization and de-serialization steps.

Forked from the official [TypeID-JS package](https://github.com/jetpack-io/typeid-js), this version is tailored for TypeScript projects that prefer a string-based representation.

# Installation

Using npm:

# Installation

Using npm:

```bash
npm install typeid-unboxed
```

Using yarn:

```bash
yarn add typeid-unboxed
```

Using pnpm:

```bash
pnpm add typeid-unboxed
```

``

# Usage

To create a random TypeID of a given type, use the `typeid()` function:

```typescript
import { typeid } from "typeid-unboxed";
const tid = typeid("prefix");
```

The prefix is optional, so if you need to create an id without a type prefix, you
can do that too:

```typescript
import { typeid } from "typeid-unboxed";
const tid = typeid();
```

The return type of `typeid("prefix")` is `TypeID<"prefix">`, which lets you use
TypeScript's type checking to ensure you are passing the correct type prefix to
functions that expect it.

For example, you can create a function that only accepts TypeIDs of type `user`:

```typescript
import { typeid, TypeID } from "typeid-unboxed";

function doSomethingWithUserID(id: TypeID<"user">) {
  // ...
}
```

In addition to the `typeid()` function, the `TypeID` class has additional methods
to encode/decode from other formats.

For example, to parse an existing typeid from a string:

```typescript
import { fromString } from "typeid-unboxed";

// The second argument is optional, but it converts to type TypeID<"prefix"> instead
// of TypeID<string>
const tid = fromString("prefix_00041061050r3gg28a1c60t3gf", "prefix");
```

To encode an existing UUID as a TypeID:

```typescript
import { fromUUID } from "typeid-unboxed";

// In this case TypeID<"prefix"> is inferred from the second argument
const tid = fromUUID("00000000-0000-0000-0000-000000000000", "prefix");
```

The full list of exported functions includes:

- `typeid(prefix?, suffix?)`: Creates a TypeID with an optional prefix and suffix.
- `fromString(typeId, prefix?)`: Parses a TypeID from a string, optionally validating against a provided prefix.
- `parseTypeID(typeId)`: Parses a TypeID string into its prefix and suffix components.
- `getType(typeId)`: Retrieves the prefix from a TypeID.
- `getSuffix(typeId)`: Retrieves the suffix from a TypeID.
- `isTypeID(value)`: Checks if a given string is a valid TypeID format.
- `toUUID(typeId)`: Decodes the TypeID into a UUID string in hex format. The type prefix is ignored.
- `toUUIDBytes(typeId)`: Decodes the TypeID into a UUID byte array. The type prefix is ignored.
- `fromUUID(uuid, prefix?)`: Creates a TypeID from a UUID in hex format, with an optional prefix.
- `fromUUIDBytes(prefix, bytes)`: Creates a TypeID from a prefix and a UUID in byte array format.
