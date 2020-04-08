/*!
 * @pixi/filter-bevel - v3.1.1
 * Compiled Wed, 08 Apr 2020 11:09:37 UTC
 *
 * @pixi/filter-bevel is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
var __filters=function(o,t,r,i){"use strict";var n="attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}",e="precision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nuniform float transformX;\nuniform float transformY;\nuniform vec3 lightColor;\nuniform float lightAlpha;\nuniform vec3 shadowColor;\nuniform float shadowAlpha;\n\nvoid main(void) {\n    vec2 transform = vec2(1.0 / filterArea) * vec2(transformX, transformY);\n    vec4 color = texture2D(uSampler, vTextureCoord);\n    float light = texture2D(uSampler, vTextureCoord - transform).a;\n    float shadow = texture2D(uSampler, vTextureCoord + transform).a;\n\n    color.rgb = mix(color.rgb, lightColor, clamp((color.a - light) * lightAlpha, 0.0, 1.0));\n    color.rgb = mix(color.rgb, shadowColor, clamp((color.a - shadow) * shadowAlpha, 0.0, 1.0));\n    gl_FragColor = vec4(color.rgb * color.a, color.a);\n}\n",a=function(o){function t(t){void 0===t&&(t={}),o.call(this,n,e),this.uniforms.lightColor=new Float32Array(3),this.uniforms.shadowColor=new Float32Array(3),t=Object.assign({rotation:45,thickness:2,lightColor:16777215,lightAlpha:.7,shadowColor:0,shadowAlpha:.7},t),this.rotation=t.rotation,this.thickness=t.thickness,this.lightColor=t.lightColor,this.lightAlpha=t.lightAlpha,this.shadowColor=t.shadowColor,this.shadowAlpha=t.shadowAlpha}o&&(t.__proto__=o),t.prototype=Object.create(o&&o.prototype),t.prototype.constructor=t;var a={rotation:{configurable:!0},thickness:{configurable:!0},lightColor:{configurable:!0},lightAlpha:{configurable:!0},shadowColor:{configurable:!0},shadowAlpha:{configurable:!0}};return t.prototype._updateTransform=function(){this.uniforms.transformX=this._thickness*Math.cos(this._angle),this.uniforms.transformY=this._thickness*Math.sin(this._angle)},a.rotation.get=function(){return this._angle/r.DEG_TO_RAD},a.rotation.set=function(o){this._angle=o*r.DEG_TO_RAD,this._updateTransform()},a.thickness.get=function(){return this._thickness},a.thickness.set=function(o){this._thickness=o,this._updateTransform()},a.lightColor.get=function(){return i.rgb2hex(this.uniforms.lightColor)},a.lightColor.set=function(o){i.hex2rgb(o,this.uniforms.lightColor)},a.lightAlpha.get=function(){return this.uniforms.lightAlpha},a.lightAlpha.set=function(o){this.uniforms.lightAlpha=o},a.shadowColor.get=function(){return i.rgb2hex(this.uniforms.shadowColor)},a.shadowColor.set=function(o){i.hex2rgb(o,this.uniforms.shadowColor)},a.shadowAlpha.get=function(){return this.uniforms.shadowAlpha},a.shadowAlpha.set=function(o){this.uniforms.shadowAlpha=o},Object.defineProperties(t.prototype,a),t}(t.Filter);return o.BevelFilter=a,o}({},PIXI,PIXI,PIXI.utils);Object.assign(PIXI.filters,__filters);
//# sourceMappingURL=filter-bevel.js.map
