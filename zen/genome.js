var Zen = require('./zen').Zen;

function dummy(data, resolve, reject) {
  setTimeout(function() {
    if (Math.random() > 0.9) {
      reject('failed');
    } else {
      resolve('bing!');
    }
  }, 500);
}

function Sequencing() { return Zen.mkTask('Sequencing', dummy); }
function BCL() { return Zen.mkTask('BCL', dummy); }

function PostBCL() {
  return Zen.all([Alignment(), Read(1), Read(2)]);
}
function Read(n) { return Zen.mkTask('FastQC-R' + n, dummy); }

function Alignment() {
  return Zen.all([WgsMetrics(), HsMetrics(), QProfile(), NovaSort()]);
}
function WgsMetrics() { return Zen.mkTask('WgsMetrics', dummy); }
function HsMetrics() { return Zen.mkTask('HsMetrics', dummy); }
function QProfile() { return Zen.mkTask('QProfile', dummy); }
function NovaSort() { return Zen.mkTask('NovaSort', dummy); }

function CheckPoint() {
  return Zen.mkTask('CheckPoint');
}

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
