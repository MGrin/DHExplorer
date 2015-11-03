/**
 * Graph viewmodel
 * Handling all processes needed to visualise elements related to Graph
 *
 * Created by Nikita Grishin on 08.2015
 */
'use strict';

(function (app) {
  var scope = app.views.Graph = {};

  scope.listeners = {};
  scope.registerListener = function (event, fn) {
    if (!scope.listeners[event]) scope.listeners[event] = [];
    scope.listeners[event].push(fn);
  };
  scope.emit = function (event, data) {
    if (!scope.listeners[event]) return;
    for (var i = 0; i < scope.listeners[event].length; i++) {
      scope.listeners[event][i](data);
    }
  };

  scope.init = function (params) {
    // rendering the graph information element
    scope.information = ReactDOM.render(
      <app.React.GraphInformation />,
      $('#graph-container .graph-settings .statistics-wrapper').get(0)
    );
    // Setting up the timerange slider
    $('.rangeSlider[slide-on="years"]').ionRangeSlider({
      min: params.min,
      max: params.max,
      from: params.from,
      to: params.to
    });
    $('.graph-settings form').submit(function (e) {
      e.preventDefault();

      var range = $('.rangeSlider[slide-on="years"]').data('ionRangeSlider').result;

      var minYear = range.from;
      var maxYear = range.to;

      scope.emit('onTimeRangeUpdate', {minYear: minYear, maxYear: maxYear});
    });

    // Pause-Play button
    $('.graph-pause-play').click(function (e) {
      e.preventDefault();
      scope.togglePausePlay();
    });

    scope.optionsAreVisibile = true;
    $('.settings-visibility-toggle').click(function () {
      if (!scope.optionsAreVisibile) {
        $('.graph-settings form .field').css('display', 'block');
        $('.statistics-wrapper').css('display', 'block');
        $('.settings-visibility-toggle .text').text('Hide settings');

      } else {
        $('.settings-visibility-toggle .text').text('Show settings');
      }

      $('.graph-settings').transition('fade left', function () {
        $('.graph-settings').removeClass('left aligned');
        $('.graph-settings').addClass('left aligned');

        if (scope.optionsAreVisibile) {
          $('.graph-settings form .field').css('display', 'none');
          $('.statistics-wrapper').css('display', 'none');
        }

        scope.optionsAreVisibile = !scope.optionsAreVisibile;
      });
    });
  };

  // Called on window resize in order to resize canvas
  scope.resizeCanvas = function () {
    $('.webgl-wrapper canvas').animate({width: $('.webgl-wrapper').width()}, 500);
  };
  // TODO does not work =(
  // $(window).resize(scope.resizeCanvas);

  scope.togglePausePlay = function () {
    if (scope.paused) {
      scope.renderer.resume();
      $('.graph-pause-play').find('i').each(function () {
        $(this).removeClass('play').addClass('pause');
      });
    } else {
      scope.renderer.pause();
      $('.graph-pause-play').find('i').each(function () {
        $(this).removeClass('pause').addClass('play');
      });
    }
    scope.paused = !scope.paused;
  };

  scope.pause = function () {
    if (scope.renderer && !scope.paused) {
      scope.renderer.pause();
      scope.paused = true;
    }
  };

  scope.resume = function () {
    if (scope.renderer && scope.paused) {
      scope.renderer.resume();
      scope.paused = false;
    }
  };

  scope.onModalHide = function () {
    if (!scope.pauseStatus) return scope.togglePausePlay();
    scope.resume();
    scope.pause();
  };

  scope.render = function () {
    scope.graphics = Viva.Graph.View.webglGraphics(); // Creating Viva graphics

    scope.events = Viva.Graph.webglInputEvents(scope.graphics, scope.graph);
    scope.events.mouseDown(function () {
      scope.startClick = Date.now();
    });

    scope.events.click(function (node) {
      if (Date.now() - scope.startClick > 250) return;

      scope.lastClickedNode = node;
      scope.emit('onNodeClick', node.data);
      if (!scope.paused) {
        scope.pauseStatus = false;
        setTimeout(scope.togglePausePlay, 1);
      } else {
        scope.pauseStatus = true;
        scope.resume();
        scope.pause();
      }
    });

    // A shader used to render each node
    scope.NodeShader = new app.WebGL.NodeShader();
    scope.graphics.setNodeProgram(scope.NodeShader);

    scope.graphics.node(function (node) {
      return new app.WebGL.models.Circle(node);
    });

    // General graph layoout
    scope.layout = Viva.Graph.Layout.forceDirected(scope.graph, {
      springLength: 30,
      springCoeff: 0.0008,
      gravity: -1,
      theta: 0.8,
      dragCoeff: 0.02,
      timeStep: 20
    });

    scope.renderer = Viva.Graph.View.renderer(scope.graph, {
      container: $('#graph-container .webgl-wrapper').get(0),
      graphics: scope.graphics,
      layout: scope.layout,
      preserveDrawingBuffer: true
    });

    scope.paused = false;
    scope.renderer.run();
  };

  scope.update = function (nodes, edges) {
    if (scope.renderer) scope.renderer.dispose();
    scope.graph = Viva.Graph.graph();
    var i;

    for (i = 0; i < nodes.length; i++) {
      scope.graph.addNode(nodes[i].id, nodes[i]);
    }

    for (i = 0; i < edges.length; i++) {
      var source = edges[i].id.split('-')[0];
      var target = edges[i].id.split('-')[1];

      scope.graph.addLink(source, target);
    }

    scope.render();
  };

  scope.updateInformation = function (state) {
    scope.information.replaceState(state);
  };
})(window.app);
