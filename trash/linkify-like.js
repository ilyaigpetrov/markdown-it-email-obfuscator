'use strict';

const arrayReplaceAt = require('markdown-it/lib/common/utils').arrayReplaceAt;

const md = require('markdown-it')({
  linkify: true,
});

md.core.ruler.push('FOOBAR', (state) => {

  const blockTokens = state.tokens;
  console.log('TOKENS:', blockTokens)
  for (let j = 0, l = blockTokens.length; j < l; j++) {
    if (
      !(blockTokens[j].type === 'inline' && blockTokens[j].content.includes('@'))
    ) {
      continue;
    }
    const tokens = blockTokens[j].children;
    console.log('CHILDREN', tokens);

    const htmlLinkLevel = 0;

    for (let i = tokens.length - 1; i >= 0; --i) {

      if (tokens[i].type !== 'link_close') {
        continue;
      }
      const linkCloseToken = tokens[i];
      const linkCloseIndex = i;

      const linkOpenLevel = linkCloseToken.level + 1;
      do {
        --i;
      } while (!(tokens[i].level === linkOpenLevel && tokens[i].type === 'link_open'));
      if (!tokens[i].attrGet('href').startsWith('mailto:')) {
        continue;
      }
      const linkOpenToken = tokens[i];
      const linkOpenIndex = i;

      const emailOpenToken  = new state.Token('email_link_open', 'a', 1);
      const emailCloseToken = new state.Token('email_link_close', 'a', -1);
      ['attrs', 'level', 'markup', 'info'].forEach((prop) => {

        emailOpenToken[prop]  = linkOpenToken[prop];
        emailCloseToken[prop] = linkCloseToken[prop];
      });
      tokens[linkOpenIndex]   = emailOpenToken;
      tokens[linkCloseIndex]  = emailCloseToken;
    }
  }
});

const input = '<homer.j.simpson@example.com>';
console.log(md.render(input));
