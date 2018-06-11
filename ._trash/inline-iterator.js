'use strict';

// In the final result of this plugin email is encoded to entities and then `htmlEscape`d!

md.use(inlineIterator, 'email_obfuscator', 'link_open', function (tokens, idx) {

  const textToken = tokens[idx + 1];
  const linkToken = tokens[idx];
  const href = linkToken.attrGet('href');
  // Make sure link contains only text
  if ((tokens[idx + 2].type !== 'link_close') ||
      (textToken.type !== 'text') ||
      !href.startsWith('mailto:')) {
    return;
  }
  const toEntities = (str) => str.split('')
    .map((ch) => `&#${ch.charCodeAt(0)};`)
    .join('');

  linkToken.attrSet('href', href.replace(
    /^mailto:(.+)/,
    (whole, group) => `mailto:${ toEntities(group) }`)
  );
  textToken.content = textToken.content.replace(/./gim, toEntities);

};
