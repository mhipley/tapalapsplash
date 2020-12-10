!(function (t) {
    function e(r) {
        if (i[r]) return i[r].exports;
        var a = (i[r] = { exports: {}, id: r, loaded: !1 });
        return t[r].call(a.exports, a, a.exports, e), (a.loaded = !0), a.exports;
    }
    var i = {};
    return (e.m = t), (e.c = i), (e.p = ""), e(0);
})([
    function (t, e, i) {
        "use strict";
        function r(t, e) {
            return { status: "error", src: e, message: t, timestamp: Date.now() };
        }
        var a =
                "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                    ? function (t) {
                          return typeof t;
                      }
                    : function (t) {
                          return t && "function" == typeof Symbol && t.constructor === Symbol ? "symbol" : typeof t;
                      },
            s = i(1);
        if ("undefined" == typeof AFRAME) throw "Component attempted to register before AFRAME was available.";
        var n = AFRAME.utils.srcLoader.parseUrl,
            o = AFRAME.utils.debug;
        o.enable("shader:gif:warn");
        var _ = o("shader:gif:warn"),
            h = o("shader:gif:debug"),
            u = {};
        AFRAME.registerShader("gif", {
            schema: { color: { type: "color" }, fog: { default: !0 }, src: { default: null }, autoplay: { default: !0 } },
            init: function (t) {
                return (
                    h("init", t),
                    h(this.el.components),
                    (this.__cnv = document.createElement("canvas")),
                    (this.__cnv.width = 2),
                    (this.__cnv.height = 2),
                    (this.__ctx = this.__cnv.getContext("2d")),
                    (this.__texture = new THREE.Texture(this.__cnv)),
                    (this.__material = {}),
                    this.__reset(),
                    (this.material = new THREE.MeshBasicMaterial({ map: this.__texture })),
                    this.el.sceneEl.addBehavior(this),
                    this.__addPublicFunctions(),
                    this.material
                );
            },
            update: function (t) {
                return h("update", t), this.__updateMaterial(t), this.__updateTexture(t), this.material;
            },
            tick: function (t) {
                this.__frames && !this.paused() && Date.now() - this.__startTime >= this.__nextFrameTime && this.nextFrame();
            },
            __updateMaterial: function (t) {
                var e = this.material,
                    i = this.__getMaterialData(t);
                Object.keys(i).forEach(function (t) {
                    e[t] = i[t];
                });
            },
            __getMaterialData: function (t) {
                return { fog: t.fog, color: new THREE.Color(t.color) };
            },
            __setTexure: function (t) {
                h("__setTexure", t), "error" === t.status ? (_("Error: " + t.message + "\nsrc: " + t.src), this.__reset()) : "success" === t.status && t.src !== this.__textureSrc && (this.__reset(), this.__ready(t));
            },
            __updateTexture: function (t) {
                var e = t.src,
                    i = t.autoplay;
                "boolean" == typeof i ? (this.__autoplay = i) : "undefined" == typeof i && (this.__autoplay = !0), this.__autoplay && this.__frames && this.play(), e ? this.__validateSrc(e, this.__setTexure.bind(this)) : this.__reset();
            },
            __validateSrc: function (t, e) {
                var i = n(t);
                if (i) return void this.__getImageSrc(i, e);
                var s = void 0,
                    o = this.__validateAndGetQuerySelector(t);
                if (o && "object" === ("undefined" == typeof o ? "undefined" : a(o))) {
                    if (o.error) s = o.error;
                    else {
                        var _ = o.tagName.toLowerCase();
                        if ("video" === _) (t = o.src), (s = "For video, please use `aframe-video-shader`");
                        else {
                            if ("img" === _) return void this.__getImageSrc(o.src, e);
                            s = "For <" + _ + "> element, please use `aframe-html-shader`";
                        }
                    }
                    s &&
                        !(function () {
                            var i = u[t],
                                a = r(s, t);
                            i && i.callbacks
                                ? i.callbacks.forEach(function (t) {
                                      return t(a);
                                  })
                                : e(a),
                                (u[t] = a);
                        })();
                }
            },
            __getImageSrc: function (t, e) {
                function i(e) {
                    var i = r(e, t);
                    n.callbacks &&
                        (n.callbacks.forEach(function (t) {
                            return t(i);
                        }),
                        (u[t] = i));
                }
                var a = this;
                if (t !== this.__textureSrc) {
                    var n = u[t];
                    if (n && n.callbacks) {
                        if (n.src) return void e(n);
                        if (n.callbacks) return void n.callbacks.push(e);
                    } else (n = u[t] = { callbacks: [] }), n.callbacks.push(e);
                    var o = new Image();
                    (o.crossOrigin = "Anonymous"),
                        o.addEventListener("load", function (e) {
                            a.__getUnit8Array(t, function (e) {
                                return e
                                    ? void (0, s.parseGIF)(
                                          e,
                                          function (e, i, r) {
                                              var a = { status: "success", src: t, times: e, cnt: i, frames: r, timestamp: Date.now() };
                                              n.callbacks &&
                                                  (n.callbacks.forEach(function (t) {
                                                      return t(a);
                                                  }),
                                                  (u[t] = a));
                                          },
                                          function (t) {
                                              return i(t);
                                          }
                                      )
                                    : void i("This is not gif. Please use `shader:flat` instead");
                            });
                        }),
                        o.addEventListener("error", function (t) {
                            return i("Could be the following issue\n - Not Image\n - Not Found\n - Server Error\n - Cross-Origin Issue");
                        }),
                        (o.src = t);
                }
            },
            __getUnit8Array: function (t, e) {
                if ("function" == typeof e) {
                    var i = new XMLHttpRequest();
                    i.open("GET", t),
                        (i.responseType = "arraybuffer"),
                        i.addEventListener("load", function (t) {
                            for (var i = new Uint8Array(t.target.response), r = i.subarray(0, 4), a = "", s = 0; s < r.length; s++) a += r[s].toString(16);
                            "47494638" === a ? e(i) : e();
                        }),
                        i.addEventListener("error", function (t) {
                            h(t), e();
                        }),
                        i.send();
                }
            },
            __validateAndGetQuerySelector: function (t) {
                try {
                    var e = document.querySelector(t);
                    return e ? e : { error: "No element was found matching the selector" };
                } catch (i) {
                    return { error: "no valid selector" };
                }
            },
            __addPublicFunctions: function () {
                this.el.gif = { play: this.play.bind(this), pause: this.pause.bind(this), togglePlayback: this.togglePlayback.bind(this), paused: this.paused.bind(this), nextFrame: this.nextFrame.bind(this) };
            },
            pause: function () {
                h("pause"), (this.__paused = !0);
            },
            play: function () {
                h("play"), (this.__paused = !1);
            },
            togglePlayback: function () {
                this.paused() ? this.play() : this.pause();
            },
            paused: function () {
                return this.__paused;
            },
            nextFrame: function () {
                for (this.__draw(); Date.now() - this.__startTime >= this.__nextFrameTime; )
                    (this.__nextFrameTime += this.__delayTimes[this.__frameIdx++]), (this.__infinity || this.__loopCnt) && this.__frameCnt <= this.__frameIdx && (this.__frameIdx = 0);
            },
            __clearCanvas: function () {
                this.__ctx.clearRect(0, 0, this.__width, this.__height), (this.__texture.needsUpdate = !0);
            },
            __draw: function () {
                this.__ctx.drawImage(this.__frames[this.__frameIdx], 0, 0, this.__width, this.__height), (this.__texture.needsUpdate = !0);
            },
            __ready: function (t) {
                var e = t.src,
                    i = t.times,
                    r = t.cnt,
                    a = t.frames;
                h("__ready"),
                    (this.__textureSrc = e),
                    (this.__delayTimes = i),
                    r ? (this.__loopCnt = r) : (this.__infinity = !0),
                    (this.__frames = a),
                    (this.__frameCnt = i.length),
                    (this.__startTime = Date.now()),
                    (this.__width = THREE.Math.floorPowerOfTwo(a[0].width)),
                    (this.__height = THREE.Math.floorPowerOfTwo(a[0].height)),
                    (this.__cnv.width = this.__width),
                    (this.__cnv.height = this.__height),
                    this.__draw(),
                    this.__autoplay ? this.play() : this.pause();
            },
            __reset: function () {
                this.pause(),
                    this.__clearCanvas(),
                    (this.__startTime = 0),
                    (this.__nextFrameTime = 0),
                    (this.__frameIdx = 0),
                    (this.__frameCnt = 0),
                    (this.__delayTimes = null),
                    (this.__infinity = !1),
                    (this.__loopCnt = 0),
                    (this.__frames = null),
                    (this.__textureSrc = null);
            },
        });
    },
    function (t, e) {
        "use strict";
        e.parseGIF = function (t, e, i) {
            var r = 0,
                a = [],
                s = 0,
                n = null,
                o = null,
                _ = [],
                h = 0;
            if (71 === t[0] && 73 === t[1] && 70 === t[2] && 56 === t[3] && 57 === t[4] && 97 === t[5]) {
                r += 13 + +!!(128 & t[10]) * Math.pow(2, (7 & t[10]) + 1) * 3;
                for (var u = t.subarray(0, r); t[r] && 59 !== t[r]; ) {
                    var c = r,
                        l = t[r];
                    if (33 === l) {
                        var f = t[++r];
                        if (-1 === [1, 254, 249, 255].indexOf(f)) {
                            i && i("parseGIF: unknown label");
                            break;
                        }
                        for (249 === f && a.push(10 * (t[r + 3] + (t[r + 4] << 8))), 255 === f && (h = t[r + 15] + (t[r + 16] << 8)); t[++r]; ) r += t[r];
                        249 === f && (n = t.subarray(c, r + 1));
                    } else {
                        if (44 !== l) {
                            i && i("parseGIF: unknown blockId");
                            break;
                        }
                        for (r += 9, r += 1 + +!!(128 & t[r]) * (3 * Math.pow(2, (7 & t[r]) + 1)); t[++r]; ) r += t[r];
                        var o = t.subarray(c, r + 1);
                        _.push(URL.createObjectURL(new Blob([u, n, o])));
                    }
                    r++;
                }
            } else i && i("parseGIF: no GIF89a");
            if (_.length) {
                var d = document.createElement("canvas"),
                    m = function () {
                        _.forEach(function (t, e) {
                            var i = new Image();
                            (i.onload = function (t, e) {
                                0 === e && ((d.width = i.width), (d.height = i.height)), s++, (_[e] = this), s === _.length && ((s = 0), p(1));
                            }.bind(i, null, e)),
                                (i.src = t);
                        });
                    },
                    p = function g(t) {
                        var i = new Image();
                        (i.onload = function (t, i) {
                            s++, (_[i] = this), s === _.length ? ((d = null), e && e(a, h, _)) : g(++i);
                        }.bind(i)),
                            (i.src = d.toDataURL("image/gif"));
                    };
                m();
            }
        };
    },
]);
