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

## Commands

There are the following two sets of commands for jumping to the start and end of bracket pairs. One for jumping to the next bracket anywhere and the other for jumping to the next bracket on the current line.

- **`Jump to bracket pair start`**: `bracketcontext.jumpBracketStart`
- **`Jump to bracket pair end`**: `bracketcontext.jumpBracketEnd`

- **`Jump to bracket pair start on line`**: `bracketcontext.jumpBracketLineStart`
- **`Jump to bracket pair end on line`**: `bracketcontext.jumpBracketLineEnd`

These commands will by default jump to the nearest bracket that was defined in `bracketcontext.brackets`. You can overide this by passing an argument `characters` that is a list of two string that define the opening and closing characters.

## Contexts

[When clause contexts](https://code.visualstudio.com/api/references/when-clause-contexts) can be used inside shortcuts, among other things, to only activate the shortcut when the context is true.

This extension adds two groups of contexts that are true when the cursor is currently between a pair of brackets.
They follow the following syntax where `bracketTypeHere` is a bracket name defined in `bracketcontext.brackets`:

- `bracketcontext.insideBrackets.bracketTypeHere`
- `bracketcontext.insideBracketsLine.bracketTypeHere`
  These contexts `insideBracketsLine` are only true when the bracket lies on the same line as the cursor.

It also adds a context for detecting the cursor position relative to the whitespace:

- `bracketcontext.cursorWhitespaceToLeft`
  This context is true when theres only whitespace to the left of the cursor.
  The most common usage for this would be to detect when the cursor is at the indentation of the line.

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

### 0.0.1

Initial release of this extension

### 0.0.5

- Added support for detecting regexes and excluding the from the bracket search.
- Added support for only jumping to bracket on same line.
