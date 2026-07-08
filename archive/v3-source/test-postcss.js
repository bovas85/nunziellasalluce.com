const postcss = require('postcss');
const responsiveType = require('postcss-responsive-type');

const css = `
.test1 { font-size: responsive 10px 20px; font-range: 320px 768px; }
.test2 { font-size: responsive(10px 20px); font-range: 320px 768px; }
.test3 { font-size: responsive(10px, 20px); font-range: 320px 768px; }
`;

postcss([responsiveType()]).process(css, { from: undefined }).then(result => {
  console.log(result.css);
});
