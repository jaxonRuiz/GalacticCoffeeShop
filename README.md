# GalacticCoffeeShop
cmpm 171 game


code was written while using Github Copilot

***

# Code Style Guide

## Indentation and Spacing
Indentation should be done with TABS. Formatting can be done on VS-Code using the Deno Land formatter until someone figures out precommit-hooks.

## File Organization
All files should be placed in `/src`. All global types should be put in `/src/index.d.ts`. 

#### Assets
Assets should be placed in the assets folder and imported via `img.ts` for images and `aud.ts` for audio. Assets can be named however you like as long as they are not name the same as other assets in the folder. Asset keys should be named according to naming rules (see NAMING CONVENTIONS section for more specifics).

To people who are adding assets: add an unused key to the dictionary.
Your addition to the dictionary should look something like this:
```ts
  itemGroup_imageKey_number: new URL('./path/to/file', import.meta.url).href,
```
For example, this fake asset is the 4th flower from a set of plantable plants:
```ts
  plantable_flower_4: new URL('./img/flower4.png', import.meta.url).href,
```

To people who are updating assets: if the proportions or size do not change, the asset should be integrated automatically. If the proportions or size are changed, notify the person in charge of integrating it.

To people integrating assets: please just import the `img` or `aud` object from `img.ts` and `aud.ts` respectively and use it as an asset dictionary.
#### Backend
One class should be one file with the exception of helper classes. Classes are individual game objects (multishop included). Systems are intended to drive the interactions between objects (not including multishop).

#### Frontend
Full page layouts should be in the `pages` folder while partial components should be in the `components` folder. Final game CSS is currently in `/src/shop.css` though it may be moved in the future.

All frontend files should be `.svelte` files. Reminder to use `lang="ts"` for your script tags.

#### Current File Structure
```
src
|____assets
|  |____img
|  |____aud
|____backend
|  |____classes
|  |____systems
|____frontend
|  |____pages
|  |____components
```

## Naming Conventions

Reference table below for BACKEND naming conventions

|       Thing       | Naming Convention | Prefix | Suffix |
| :---------------: | :---------------: | :----: | :----: |
| Typescript Files  |     camelCase     |        |        |
| Global Interfaces |    PascalCase     |  `I`   |        |
| Local Interfaces  |    PascalCase     |        |        |
|      Classes      |    PascalCase     |        |        |
|     Variables     |     camelCase     |        |        |
|     Writables     |     camelCase     |  `w_`  |        |
|     Functions     |     camelCase     |        |        |

Refernce table below for FRONTEND naming conventions

|          Thing          | Naming Convention |   Prefix   |    Suffix     |
| :---------------------: | :---------------: | :--------: | :-----------: |
|      Svelte Files       |    PascalCase     |            |               |
|        Variables        |     camelCase     |            |               |
| HTML classes, ids, etc. |    skewer-case    |            | `_specifier`* |
|       Asset Keys        |     camelCase     | `group_`** |    `_#`**     |
|        i18n Keys        |     camelCase     |            |   `_type`*    |

\* things marked with one star means it's variable, the word on the table is just a descriptor for what goes there, ex. `_type` could stand for `_title` where the key type is "title"

\** can be omitted for one-off or ungroups assets, mostly used to link assets

Current List of Frontend shorthands:
- `fl` HTML class name, removes margins and padding, short for "frameless"
- `btn` HTML specifier, short for button
- `dpdn` HTML class name, short for dropdown

## Code Style

#### Braces
Braces should be in K&R style at all times.
Here is an example:
```ts
while (true) {
  something++;
}
```
Do note: brackets are ommited for guard statements and 

#### Math
Mathematical, ternary, and nullish operators should have spaces between them and numbers and no spaces between them and parenthesis or brackets.
Here is an example:
```ts
while (i + 4 >= 5) {
  something++;
}
```

#### Readability
Please use piplines when possible. But when it is not possible, proritize readability over line count. DO NOT do crazy single line operations, this is not Python.

Comments should be placed above the line it is referring to UNLESS it is an afterthought / note to self (that can be placed after) or something really really short and only actually specific to one line (that can be placed inline).

Code should not exceed 80 character in width.

#### Language Style Compliance
If I can find one for Typescript, sure.
