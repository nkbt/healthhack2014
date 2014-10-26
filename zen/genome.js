var Zen = require('./zen').Zen;

function Sequencing() { return Zen.mkTask('Sequencing'); }
function BCL() { return Zen.mkTask('BCL', function(data, resolve, reject) {
  console.log('Running BCL');
  setTimeout(function() {
    resolve('bing!');
  }, 500);
}); }

function PostBCL() {
  return Zen.all([Alignment(), Read(1), Read(2)]);
}
function Read(n) { return Zen.mkTask('FastQC-R' + n); }

function Alignment() {
  return Zen.all([WgsMetrics(), HsMetrics(), QProfile(), NovaSort()]);
}
function WgsMetrics() { return Zen.mkTask('WgsMetrics', function() {}); }
function HsMetrics() { return Zen.mkTask('HsMetrics'); }
function QProfile() { return Zen.mkTask('QProfile'); }
function NovaSort() { return Zen.mkTask('NovaSort', function() { throw 'blah'; }); }

function CheckPoint() {
  return Zen.mkTask('CheckPoint');
}

// var zen = Genome();
// console.log(zen.run('foo'));
// console.log(zen.states);

// setTimeout(function() {
//   console.log(zen.states);
// }, 1000);

function genome(id) {
  var zen = new Zen()
    .then(Sequencing())
    .then(BCL())
    .then(PostBCL())
    .then(CheckPoint());
  zen.id = id;
  zen.name = 'Sequencing QC-' + id;
  return zen;
}

module.exports = genome;
