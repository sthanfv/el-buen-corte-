const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

require('whatwg-fetch');

// Polyfill static Response.json if missing (for NextResponse.json)
if (global.Response && !global.Response.json) {
  global.Response.json = (data, init) => {
    return new global.Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  };
}

require('@testing-library/jest-dom');
