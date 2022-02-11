# Bracket Context

This visual studio code extension adds new contexts that specify if the cursor is currently inside a pair of brackets.
These contexts can then be used in shortcut when clauses.

## Features

This extension adds the following features:

-   Shortcut contexts for when the cursor is in between a pair of brackets.
-   The ability to customize and define new bracket types.

> **Note:** This extension doesn't add any new commands or shortcuts. It only adds new contexts which you can use when creating new shortcuts.

## Extension Settings

### Bracket types

`bracketcontext.brackets`: The list of defined bracket types.

A bracket type defines two characters which define the bracket types and a name which is used for the context names.

It should contain two properties:

-   `characters`: A list of two single character strings.
-   `name`: A string.

---

## Examples

An example defining a new bracket type in `settings.json`:

```json
"bracketcontext.brackets": [
    {
      "characters": ["(", ")"],
      "name": "round"
    }
]
```

You could then use the context in a shortcut, adding the following to `keybinding.json`:

_This shortcut will only activate when the cursor is in between a pair of round brackets `()`_

```json
{
    "key": "a_key",
    "command": "a_command",
    "when": "textInputFocus && bracketcontext.bracket.round"
}
```

## Release Notes

### 1.0.0

Initial release of this extension
