var graphics =
{
  metrics: {linewidth: 0, lineheight: 0, charwidth: 0, fullwidth: 0, fullheight: 0},
  settings: {vmargin: 0, hmargin: 0, zoomlevel: 0},  //NB: these cannot remain zero, will be set in initialize method.
  sequenceinfo: {linecount: 0},

  //editor is a two-tuple of the DOM object itself and the raphael-generated paper object.
  editor: {dom:{}, paper:{}},

  //graphics in the editor are organized by sequence line.
  lines: [],
  //a line object contains:
  //  translatey - y component of translation matrix - usually topmargin + offset 
  //  translatex - x component of translation matrix - usually leftmargin
  //  elements - raphael set element corresponding to the line.
  //  invalid - boolean, should be called on 'invalidate' call.
 
  // main graphics initialization call.
  initialize: function()
  {
    //associate with the dom object.
    graphics.editor.dom = document.getElementById("editor");
    graphics.editor.paper = Raphael("editor");

    graphics.setmetrics();

    //register the onresize() function
    window.onresize = graphics.onresize;

    //pull the settings data from the database.  This should be formatted as json.
    $.getJSON("/graphics_settings.js",function(json){graphics.settings = json;});
  },

  onresize: function()
  {
    graphics.setmetrics();
  },

  setmetrics: function()
  {
    //pull the height and width data
    graphics.metrics.fullheight = graphics.editor.dom.clientHeight;
    graphics.metrics.fullwidth = graphics.editor.dom.clientWidth;

    //register the graphics space with the Raphael engine.
    graphics.editor.paper.setSize(graphics.metrics.fullwidth, 1);
  },
}
