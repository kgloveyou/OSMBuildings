// TODO: handle multiple markers
// A: cluster them into 'tiles' that give close reference point and allow simpler visibility tests or
// B: handle them as individual objects

class Marker {

  constructor (position) {

    this.shader = new GLX.Shader({
      vertexShader: Shaders.marker.vertex,
      fragmentShader: Shaders.marker.fragment,
      shaderName: 'marker shader',
      attributes: ['aPosition', 'aTexCoord'],
      uniforms: [
        'uProjMatrix',
        'uViewMatrix',
        'uModelMatrix',
        'uTexIndex'
      ]
    });

    const texCoords = [
      1,1,
      0,1,
      1,0,
      0,1,
      0,0,
      1,0
    ];

    this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(texCoords));


    // http://localhost/git/OSMBuildings/test/?lat=55.750472&lon=37.641382&zoom=16.8&tilt=49.9&rotation=225.8

    // this.points = [
    //   [
    //     37.634793519973755,
    //     55.75022514787899,
    //     130
    //   ],
    //   [
    //     37.64390230178832,
    //     55.75022514787899,
    //     30
    //   ],
    //   [
    //     37.64390230178832,
    //     55.75396865656196,
    //     50
    //   ],
    //   [
    //     37.634793519973755,
    //     55.75396865656196,
    //     20
    //   ]
    // ];

    // TODO
    this.position = position || [
      37.634793519973755,
      55.75022514787899,
      130
    ];

    this.size = 50;

    this.onLoad(this.position);
  }

  render () {
    const shader = this.shader;

    shader.enable();

    const metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(APP.position.latitude / 180 * Math.PI);

    const modelMatrix = new GLX.Matrix();
    modelMatrix.translate(
      (this.position[0] - APP.position.longitude) * metersPerDegreeLongitude,
      -(this.position[1] - APP.position.latitude) * METERS_PER_DEGREE_LATITUDE,
      this.position[2]
    );

    this.shader.setMatrix('uProjMatrix', '4fv', render.projMatrix.data);
    this.shader.setMatrix('uViewMatrix', '4fv', render.viewMatrix.data);
    this.shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
    this.shader.setBuffer('aPosition', this.vertexBuffer);

    shader.setBuffer('aTexCoord', this.texCoordBuffer);
    shader.setTexture('uTexIndex', 0, this.texture);

    GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);

    shader.disable();
  }

  onLoad (point) {
    const
      w2 = this.size / 2,
      h2 = this.size / 2;

    const vertices = [
      -w2, -h2, 0,
       w2, -h2, 0,
      -w2,  h2, 0,
       w2, -h2, 0,
       w2,  h2, 0,
      -w2,  h2, 0
    ];


    this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));

    this.texture = new GLX.texture.Image().load("http://localhost/git/OSMBuildings/test/OSMBuildings/jan.png", image => {
      if (image) {
        /* Whole texture will be mapped to fit the tile exactly. So
         * don't attempt to wrap around the texture coordinates. */

        GL.bindTexture(GL.TEXTURE_2D, this.texture.id);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

      }
    });

  }

  destroy () {
    this.vertexBuffer.destroy();
    this.texCoordBuffer.destroy();

    if (this.texture) {
      this.texture.destroy();
    }
  }
}
