var gl;
var vertexCount = 0;
var canvas;
var program;
var clipVertices = [];
var triangles = [];
var pixelVertices = [];

function pixelToClip2D(vertices, width, height) {
  const clip = vertices.slice(0); // it will create copy of vertices
  for (var i = 0; i < clip.length; i = i + 2) {
    // it will convert pixel cordinates to clip-space cordinates
    const x = (2 * (clip[i]/width)) - 1; 
    const y = 1 - (2 * (clip[i+1]/height));
    clip[i] = x; 
    clip[i + 1] = y;
  }
  return clip;
}

onload = () => {
  canvas = document.getElementById('webgl-canvas');

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("Couldn't setup webgl");
    return;
  }

  program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  canvas.addEventListener('click', () => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    pixelVertices.push(x, y);
    // clipping space coordinates
    clipVertices = pixelToClip2D(pixelVertices, canvas.width, canvas.height);
    vertexCount++;
  
    // checking if three vertices have been clicked
    if (vertexCount === 3) {
      const color = [Math.random(), Math.random(), Math.random()];
      const triangle = {
        vertices: clipVertices.slice(0), 
        color: color 
      };

      triangles.push(triangle); // adding new created trinangle to triangles array

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    
      triangles.forEach(triangle => {
        const vertices = triangle.vertices;
        const color = triangle.color;
    
        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
    
        const uColorLocation = gl.getUniformLocation(program, 'uColor');
        gl.uniform3fv(uColorLocation, color);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      });

      // resetting in order to define next triangle
      pixelVertices = [];
      clipVertices = [];
      vertexCount = 0;
    }
  });

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
};