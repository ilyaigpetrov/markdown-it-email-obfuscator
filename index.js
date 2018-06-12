'use strict';

const escapeHtml = require('markdown-it/lib/common/utils').escapeHtml;
const EMAIL_RE = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;

module.exports = (md, opts) => {

  md.inline.ruler.before('autolink', 'email_autolink', (state, silent) => {

    const pos = state.pos;
    if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

    const tail = state.src.slice(pos);

    if (!tail.includes('@') || !tail.includes('>')) { return false; }

    const emailMatch = tail.match(EMAIL_RE);
    if (emailMatch === null) {
      return false;
    }

    const url = emailMatch[1]; // First matching group.
    const fullUrl = state.md.normalizeLink('mailto:' + url);
    if (!state.md.validateLink(fullUrl)) { return false; }

    if (!silent) {
      let token     = state.push('email_open', 'a', 1);
      token.attrs   = [ [ 'href', fullUrl ] ];
      token.markup  = 'autolink';
      token.info    = 'auto';

      token         = state.push('email_text', '', 0);
      token.content = state.md.normalizeLinkText(url);

      token         = state.push('email_close', 'a', -1);
      token.markup  = 'autolink';
      token.info    = 'auto';
    }

    state.pos += emailMatch[0].length;
    return true;

  });

  const toEntities = (str) => str.split('')
    .map((ch) => `&#${ch.charCodeAt(0)};`)
    .join('');

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

};
