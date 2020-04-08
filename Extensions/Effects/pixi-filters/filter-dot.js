/*!
 * @pixi/filter-dot - v3.1.1
 * Compiled Wed, 08 Apr 2020 11:09:37 UTC
 *
 * @pixi/filter-dot is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
var __filters=function(e,n){"use strict";var t="attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}",r="precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform vec4 filterArea;\nuniform sampler2D uSampler;\n\nuniform float angle;\nuniform float scale;\n\nfloat pattern()\n{\n   float s = sin(angle), c = cos(angle);\n   vec2 tex = vTextureCoord * filterArea.xy;\n   vec2 point = vec2(\n       c * tex.x - s * tex.y,\n       s * tex.x + c * tex.y\n   ) * scale;\n   return (sin(point.x) * sin(point.y)) * 4.0;\n}\n\nvoid main()\n{\n   vec4 color = texture2D(uSampler, vTextureCoord);\n   float average = (color.r + color.g + color.b) / 3.0;\n   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);\n}\n",o=function(e){function n(n,o){void 0===n&&(n=1),void 0===o&&(o=5),e.call(this,t,r),this.scale=n,this.angle=o}e&&(n.__proto__=e),n.prototype=Object.create(e&&e.prototype),n.prototype.constructor=n;var o={scale:{configurable:!0},angle:{configurable:!0}};return o.scale.get=function(){return this.uniforms.scale},o.scale.set=function(e){this.uniforms.scale=e},o.angle.get=function(){return this.uniforms.angle},o.angle.set=function(e){this.uniforms.angle=e},Object.defineProperties(n.prototype,o),n}(n.Filter);return e.DotFilter=o,e}({},PIXI);Object.assign(PIXI.filters,__filters);
//# sourceMappingURL=filter-dot.js.map
