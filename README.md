# Markdown-it Email Obfuscator
## Obfuscation Example

\<homer.j.simpson@example.com> → \<a href="mailto:_obfuscated_">_obfuscated_\</a>

_obfuscated_ looks like: `&#104;&#111;&#109;&#101;&#114;&#46;&#106;&#46;&#115;&#105;&#109;&#112;&#115;&#111;&#110;&#64;&#101;&#120;&#97;&#109;&#112;&#108;&#101;&#46;&#99;&#111;&#109;`

## Install

`npm install --save markdown-it-email-obfuscator`

## Use

```js
'use strict';

const md = require('markdown-it')()
  .use(require('markdown-it-email-obfuscator'));

const input = 'AA<homer.j.simpson@example.com>BB';
console.log(md.render(input));
```
## License

[GNU GPL](./LICENSE).  
Contact me if you need a diffrent license.
