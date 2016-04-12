// It is a library for 2D & 3D simulation with canvas

"use strict";

var Env = {};
Env.context = null;
Env.tolerance = 1e-6;

/**/

var Scalar = {};
Scalar.deg2rad = function(deg) {
    return (Math.PI / 180) * deg;
}
Scalar.mod2pi = function(rad) {
    while(rad < 0) { rad = rad + Math.PI*2; }
    while(rad >= Math.PI*2) { rad = rad - Math.PI*2; }
    return rad;
}
Scalar.rand = function(min, max) {
    return Math.random() * (max - min) + min;
}
Scalar.to3dz = function(s) {
    return new Vec3D(0, 0, s);
}

/**/

function Vec2D(x, y) {
    this.x = x;
    this.y = y;

    this.neg = function() {
        return new Vec2D(-this.x, -this.y);
    }
    this.addV = function(v) {
        return new Vec2D(this.x + v.x, this.y + v.y);
    }
    this.subV = function(v) {
        return new Vec2D(this.x - v.x, this.y - v.y);
    }
    this.mulS = function(s) {
        return new Vec2D(this.x * s, this.y * s);
    }
    this.mulVi = function(v) { // inner
        return this.x * v.x + this.y * v.y;
    }
    // There is not mulVo() for 2D.
    this.divS = function(s) {
        return new Vec2D(this.x / s, this.y / s);
    }

    this.abs = function() {
        return Math.sqrt(this.mulVi(this));
    }
    this.unit = function() {
        return this.divS(this.abs());
    }

    this.to3d = function() {
	return new Vec3D(this.x, this.y, 0);
    }
    this.clone = function() {
        return new Vec2D(this.x, this.y);
    }
    this.draw = function(center) {
        Env.context.beginPath();
        Env.context.moveTo(center.x, center.y);
        Env.context.lineTo(center.x + this.x, center.y + this.y);
        Env.context.stroke();
    }
}

Vec2D.rand = function(min, max) {
    return new Vec2D(Scalar.rand(min, max), Scalar.rand(min, max));
}

function Mat2D(v1, v2) {
    this.v1 = v1;
    this.v2 = v2;

    this.tr = function() {
        return new Mat2D(new Vec2D(this.v1.x, this.v2.x),
                         new Vec2D(this.v1.y, this.v2.y));
    }

    this.mulS = function(s) {
        return new Mat2D(this.v1.mulS(s), this.v2.mulS(s));
    }
    this.mulV = function(v) {
        var mt = this.tr();
        return new Vec2D(mt.v1.mulVi(v), mt.v2.mulVi(v));
    }
    this.mulM = function(m) {
        var mt = this.tr();
        return new Mat2D(new Vec2D(mt.v1.mulVi(m.v1), mt.v2.mulVi(m.v1)),
                         new Vec2D(mt.v1.mulVi(m.v2), mt.v2.mulVi(m.v2)));
    }

    this.to3d = function() {
	return new Mat3D(this.v1.to3d(), this.v2.to3d(),
			new Vec3D(0,0,1));
    }
    this.clone = function() {
        return new Mat2D(this.v1.clone(), this.v2.clone());
    }
    this.draw = function(center) {
        this.v1.draw(center);
        this.v2.draw(center);
    }
}

Mat2D.unit = function(v) {
    return new Mat2D(new Vec2D(v.x, 0), new Vec2D(0, v.y));
}
Mat2D.rot = function(rad) {
    var c = Math.cos(rad);
    var s = Math.sin(rad);
    return new Mat2D(new Vec2D(c, s), new Vec2D(-s, c));
}

var Draw2D = {};
Draw2D.draw_point = function(v) {
    Env.context.beginPath();
    Env.context.arc(v.x, v.y, 5, 0, Math.PI*2, false);
    Env.context.stroke();
}
Draw2D.draw_line = function(v1, v2) {
    Env.context.beginPath();
    Env.context.moveTo(v1.x, v1.y);
    Env.context.lineTo(v2.x, v2.y);
    Env.context.stroke();
}

/**/

