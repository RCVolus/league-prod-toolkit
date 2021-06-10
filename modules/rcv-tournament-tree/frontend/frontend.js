function addCss(fileName) {

  var head = document.head;
  var link = document.createElement("link");

  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = fileName;

  head.appendChild(link);
}

addCss('/pages/op-rcv-tournament-tree/style/tournament_tree_op.css');
addCss('https://use.typekit.net/anc5qxp.css');

$('#embed-copy').val(`${location.href}/tournament_tree-gfx.html`);