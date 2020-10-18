// // Import Famo.us dependencies
var Engine = famous.core.Engine;
var Modifier = famous.core.Modifier;
var Transform = famous.core.Transform;
var Surface = famous.core.Surface;

// // USER INTERFACE SETUP
var drawCursor = function() {
  
  var mainContext = Engine.createContext();

    // Draw the cursor
  var cursorSurface = new Surface({
    size : [CURSORSIZE, CURSORSIZE],
    properties : {
        backgroundColor: 'red',
        borderRadius: CURSORSIZE/2 + 'px',
        pointerEvents : 'none',
        zIndex: 1
    }
  });
  var cursorModifier = new Modifier({
    transform : function(){
      var cursorPosition = this.getScreenPosition();
      return Transform.translate(cursorPosition[0], cursorPosition[1], 0);
    }.bind(cursor)
  });
  mainContext.add(cursorModifier).add(cursorSurface);

};







