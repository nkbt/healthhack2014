
function ListCtrl(createUi, go) {
  var me = this;
  me.ui = createUi('list.html', {
    items: [],
    go: go
  });
}

ListCtrl.prototype.setItems = function(items) {
  this.ui.items = items;
};

/**
 * ctrlFactory is a function that has two arguments.
 *    one is named "route" - and will be passed the child route
 *    the other can be named anything, and will be passed the first match 
 *        of the path component regex
 */
function itemRoute(ctrlFactory) {
  return function(setCurrent, section, itemId) {
    var route = this;
    if (!itemId) {
      throw new Error("No itemId - did you forget to create a regex group for it? " + section);
    }

    var routeChild = route.child(section);

    // curry up the route argument by name
    // resulting in a factory with a single positional argument for the id
    var createCtrl = ctrlFactory.curry({route: routeChild});

    setCurrent(createCtrl(itemId));

    return routeChild;
  };
}
