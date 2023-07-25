const { JSDOM } = require("jsdom");
const fs = require("fs");
const src = fs.readFileSync("src/bala.js", "utf-8");

describe('bala', () => {
  let bala;
  let window;
  
  beforeEach(() => {
    window = (new JSDOM('', { runScripts: 'dangerously' })).window;
    window.eval(src);
    bala = window.bala;
  });

  test('load should add scripts to loadingScripts', () => {
    const scripts = {script1: 'url1', script2: 'url2'};
    bala.load(scripts, () => {});
    expect(Object.keys(bala.loadingScripts)).toEqual(['script1', 'script2']);
  });

  // Add more tests as needed...
});
