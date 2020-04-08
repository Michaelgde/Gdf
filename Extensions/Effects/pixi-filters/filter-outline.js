/*!
 * @pixi/filter-outline - v3.1.1
 * Compiled Wed, 08 Apr 2020 11:09:37 UTC
 *
 * @pixi/filter-outline is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
var __filters=function(o,e,t){"use strict";var r="attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}",n="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec2 thickness;\nuniform vec4 outlineColor;\nuniform vec4 filterClamp;\n\nconst float DOUBLE_PI = 3.14159265358979323846264 * 2.;\n\nvoid main(void) {\n    vec4 ownColor = texture2D(uSampler, vTextureCoord);\n    vec4 curColor;\n    float maxAlpha = 0.;\n    vec2 displaced;\n    for (float angle = 0.; angle <= DOUBLE_PI; angle += ${angleStep}) {\n        displaced.x = vTextureCoord.x + thickness.x * cos(angle);\n        displaced.y = vTextureCoord.y + thickness.y * sin(angle);\n        curColor = texture2D(uSampler, clamp(displaced, filterClamp.xy, filterClamp.zw));\n        maxAlpha = max(maxAlpha, curColor.a);\n    }\n    float resultAlpha = max(maxAlpha, ownColor.a);\n    gl_FragColor = vec4((ownColor.rgb + outlineColor.rgb * (1. - ownColor.a)) * resultAlpha, resultAlpha);\n}\n",i=function(o){function e(t,i,l){void 0===t&&(t=1),void 0===i&&(i=0),void 0===l&&(l=.1);var a=Math.max(l*e.MAX_SAMPLES,e.MIN_SAMPLES),s=(2*Math.PI/a).toFixed(7);o.call(this,r,n.replace(/\$\{angleStep\}/,s)),this.uniforms.thickness=new Float32Array([0,0]),this.thickness=t,this.uniforms.outlineColor=new Float32Array([0,0,0,1]),this.color=i,this.quality=l}o&&(e.__proto__=o),e.prototype=Object.create(o&&o.prototype),e.prototype.constructor=e;var i={color:{configurable:!0}};return e.prototype.apply=function(o,e,t,r){this.uniforms.thickness[0]=this.thickness/e._frame.width,this.uniforms.thickness[1]=this.thickness/e._frame.height,o.applyFilter(this,e,t,r)},i.color.get=function(){return t.rgb2hex(this.uniforms.outlineColor)},i.color.set=function(o){t.hex2rgb(o,this.uniforms.outlineColor)},Object.defineProperties(e.prototype,i),e}(e.Filter);return i.MIN_SAMPLES=1,i.MAX_SAMPLES=100,o.OutlineFilter=i,o}({},PIXI,PIXI.utils);Object.assign(PIXI.filters,__filters);
//# sourceMappingURL=filter-outline.js.map
