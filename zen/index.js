var Zen = require('./zen');

function Genome(input) {
  return Zen.start(input)
    .then(Sequencing())
    .then(BCL())
    .then(PostBCL());
}

function Sequencing() { return Zen.mkTask('Sequencing'); }
function BCL() { return Zen.mkTask('BCL'); }
function PostBCL() {
  function Read(n) { return Zen.mkTask('FastQC-R' + n); }
  return Zen.mkNestedTask('PostBCL',
    [Alignment(), Read(1), Read(2)]);
}
function Alignment() {
  function WgsMetrics() { return Zen.mkTask('WgsMetrics'); }
  function HsMetrics() { return Zen.mkTask('HsMetrics'); }
  function QProfile() { return Zen.mkTask('QProfile'); }
  function NovaSort() { return Zen.mkTask('NovaSort'); }

  return Zen.mkNestedTask('Alignment',
    [WgsMetrics(), HsMetrics(), QProfile(), NovaSort()]);
}

Zen.run(Genome, 'data').then(function(result) {
  console.log('Success:', JSON.stringify(result));
}, function(err) {
  console.err('Fail:', result);
});

// console.log(JSON.stringify(Zen.schema(Genome)));