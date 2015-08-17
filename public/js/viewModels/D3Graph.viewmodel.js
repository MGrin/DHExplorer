'use strict';

(function (app) {
  var d3g = app.views.D3Graph = {};

  d3g.destroy = function () {
    d3g.layout.stop();
    delete d3g.listeners;
    delete d3g.params;
    delete d3g.layout;
    delete d3g.behaviors;
    delete d3g.svg;
    delete d3g.container;
    delete d3g.node;
    delete d3g.link;
  };

  d3g.init = function (graph, p) {
    d3g.listeners = {};

    d3g.params = p;

    d3g.layout = d3.layout.force()
                            .size([p.width, p.height])
                            .charge(p.charge)
                            .gravity(0.6)
                            .friction(p.friction)
                            .linkDistance(p.linkDistance)
                            .nodes(graph.nodes)
                            .links(graph.edges)
                            .on('tick', d3g.tick);


    d3g.behaviors = {
      zoom: d3.behavior.zoom().scaleExtent([0, 30]).on('zoom', d3g.zoom),
      drag: d3g.layout.drag()
                        .origin(function (d) {
                          return d;
                        })
                        .on('dragstart', d3g.dragstart)
                        .on('drag', d3g.drag)
    };

    d3g.svg = d3.select(p.domId)
                  .append('svg')
                  .attr('viewBox', '0 0 ' + p.width + ' ' + p.height)
                  .attr('preserveAspectRatio', 'xMidYMid meet')
                  .call(d3g.behaviors.zoom).on('dblclick.zoom', null);

    d3g.container = d3g.svg.append('g');

    d3g.node = d3g.container.selectAll('.node');
    d3g.link = d3g.container.selectAll('.link');

    return d3g;
  };

  d3g.registerListener = function (event, listener) {
    d3g.listeners[event] = listener;
  };

  d3g.tick = function () {
    d3g.link.selectAll('.edge')
              .attr('x1', function (d) {
                return d.source.x;
              }).attr('y1', function (d) {
                return d.source.y;
              }).attr('x2', function (d) {
                return d.target.x;
              }).attr('y2', function (d) {
                return d.target.y;
              }).attr('opacity', d3g.listeners.computeEdgeOpacity);

    d3g.node.selectAll('.circle')
              .attr('cx', function (d) {
                return d.x;
              }).attr('cy', function (d) {
                return d.y;
              })
              .attr('opacity', d3g.listeners.computeNodeCircleOpacity)
              .attr('fill', d3g.listeners.fillNode)
              .attr('r', d3g.listeners.computeRadius);

    d3g.node.selectAll('.label')
              .attr('x', function(d) {
                return d.x - this.getBBox().width/2;
              }).attr('y', function(d) {
                return d.y + d3g.listeners.computeRadius(d) + this.getBBox().height + 2;
              })
              .attr('opacity', d3g.listeners.computeNodeLabelOpacity)
              .text(d3g.listeners['node-label']);
  };

  d3g.zoom = function () {
    d3g.container.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
  };

  d3g.dragstart = function () {
    d3.event.sourceEvent.stopPropagation();
  };

  d3g.drag = function (d) {
    d3.select(this).attr('x', d.x = d3.event.x).attr('y', d.y = d3.event.y);
  };

  d3g.update = function () {
    d3g.layout.stop();
    d3g.link = d3g.link.data(d3g.layout.links());
    d3g.node = d3g.node.data(d3g.layout.nodes());

    var link = d3g.link.enter()
                        .append('g')
                        .attr('class', 'link');
    link.append('line').attr('class', 'edge');

    d3g.link.exit().remove();

    var node = d3g.node.enter().append('g')
                                .attr('class', 'node')
                                .call(d3g.behaviors.drag)
                                .on('click', function (node) {
                                  if (d3.event.defaultPrevented) return;

                                  if (d3.event.shiftKey) return d3g.listeners['node-shift-click'](node);
                                  return d3g.listeners['node-click'](node);
                                });
    node.append('circle')
        .attr('class', 'circle')
        .attr('r', d3g.listeners.computeRadius)
        .on('mouseenter', function (node) {
          d3.select(this).attr({
            'stroke-width' : '3px'
          });
          d3g.listeners['node-mouseenter'](node);
        })
        .on('mouseout', function (node) {
          d3.select(this).attr({
            'stroke-width' : '1px'
          });
          d3g.listeners['node-mouseout'](node);
        });

    node.append('text')
        .attr('class', 'label');

    d3g.node.exit().remove();
    d3g.layout.start();
  };
})(window.app);
