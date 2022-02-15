# Bracket Context

This visual studio code extension adds new contexts that specify if the cursor is currently inside a pair of brackets.
These contexts can then be used in shortcut when clauses.

## Features

This extension adds the following features:

- Shortcut contexts for when the cursor is in between a pair of brackets.
- The ability to customize and define new bracket types.
- Commands for jumping to start and end of pairs of brackets.
- A shortcut context for when the cursor is at the start of a new line, with only whitespace in front of it.

> **Note:** This extension doesn't add any shortcuts. It only adds new contexts and commands which you can use to create new shortcuts.

## Extension Settings

### Bracket Types

`bracketcontext.brackets`: The list of defined bracket types.

A bracket type defines two characters which define the bracket types and a name which is used for the context names.

It should contain two properties:

- `characters`: A list of two single character strings.
- `name`: A string.

Defaults to:

```json
{
  "bracketcontext.brackets": [
    {
      "characters": ["(", ")"],
      "name": "round"
    },
    {
      "characters": ["[", "]"],
      "name": "square"
    },
    {
      "characters": ["{", "}"],
      "name": "curly"
    }
  ]
}
```

### Comment Strings

You need to define what strings define comments for this extension to function properly.
Otherwise brackets inside comments will be considered as part of your code.

Two settings are required for the definition of comments:

`bracketcontext.lineComments`: A list of strings/characters which are in front of line comments (Comments that are on a single line).

Defaults to:

```json
{ "bracketcontext.lineComments": ["//", "#"] }
```

`bracketcontext.blockComments`: A list of the strings pairs which surround block comments (Comments that can span multiple lines).

Defaults to:

```json
{ "bracketcontext.blockComments": [["/*", "*/"]] }
```

### String Delimiters

It is also necessary to define the string delimiters, for the extension to function properly.
Otherwise brackets inside strings will be considered as part of your code.

This is defined with a single setting:

`bracketcontext.stringDelimiters`: A list of the delimiters that surround strings.

Defaults to:

```json
{ "bracketcontext.stringDelimiters": ["\"", "'", "`"] }
```

---

## Examples

### Adding A New Bracket Context

An example defining a new bracket type in `settings.json`:

```json
{
  "bracketcontext.brackets": [
    {
      "characters": ["(", ")"],
      "name": "round"
    }
  ]
}
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

### Adding Jump To Bracket Shortcuts

A new shortcut which moves the cursor to the end and start of the current round `()` bracket pair.
Add the following to `keybinding.json`:

```json
{
  "key": "pageup",
  "command": "bracketcontext.jumpBracketStart",
  "args": {
    "characters": ["(", ")"]
  },
  "when": "editorTextFocus"
},
{
  "key": "pagedown",
  "command": "bracketcontext.jumpBracketEnd",
  "args": {
    "characters": ["(", ")"]
  },
  "when": "editorTextFocus"
}
```

### Add Jump On Tab Shortcuts

This shortcut jumps to the end of the current round `()` bracket pair, _only_ if the cursor is not at the start of the line.
This allows the user to still tab to the correct indentation, but also tab to the end the current bracket.

Add the following to `keybinding.json`:

```json
{
  "key": "tab",
  "command": "bracketcontext.jumpBracketEnd",
  "args": { "characters": ["(", ")"] },
  "when": "editorTextFocus && bracketcontext.bracket.round && !bracketcontext.cursorWhitespaceToLeft && !acceptSuggestionOnEnter"
}
```

## Release Notes

### 1.0.0

Initial release of this extension
