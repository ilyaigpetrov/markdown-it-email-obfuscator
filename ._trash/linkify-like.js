'use strict';

const escapeHtml = require('markdown-it/lib/common/utils').escapeHtml;
const arrayReplaceAt = require('markdown-it/lib/common/utils').arrayReplaceAt ;

const toEntities = (str) => str.split('')
  .map((ch) => `&#${ch.charCodeAt(0)};`)
  .join('');

const md = require('markdown-it')({
  linkify: true,
});

md.core.ruler.push('FOOBAR', (state) => {

  const blockTokens = state.tokens;
  for (let j = 0, l = blockTokens.length; j < l; j++) {
    if (
      !(blockTokens[j].type === 'inline' && blockTokens[j].content.includes('@'))
    ) {
      continue;
    }
    const tokens = blockTokens[j].children;
    console.log(tokens);

    const htmlLinkLevel = 0;

    for (let i = tokens.length - 1; i >= 0; --i) {

      if (tokens[i].type !== 'link_close') {
        continue;
      }
      const linkCloseToken = tokens[i];
      const linkCloseIndex = i;

      const linkTextTokens = [];
      do {
        --i;
        if (tokens[i].type === 'text') {
          linkTextTokens.push(tokens[i]);
        }
      } while (!(
        tokens[i].level === linkCloseToken.level
        && tokens[i].type === 'link_open'
      ));

      const href = tokens[i].attrGet('href');
      if (!href.startsWith('mailto:')) {
        continue;
      }
      const linkOpenToken = tokens[i];
      const linkOpenIndex = i;

      const emailAddr = href.replace(/^mailto:/, '');

      linkTextTokens.forEach((textToken) => {

        textToken.type = 'email_text';

      });

      const emailOpenToken  = new state.Token('email_open', 'a', 1);
      const emailCloseToken = new state.Token('email_close', 'a', -1);
      ['attrs', 'level', 'markup', 'info'].forEach((prop) => {

        emailOpenToken[prop]  = linkOpenToken[prop];
        emailCloseToken[prop] = linkCloseToken[prop];
      });
      tokens[linkOpenIndex]   = emailOpenToken;
      tokens[linkCloseIndex]  = emailCloseToken;
    }
  }
});

// RENDERER

const renderEmailAttrs = function renderEmailAttrs(token) {

  if (!token.attrs) { return ''; }

  let result = '';

  for (let i = 0, l = token.attrs.length; i < l; i++) {
    const prop  = token.attrs[i][0];
    const value = token.attrs[i][1];
    result += ' ' + escapeHtml(prop) + '="' + (prop === 'href' ? value : escapeHtml(value)) + '"';
  }

  return result;
};

md.renderer.rules.email_open = function emailOpen(tokens, idx, options, env, self) {

  const linkToken = tokens[idx];
  const href = linkToken.attrGet('href');

  linkToken.attrSet('href', href.replace(
    /^mailto:(.+)/,
    (whole, group) => `mailto:${ toEntities(group) }`)
  );

  return '<a' + renderEmailAttrs(tokens[idx]) + '>';

};

md.renderer.rules.email_text = function emailText(tokens, idx, options, env, self) {

  const textToken = tokens[idx];
  return textToken.content.replace(/./gim, toEntities);

};

let input;

console.log('1-----------------------------------');
input = 'AA homer.j.simpson@example.com BB';
console.log(md.render(input));

console.log('2-----------------------------------');
input = '[AA homer.j.simpson@example.com BB](mailto:homer.j.simpson@example.com)';
console.log(md.render(input));
