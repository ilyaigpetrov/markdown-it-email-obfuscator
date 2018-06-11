'use strict';

const mdEmailObfuscator = require('.');

const md = require('markdown-it')({
  linkify: true,
}).use(mdEmailObfuscator);

const input = 'AA<homer.j.simpson@example.com>BB';
console.log(md.render(input));