function Vec3D(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.neg = function() {
        return new Vec3D(-this.x, -this.y, -this.z);
    }
    this.addV = function(v) {
        return new Vec3D(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    this.subV = function(v) {
        return new Vec3D(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    this.mulS = function(s) {
        return new Vec3D(this.x * s, this.y * s, this.z * s);
    }
    this.mulVi = function(v) { // inner
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    this.mulVo = function(v) { // outer
        return new Vec3D(this.y * v.z - this.z * v.y,
                         this.z * v.x - this.x * v.z,
                         this.x * v.y - this.y * v.x);
    }
    this.divS = function(s) {
        return new Vec3D(this.x / s, this.y / s, this.z / s);
    }

    this.abs = function() {
        return Math.sqrt(this.mulVi(this));
    }
    this.unit = function() {
        return this.divS(this.abs());
    }

    this.to2d = function() {
	return new Vec2D(this.x, this.y);
    }
    this.clone = function() {
        return new Vec3D(this.x, this.y, this.z);
    }
    this.draw = function(center) {
        Env.context.moveTo(center.x, center.y);
        Env.context.lineTo(center.x + this.x, center.y + this.y);
        Env.context.stroke();
    }
}

Vec3D.rand = function(min, max) {
    return new Vec3D(Scalar.rand(min, max),
		     Scalar.rand(min, max),
		     Scalar.rand(min, max));
}

function Mat3D(v1, v2, v3) {
    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;

    this.tr = function() {
        return new Mat3D(new Vec3D(this.v1.x, this.v2.x, this.v3.x),
                         new Vec3D(this.v1.y, this.v2.y, this.v3.y),
                         new Vec3D(this.v1.z, this.v2.z, this.v3.z));
    }

    this.mulS = function(s) {
        return new Mat3D(this.v1.mulS(s), this.v2.mulS(s), this.v3.mulS(s));
    }
    this.mulV = function(v) {
        var mt = this.tr();
        return new Vec3D(mt.v1.mulVi(v), mt.v2.mulVi(v), mt.v3.mulVi(v));
    }
    this.mulM = function(m) {
        var mt = this.tr();
        return new Mat3D(new Vec3D(mt.v1.mulVi(m.v1),
                                   mt.v2.mulVi(m.v1),
                                   mt.v3.mulVi(m.v1)),
                         new Vec3D(mt.v1.mulVi(m.v2),
                                   mt.v2.mulVi(m.v2),
                                   mt.v3.mulVi(m.v2)),
                         new Vec3D(mt.v1.mulVi(m.v3),
                                   mt.v2.mulVi(m.v3),
                                   mt.v3.mulVi(m.v3)));
    }

    this.clone = function() {
        return new Mat3D(this.v1.clone(), this.v2.clone(), this.v3.clone());
    }
    this.draw = function(center) {
        this.v1.draw(center);
        this.v2.draw(center);
        this.v3.draw(center);
    }
}

Mat3D.unit = function(v) {
    return new Mat3D(new Vec3D(v.x, 0, 0),
                     new Vec3D(0, v.y, 0),
                     new Vec3D(0, 0, v.z));
}

Mat3D.rot = function(v, rad) {
    var c = Math.cos(rad);
    var s = Math.sin(rad);
    var l_c = 1-c;
    return new Mat3D(new Vec3D(v.x*v.x*l_c + c,
                               v.x*v.y*l_c + v.z*s,
                               v.z*v.x*l_c - v.y*s),
                     new Vec3D(v.x*v.y*l_c - v.z*s,
                               v.y*v.y*l_c + c,
                               v.y*v.z*l_c + v.x*s),
                     new Vec3D(v.z*v.x*l_c + v.y*s,
                               v.y*v.z*l_c - v.x*s,
                               v.z*v.z*l_c + c));
}

var AVec3D = {}; // angular vector
AVec3D.asm = function(v, s) {
    var t = v.abs();
    if(t > Env.tolerance){
        return v.mulS(s/t);
    }else{
        return new Vec3D(0, 0, 0);
    }
}
AVec3D.dasm = function(av) {
    var s = av.abs();
    if(s > Env.tolerance){
        return [av.divS(s), s];
    }else{
        return [new Vec3D(0, 0, 0), 0];
    }
}
AVec3D.mod2pi = function(av) {
    var s = av.abs();
    if(s > Env.tolerance){
        var t = s;
        while(t >= Math.PI*2){
            t = t - Math.PI*2;
        }
        return av.mulS(t/s);
    }else{
        return new Vec3D(0, 0, 0);
    }
}
AVec3D.rot = function(av) {
    var vs = AVec3D.dasm(av);
    return Mat3D.rot(vs[0], vs[1]);
}

var Draw3D = {};
Draw3D.draw_point = function(v) {
    Env.context.beginPath();
    Env.context.arc(v.x, v.y, 5, 0, Math.PI*2, false);
    Env.context.stroke();
}
Draw3D.draw_line = function(v1, v2) {
    Env.context.beginPath();
    Env.context.moveTo(v1.x, v1.y);
    Env.context.lineTo(v2.x, v2.y);
    Env.context.stroke();
}

/**/

var Box2D = {};

Box2D.shadow_check = function(u, c1, m1, c2, m2) {
    var sc = Math.abs(u.mulVi(c2) - u.mulVi(c1));
    var sv1 = Math.abs(u.mulVi(m1.v1)) + Math.abs(u.mulVi(m1.v2));
    var sv2 = Math.abs(u.mulVi(m2.v1)) + Math.abs(u.mulVi(m2.v2));
    return sc - (sv1 + sv2);
}
Box2D.collision_check = function(c1, m1, c2, m2) {

    var u = [c2.subV(c1).unit(),

             m1.v1.unit(), m1.v2.unit(),
	     m2.v1.unit(), m2.v2.unit()];

    for(var i=0; i<u.length; i++){
	var s = Box2D.shadow_check(u[i], c1, m1, c2, m2);
	if(s > 0){
	    return false;
	}
    }

    return true;
}

Box2D.shadow_edge = function(u, m) {

    var ev = new Vec2D(0,0);

    var mv = [m.v1, m.v2];
    for(var i=0; i<mv.length; i++){
	var sv = u.mulVi(mv[i]);
	if(Math.abs(sv) > Env.tolerance){
	    ev = ev.addV( (sv>=0) ? mv[i] : mv[i].neg() );
	}
    }

    return ev;
}

Box2D.magnet_sub = function(c, v, o) {
    var mg, sc, sv, so, u;

    sv = v.abs();
    u = v.divS(sv);

    sc = u.mulVi(c);
    so = u.mulVi(o);

    if(so < sc - sv){
	mg = [v.neg(), 0];
    }else if(so > sc + sv){
	mg = [v, 0];
    }else{
	mg = [u.mulS(so - sc), 1];
    }
    return mg;
}
Box2D.magnet = function(c1, m1, c2, m2) {

    var p1 = Box2D.shadow_edge(c2.subV(c1).unit(), m1);
    var p2 = Box2D.shadow_edge(c1.subV(c2).unit(), m2);
    var k1, k2;

    var num = 0;
    var err = Number.MAX_VALUE;
    var pr = Number.MAX_VALUE;
    while(err > Env.tolerance){
        var mg1, mg2, o;
	var r1, r2, r;

	o = c2.addV(p2);
        mg1 = Box2D.magnet_sub(c1, m1.v1, o);
        mg2 = Box2D.magnet_sub(c1, m1.v2, o);
        p1 = mg1[0].addV(mg2[0]);
        k1 = mg1[1] + mg2[1];

        o = c1.addV(p1);
        mg1 = Box2D.magnet_sub(c2, m2.v1, o);
        mg2 = Box2D.magnet_sub(c2, m2.v2, o);
        p2 = mg1[0].addV(mg2[0]);
        k2 = mg1[1] + mg2[1];

        r1 = c1.addV(p1)
        r2 = c2.addV(p2)
        r = r2.subV(r1).abs();
        err = Math.abs(r - pr);
        pr = r;

        num++;
    }
    console.log(num);

    return [[p1, k1], [p2, k2]];
}

Box2D.draw = function(c, m) {
    var t1 = c.addV(m.v1).addV(m.v2);
    var t2 = c.subV(m.v1).addV(m.v2);
    var t3 = c.subV(m.v1).subV(m.v2);
    var t4 = c.addV(m.v1).subV(m.v2);

    Env.context.beginPath();
    Env.context.moveTo(t1.x, t1.y);
    Env.context.lineTo(t2.x, t2.y);
    Env.context.lineTo(t3.x, t3.y);
    Env.context.lineTo(t4.x, t4.y);
    Env.context.closePath();
    Env.context.stroke();
}

/**/

var Box3D = {};

Box3D.shadow_check = function(u, c1, m1, c2, m2) {

    var sc = Math.abs(u.mulVi(c2) - u.mulVi(c1));
    var sv1 = Math.abs(u.mulVi(m1.v1))
        + Math.abs(u.mulVi(m1.v2))
        + Math.abs(u.mulVi(m1.v3));
    var sv2 = Math.abs(u.mulVi(m2.v1))
        + Math.abs(u.mulVi(m2.v2))
        + Math.abs(u.mulVi(m2.v3));

    return sc -(sv1 + sv2);
}
Box3D.collision_check = function(c1, m1, c2, m2) {

    var u = [c2.subV(c1).unit(),

             m1.v1.unit(), m1.v2.unit(), m1.v3.unit(),
	     m2.v1.unit(), m2.v2.unit(), m2.v3.unit(),

	     m1.v1.mulVo(m2.v1).unit(), m1.v1.mulVo(m2.v2).unit(),
	     m1.v1.mulVo(m2.v3).unit(),

	     m1.v2.mulVo(m2.v2).unit(), m1.v2.mulVo(m2.v3).unit(),

	     m1.v3.mulVo(m2.v3).unit()];

    for(var i=0; i<u.length; i++){
	var s = Box3D.shadow_check(u[i], c1, m1, c2, m2);
	if(s > 0){
	    return false;
	}
    }

    return true;
}

Box3D.shadow_edge = function(u, m) {

    var ev = new Vec3D(0,0,0);

    var mv = [m.v1, m.v2, m.v3];
    for(var i=0; i<mv.length; i++){
	var sv = u.mulVi(mv[i]);
	if(Math.abs(sv) > Env.tolerance){
	    ev = ev.addV( (sv>=0) ? mv[i] : mv[i].neg() );
	}
    }

    return ev;
}

Box3D.magnet_sub = function(c, v, o) {
    var mg, sc, sv, so, u;

    sv = v.abs();
    u = v.divS(sv);

    sc = u.mulVi(c);
    so = u.mulVi(o);

    if(so < sc - sv){
	mg = [v.neg(), 0];
    }else if(so > sc + sv){
	mg = [v, 0];
    }else{
	mg = [u.mulS(so - sc), 1];
    }
    return mg;
}
Box3D.magnet = function(c1, m1, c2, m2) {

    var p1 = Box3D.shadow_edge(c2.subV(c1).unit(), m1);
    var p2 = Box3D.shadow_edge(c1.subV(c2).unit(), m2);
    var k1, k2;

    var num = 0;
    var err = Number.MAX_VALUE;
    var pr = Number.MAX_VALUE;
    while(err > Env.tolerance){
        var mg1, mg2, mg3, o;
	var r1, r2, r;

        o = c2.addV(p2);
        mg1 = Box3D.magnet_sub(c1, m1.v1, o);
        mg2 = Box3D.magnet_sub(c1, m1.v2, o);
        mg3 = Box3D.magnet_sub(c1, m1.v3, o);
        p1 = mg1[0].addV(mg2[0]).addV(mg3[0]);
        k1 = mg1[1] + mg2[1] + mg3[1];

        o = c1.addV(p1);
        mg1 = Box3D.magnet_sub(c2, m2.v1, o);
        mg2 = Box3D.magnet_sub(c2, m2.v2, o);
        mg3 = Box3D.magnet_sub(c2, m2.v3, o);
        p2 = mg1[0].addV(mg2[0]).addV(mg3[0]);
        k2 = mg1[1] + mg2[1] + mg3[1];

        r1 = c1.addV(p1)
        r2 = c2.addV(p2)
        r = r2.subV(r1).abs();
        err = Math.abs(r - pr);
        pr = r;

        num++;
    }
    console.log(num);

    return [[p1, k1], [p2, k2]];
}

Box3D.draw = function(c, m) {
    var t1 = c.addV(m.v1).addV(m.v2).addV(m.v3);
    var t2 = c.subV(m.v1).addV(m.v2).addV(m.v3);
    var t3 = c.subV(m.v1).subV(m.v2).addV(m.v3);
    var t4 = c.addV(m.v1).subV(m.v2).addV(m.v3);

    var t5 = c.addV(m.v1).addV(m.v2).subV(m.v3);
    var t6 = c.subV(m.v1).addV(m.v2).subV(m.v3);
    var t7 = c.subV(m.v1).subV(m.v2).subV(m.v3);
    var t8 = c.addV(m.v1).subV(m.v2).subV(m.v3);

    Env.context.beginPath();
    Env.context.moveTo(t1.x, t1.y);
    Env.context.lineTo(t2.x, t2.y);
    Env.context.lineTo(t3.x, t3.y);
    Env.context.lineTo(t4.x, t4.y);
    Env.context.closePath();
    Env.context.stroke();

    Env.context.beginPath();
    Env.context.moveTo(t5.x, t5.y);
    Env.context.lineTo(t6.x, t6.y);
    Env.context.lineTo(t7.x, t7.y);
    Env.context.lineTo(t8.x, t8.y);
    Env.context.closePath();
    Env.context.stroke();

    Env.context.beginPath();
    Env.context.moveTo(t1.x, t1.y);
    Env.context.lineTo(t5.x, t5.y);
    Env.context.stroke();
    Env.context.beginPath();
    Env.context.moveTo(t2.x, t2.y);
    Env.context.lineTo(t6.x, t6.y);
    Env.context.stroke();
    Env.context.beginPath();
    Env.context.moveTo(t3.x, t3.y);
    Env.context.lineTo(t7.x, t7.y);
    Env.context.stroke();
    Env.context.beginPath();
    Env.context.moveTo(t4.x, t4.y);
    Env.context.lineTo(t8.x, t8.y);
    Env.context.stroke();
}

/**/

function Obj2D(pos, vel, mass, size) {
    this.pl = pos[0];
    this.pa = Scalar.mod2pi(pos[1]); // 1D
    this.vl = vel[0];
    this.va = Scalar.mod2pi(vel[1]); // 1D
    this.ml = mass;
    this.rt = Mat2D.rot(this.pa);
    this.ma0 = Mat3D.unit(new Vec3D(size.y*size.y,
                                    size.x*size.x,
				    size.x*size.x + size.y*size.y
                                   ).mulS(mass/3)); // 3D
    this.ma = this.rt.to3d().mulM(this.ma0); // 3D
    this.sz = size;
    this.ax0 = Mat2D.unit(size);
    this.ax = this.rt.mulM(this.ax0);

    this.update = function(dt) {
        var newpl = this.pl.addV(this.vl.mulS(dt));
        var newpa = this.pa + this.va * dt;
	
        return new Obj2D([newpl, newpa],
                         [this.vl, this.va],
                         this.ml,
                         this.sz);
    }
    this.draw = function() {
        Box2D.draw(this.pl, this.ax);
    }
}

Obj2D.collision_check = function(o1, o2) {
    return Box2D.collision_check(o1.pl, o1.ax, o2.pl, o2.ax);
}

Obj2D.collision_point = function(o1, o2) {
    var mg = Box2D.magnet(o1.pl, o1.ax, o2.pl, o2.ax);
    var r1 = o1.pl.addV(mg[0][0]);
    var r2 = o2.pl.addV(mg[1][0]);
    if(mg[0][1] >= mg[1][1]){
	return [r1, r2.subV(r1).unit()];
    }else{
	return [r2, r1.subV(r2).unit()];
    }
}

Obj2D.collision_update = function(o1, o2, r, n, e) {
    var pl1 = o1.pl;
    var pa1 = o1.pa; // 1D
    var vl1 = o1.vl;
    var va1 = o1.va; // 1D
    var ml1 = o1.ml;
    var ma1 = o1.ma; // 3D
    var pl2 = o2.pl;
    var pa2 = o2.pa; // 1D
    var vl2 = o2.vl;
    var va2 = o2.va; // 1D
    var ml2 = o2.ml;
    var ma2 = o2.ma; // 3D

    var sz1 = o1.sz;
    var sz2 = o2.sz;

    var r1 = r.subV(pl1);
    var r2 = r.subV(pl2);

    var va1_3d = Scalar.to3dz(va1);
    var va2_3d = Scalar.to3dz(va2);
    var r1_3d = r1.to3d();
    var r2_3d = r2.to3d();
    var n_3d = n.to3d();

//    var v1 = vl1.addV(va1.mulVo(r1));
//    var v2 = vl2.addV(va2.mulVo(r2));
    var v1 = vl1.addV(va1_3d.mulVo(r1_3d).to2d());
    var v2 = vl2.addV(va2_3d.mulVo(r2_3d).to2d());
    var vr = v2.subV(v1);
    var jrc = -(1+e) * vr.mulVi(n);

    var kl1 = 1/ml1;
    var kl2 = 1/ml2;
//    var ka1 = ma1.tr().mulV(r1.mulVo(n).mulVo(r1));
//    var ka2 = ma2.tr().mulV(r2.mulVo(n).mulVo(r2));
    var ka1 = ma1.tr().mulV(r1_3d.mulVo(n_3d).mulVo(r1_3d));
    var ka2 = ma2.tr().mulV(r2_3d.mulVo(n_3d).mulVo(r2_3d));
//    var jrm = kl1 + kl2 + ka1.addV(ka2).mulVi(n);
    var jrm = kl1 + kl2 + ka1.addV(ka2).mulVi(n_3d);

    var jr = jrc / jrm;

    var newvl1 = vl1.subV(n.mulS(kl1 * jr));
    var newvl2 = vl2.addV(n.mulS(kl2 * jr));
//    var newva1 = va1.subV(ka1.mulS(jr));
//    var newva2 = va2.addV(ka2.mulS(jr));
    var newva1 = va1_3d.subV(ka1.mulS(jr)).z;
    var newva2 = va2_3d.addV(ka2.mulS(jr)).z;

    var newo1 = new Obj2D([o1.pl, o1.pa],
                          [newvl1, newva1],
                          o1.ml,
                          o1.sz);
    var newo2 = new Obj2D([o2.pl, o2.pa],
                          [newvl2, newva2],
                          o2.ml,
                          o2.sz);
    
    return [newo1, newo2];
}

/**/

function Obj3D(pos, vel, mass, size) {
    this.pl = pos[0];
    this.pa = AVec3D.mod2pi(pos[1]);
    this.vl = vel[0];
    this.va = AVec3D.mod2pi(vel[1]);
    this.ml = mass;
    this.rt = AVec3D.rot(this.pa);
    this.ma0 = Mat3D.unit(new Vec3D(size.y*size.y + size.z*size.z,
                                    size.z*size.z + size.x*size.x,
                                    size.x*size.x + size.y*size.y
                                   ).mulS(mass/3));
    this.ma = this.rt.mulM(this.ma0);
    this.sz = size;
    this.ax0 = Mat3D.unit(size);
    this.ax = this.rt.mulM(this.ax0);

    this.update = function(dt) {
        var newpl = this.pl.addV(this.vl.mulS(dt));
        var newpa = this.pa.addV(this.va.mulS(dt));

        return new Obj3D([newpl, newpa],
                         [this.vl, this.va],
                         this.ml,
                         this.sz);
    }
    this.draw = function() {
        Box3D.draw(this.pl, this.ax);
    }
}

Obj3D.collision_check = function(o1, o2) {
    return Box3D.collision_check(o1.pl, o1.ax, o2.pl, o2.ax);
}

Obj3D.collision_point = function(o1, o2) {
    var mg = Box3D.magnet(o1.pl, o1.ax, o2.pl, o2.ax);
    var r1 = o1.pl.addV(mg[0][0]);
    var r2 = o2.pl.addV(mg[1][0]);
    if(mg[0][1] >= mg[1][1]){
	return [r1, r2.subV(r1).unit()];
    }else{
	return [r2, r1.subV(r2).unit()];
    }
}

Obj3D.collision_update = function(o1, o2, r, n, e) {
    var pl1 = o1.pl;
    var pa1 = o1.pa;
    var vl1 = o1.vl;
    var va1 = o1.va;
    var ml1 = o1.ml;
    var ma1 = o1.ma;
    var pl2 = o2.pl;
    var pa2 = o2.pa;
    var vl2 = o2.vl;
    var va2 = o2.va;
    var ml2 = o2.ml;
    var ma2 = o2.ma;

    var r1 = r.subV(pl1);
    var r2 = r.subV(pl2);

    var v1 = vl1.addV(va1.mulVo(r1));
    var v2 = vl2.addV(va2.mulVo(r2));
    var vr = v2.subV(v1);
    var jrc = -(1+e) * vr.mulVi(n);

    var kl1 = 1/ml1;
    var kl2 = 1/ml2;
    var ka1 = ma1.tr().mulV(r1.mulVo(n).mulVo(r1));
    var ka2 = ma2.tr().mulV(r2.mulVo(n).mulVo(r2));
    var jrm = kl1 + kl2 + ka1.addV(ka2).mulVi(n);

    var jr = jrc / jrm;

    var newvl1 = vl1.subV(n.mulS(kl1 * jr));
    var newvl2 = vl2.addV(n.mulS(kl2 * jr));
    var newva1 = va1.subV(ka1.mulS(jr));
    var newva2 = va2.addV(ka2.mulS(jr));

    var newo1 = new Obj3D([o1.pl, o1.pa],
                          [newvl1, newva1],
                          o1.ml,
                          o1.sz);
    var newo2 = new Obj3D([o2.pl, o2.pa],
                          [newvl2, newva2],
                          o2.ml,
                          o2.sz);

    return [newo1, newo2];
}
