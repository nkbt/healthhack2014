var Zen = require('./zen');

function Genome(input) {
  return Zen.start(input)
    .then(Sequencing())
    .then(BCL())
    .then(PostBCL())
    .then(CheckPoint());
}

function Sequencing() { return Zen.mkTask('Sequencing'); }
function BCL() { return Zen.mkTask('BCL'); }

function PostBCL() {
  return Zen.mkNestedTask('PostBCL',
    [Alignment(), Read(1), Read(2)]);
}
function Read(n) { return Zen.mkTask('FastQC-R' + n); }

function Alignment() {
  return Zen.mkNestedTask('Alignment',
    [WgsMetrics(), HsMetrics(), QProfile(), NovaSort()]);
}
function WgsMetrics() { return Zen.mkTask('WgsMetrics', function() {}); }
function HsMetrics() { return Zen.mkTask('HsMetrics'); }
function QProfile() { return Zen.mkTask('QProfile'); }
function NovaSort() { return Zen.mkTask('NovaSort', function() { throw 'blah'; }); }

function CheckPoint() {
  return Zen.mkTask('CheckPoint');
}

Zen.run(Genome, 'blah').then(
  function(result) {
    console.log('Success:', JSON.stringify(result));
  },
  function(err) {
    console.log('Fail:', err);
  });

// console.log(JSON.stringify(Zen.schema(Genome)));