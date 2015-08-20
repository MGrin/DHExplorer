'use strict';

(function (app) {
  var ATTRIBUTES_PER_PRIMITIVE = 4;

  var NodeShader = app.WebGL.NodeShader = function () {
    this.nodes = new Float32Array(64);
    this.nodesCount = 0;

    this.fragmentShader = [
      'precision mediump float;',
      'varying vec4 color;',

      'void main(void) {',
      '   if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) < 0.25) {',
      '     gl_FragColor = color;',
      '   } else {',
      '     gl_FragColor = vec4(0);',
      '   }',
      '}'
    ].join('\n');

    this.vertexShader = [
      'attribute vec2 a_vertexPos;',
      // Pack color and size into vector. First elemnt is color, second - size.
      // Since it's floating point we can only use 24 bit to pack colors...
      // thus alpha channel is dropped, and is always assumed to be 1.
      'attribute vec2 a_customAttributes;',

      'uniform vec2 u_screenSize;',
      'uniform mat4 u_transform;',

      'varying vec4 color;',

      'void main(void) {',
      '   gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0, 1);',
      '   gl_PointSize = a_customAttributes[1] * u_transform[0][0];',
      '   float c = a_customAttributes[0];',
      '   color.b = mod(c, 256.0); c = floor(c/256.0);',
      '   color.g = mod(c, 256.0); c = floor(c/256.0);',
      '   color.r = mod(c, 256.0); c = floor(c/256.0); color /= 255.0;',
      '   color.a = 1.0;',
      '}'
    ].join('\n');
  };

  /**
   * Called by webgl renderer to load the shader into gl context.
   */
  NodeShader.prototype.load = function (glContext) {
    this.gl = glContext;
    this.utils = Viva.Graph.webgl(this.gl);

    this.program = this.utils.createProgram(this.vertexShader, this.fragmentShader);
    this.gl.useProgram(this.program);

    this.locations = this.utils.getLocations(this.program, ['a_vertexPos', 'a_customAttributes', 'u_screenSize', 'u_transform']);

    this.gl.enableVertexAttribArray(this.locations.vertexPos);
    this.gl.enableVertexAttribArray(this.locations.customAttributes);

    this.buffer = this.gl.createBuffer();
  };

  /**
   * Called by webgl renderer to update node position in the buffer array
   *
   * @param model - data model for the rendered node (Circle in this case)
   * @param pos - {x, y} coordinates of the node.
   */
  NodeShader.prototype.position = function (model, pos) {
    var index = model.id;
    this.nodes[index * ATTRIBUTES_PER_PRIMITIVE] = pos.x;
    this.nodes[index * ATTRIBUTES_PER_PRIMITIVE + 1] = pos.y;
    this.nodes[index * ATTRIBUTES_PER_PRIMITIVE + 2] = model.color;
    this.nodes[index * ATTRIBUTES_PER_PRIMITIVE + 3] = model.size;
  };

  /**
   * Request from webgl renderer to actually draw our stuff into the
   * gl context. This is the core of our shader.
   */
  NodeShader.prototype.render = function () {
    this.gl.useProgram(this.program);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.nodes, this.gl.DYNAMIC_DRAW);

    if (this.isCanvasDirty) {
      this.isCanvasDirty = false;
      this.gl.uniformMatrix4fv(this.locations.transform, false, this.transform);
      this.gl.uniform2f(this.locations.screenSize, this.canvasWidth, this.canvasHeight);
    }

    this.gl.vertexAttribPointer(this.locations.vertexPos, 2, this.gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.vertexAttribPointer(this.locations.customAttributes, 2, this.gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 2 * 4);

    this.gl.drawArrays(this.gl.POINTS, 0, this.nodesCount);
  };

  /**
   * Called by webgl renderer when user scales/pans the canvas with nodes.
   */
  NodeShader.prototype.updateTransform = function (newTransform) {
    this.transform = newTransform;
    this.isCanvasDirty = true;
  };

  /**
   * Called by webgl renderer when user resizes the canvas with nodes.
   */
  NodeShader.prototype.updateSize = function (newCanvasWidth, newCanvasHeight) {
    this.canvasWidth = newCanvasWidth;
    this.canvasHeight = newCanvasHeight;

    this.isCanvasDirty = true;
  };

  /**
   * Called by webgl renderer to notify us that the new node was created in the graph
   */
  NodeShader.prototype.createNode = function () {
    this.nodes = this.utils.extendArray(this.nodes, this.nodesCount, ATTRIBUTES_PER_PRIMITIVE);
    this.nodesCount += 1;
  };

  /**
   * Called by webgl renderer to notify us that the node was removed from the graph
   */
  NodeShader.prototype.removeNode = function (node) {
    if (this.nodesCount > 0) this.nodesCount -=1;

    if (node.id < this.nodesCount && this.nodesCount > 0) {
      // we do not really delete anything from the buffer.
      // Instead we swap deleted node with the "last" node in the
      // buffer and decrease marker of the "last" node. Gives nice O(1)
      // performance, but make code slightly harder than it could be:
      this.utils.copyArrayPart(this.nodes, node.id*ATTRIBUTES_PER_PRIMITIVE, this.nodesCount*ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);
    }
  };

  /**
   * This method is called by webgl renderer when it changes parts of its
   * buffers. We don't use it here, but it's needed by API (see the comment
   * in the removeNode() method)
   */
  NodeShader.prototype.replaceProperties = function() {};
})(window.app);
