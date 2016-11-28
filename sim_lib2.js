// It is a library for 2D & 3D simulation with canvas

"use strict";

var Env = {};
Env.context = null;
Env.tolerance = 1e-10;

Env.qut_en = true

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

function Vec3D(x, y, z) { // vector 3 dimension
    this.x = x;
    this.y = y;
    this.z = z;

    this.c_abs_f = false;
    this.c_abs = 0;

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

    this.abs2 = function() {
        return this.mulVi(this);
    }
    this.abs = function() {
	if(this.c_abs_f != true){
            this.c_abs = Math.sqrt(this.abs2());
            this.c_abs_f = true;
        }
        return this.c_abs;
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

Vec3D.avec_new = function(u, t) { // angular vec new
    return u.mulS(t);
}
Vec3D.avec_rand = function() {
    var u = Vec3D.rand(-1, 1).unit();
    var t = Scalar.rand(0, Math.PI/180 * 30);
    return Vec3D.avec_new(u, t);
}

/**/

function Qut(s, v){ // quaternion
    this.s = s;
    this.v = v

    this.c_abs_f = false;
    this.c_abs = 0;

    this.neg = function() {
        return new Qut(-this.s, this.v.neg());
    }
    this.addQ = function(q) {
        return new Qut(this.s + q.s, this.v.addV(q.v));
    }
    this.subQ = function(q) {
        return new Qut(this.s - q.s, this.v.subV(q.v));
    }
    this.mulS = function(s) {
        return new Qut(this.s * s, this.v.mulS(s));
    }
    this.mulQ = function(q) {
        return new Qut(
	    this.s * q.s - this.v.mulVi(q.v),
	    q.v.mulS(this.s).addV(this.v.mulS(q.s)).addV(this.v.mulVo(q.v))
	);
    }
    this.divS = function(s) {
        return new Qut(this.s / s, this.v.divS(s));
    }

    this.abs2 = function() {
        return this.s * this.s + this.v.abs2();
    }
    this.abs = function() {
	if(this.c_abs_f != true){
            this.c_abs = Math.sqrt(this.abs2());
            this.c_abs_f = true;
        }
        return this.c_abs;
    }
    this.conj = function() {
	return new Qut(this.s, this.v.neg());
    }

    this.clone = function() {
        return new Qut(this.s, this.v);
    }
};

Qut.aqut_new = function(u, t) { // angular qut new
    var s = Math.cos(t/2);
    var v = u.mulS(Math.sin(t/2));
    return new Qut(s, v);
}
Qut.aqut2avec = function(aq) { // angular qut to angular vec
    var c = aq.s;
    var s = aq.v.abs();
    var u = aq.v.divS(s);
    var t = Math.atan2(s, c);
    return u.mulS(t);
}
Qut.avec2aqut = function(av) { // angular vec to angular qut
    var t = av.abs();
    var u = av.divS(t);
    var s = Math.cos(t/2);
    var v = u.mulS(Math.sin(t/2));
    return new Qut(s, v);
}

Qut.aqut_rand = function() {
    var av = Vec3D.avec_rand();
    return Qut.avec2aqut(av);
}

/**/

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

Mat3D.rmat_new = function(u, t) { // rotate mat new
    var c = Math.cos(t);
    var s = Math.sin(t);
    var l_c = 1-c;
    return new Mat3D(new Vec3D(u.x*u.x*l_c + c,
                               u.x*u.y*l_c + u.z*s,
                               u.z*u.x*l_c - u.y*s),
                     new Vec3D(u.x*u.y*l_c - u.z*s,
                               u.y*u.y*l_c + c,
                               u.y*u.z*l_c + u.x*s),
                     new Vec3D(u.z*u.x*l_c + u.y*s,
                               u.y*u.z*l_c - u.x*s,
                               u.z*u.z*l_c + c));
}
Mat3D.avec2rmat = function(av) { // angular vec to rotate mat
    var t = av.abs();
    var u = av.divS(t);
    return Mat3D.rmat_new(u, t);
}
Mat3D.aqut2rmat = function(aq) { // angular qut to rotate mat
    var q0 = aq.s;
    var q1 = aq.v.x;
    var q2 = aq.v.y;
    var q3 = aq.v.z;

    var q0q0 = q0 * q0;
    var q0q1 = q0 * q1;
    var q0q2 = q0 * q2;
    var q0q3 = q0 * q3;
    var q1q1 = q1 * q1;
    var q1q2 = q1 * q2;
    var q1q3 = q1 * q3;
    var q2q2 = q2 * q2;
    var q2q3 = q2 * q3;
    var q3q3 = q3 * q3;

    return new Mat3D(new Vec3D(q0q0 + q1q1 - q2q2 - q3q3,
                               2 * (q1q2 + q0q3),
                               2 * (q1q3 - q0q2)),
                     new Vec3D(2 * (q1q2 - q0q3),
                               q0q0 - q1q1 + q2q2 - q3q3,
                               2 * (q2q3 + q0q1)),
                     new Vec3D(2 * (q1q3 + q0q2),
                               2 * (q2q3 - q0q1),
                               q0q0 - q1q1 - q2q2 + q3q3));
}

/**/

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

var Box3D = {};

Box3D.shadow_check = function(u, c1, m1, c2, m2) {

    var sc = Math.abs(u.mulVi(c2) - u.mulVi(c1));
    var sv1 = Math.abs(u.mulVi(m1.v1))
        + Math.abs(u.mulVi(m1.v2))
        + Math.abs(u.mulVi(m1.v3));
    var sv2 = Math.abs(u.mulVi(m2.v1))
        + Math.abs(u.mulVi(m2.v2))
        + Math.abs(u.mulVi(m2.v3));

    return sc - (sv1 + sv2);
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
    var sv, sd, u;
    var mg, s, k;

    sv = v.abs();
    u = v.divS(sv);

    sd = u.mulVi(o) - u.mulVi(c);
    if(sd < - sv){
	s = -sv;
	k = 0;
    }else if(sd > sv){
	s = sv;
	k = 0;
    }else{
	s = sd;
	k = 1;
    }
    mg = [u.mulS(s), k]

    return mg;
}
Box3D.magnet = function(c1, m1, c2, m2) {

    var p1 = Box3D.shadow_edge(c2.subV(c1).unit(), m1);
    var p2 = Box3D.shadow_edge(c1.subV(c2).unit(), m2);
    var k1, k2;

//    var num = 0;
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

//        num++;
    }
//    console.log(num);

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

function Obj3D(pos, vel, mass, size) {
    this.pl = pos[0];                   // Vec3D
    this.pa = pos[1];                   // Qut
    this.vl = vel[0];                   // Vec3D
    this.va = vel[1];                   // Qut
    this.ml = mass;                     // Scalar

if(Env.qut_en){
    this.rm = Mat3D.aqut2rmat(this.pa); // Mat3D from aqut
}else{
    this.rm = Mat3D.avec2rmat(this.pa); // Mat3D from avec
}

    this.ma0 = Mat3D.unit(new Vec3D(size.y*size.y + size.z*size.z,
                                    size.z*size.z + size.x*size.x,
                                    size.x*size.x + size.y*size.y
                                   ).mulS(mass/3)); // Mat3D
    this.ma = this.rm.mulM(this.ma0); // Mat3D
    this.sz = size;                   // Vec3D
    this.ax0 = Mat3D.unit(size);      // Mat3D
    this.ax = this.rm.mulM(this.ax0); // Mat3D

    this.update = function(dt) {
//	console.log("update");

        var newpl = this.pl.addV(this.vl.mulS(dt)); // Vec3D
	var newpa;
if(Env.qut_en){
        var vadt = Qut.avec2aqut(Qut.aqut2avec(this.va).mulS(dt));
        newpa = vadt.mulQ(this.pa).mulQ(vadt.conj()); // Qut
}else{
        newpa = this.pa.addV(this.va.mulS(dt)); // Vec3D
}

        return new Obj3D([newpl, newpa],
                         [this.vl, this.va],
                         this.ml,
                         this.sz); // Obj3D
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
    var pl1 = o1.pl; // Vec3D
    var pa1 = o1.pa; // Qut
    var vl1 = o1.vl; // Vec3D
    var va1 = o1.va; // Qut
    var ml1 = o1.ml; // Mat3D
    var ma1 = o1.ma; // Mat3D
    var pl2 = o2.pl; // Vec3D
    var pa2 = o2.pa; // Qut
    var vl2 = o2.vl; // Vec3D
    var va2 = o2.va; // Qut
    var ml2 = o2.ml; // Mat3D
    var ma2 = o2.ma; // Mat3D

    var r1 = r.subV(pl1);                            // Vec3D
    var r2 = r.subV(pl2);                            // Vec3D

    var v1, v2;
if(Env.qut_en){
    v1 = vl1.addV(Qut.aqut2avec(va1).mulVo(r1)); // Vec3D
    v2 = vl2.addV(Qut.aqut2avec(va2).mulVo(r2)); // Vec3D
}else{
    v1 = vl1.addV(va1.mulVo(r1)); // Vec3D
    v2 = vl2.addV(va2.mulVo(r2)); // Vec3D
}
    var vr = v2.subV(v1);                            // Vec3D
    var jrc = -(1+e) * vr.mulVi(n);                  // Scalar

    var kl1 = 1/ml1;                                 // Scalar
    var kl2 = 1/ml2;                                 // Scalar
    var ka1 = ma1.tr().mulV(r1.mulVo(n).mulVo(r1));  // Vec3D
    var ka2 = ma2.tr().mulV(r2.mulVo(n).mulVo(r2));  // Vec3D
    var jrm = kl1 + kl2 + ka1.addV(ka2).mulVi(n);    // Scalar

    var jr = jrc / jrm;                              // Scalar
//    console.log(jr);


    var newvl1 = vl1.addV(n.mulS(kl1 * (-jr)));     // Vec3D
    var newvl2 = vl2.addV(n.mulS(kl2 * ( jr)));     // Vec3D
    var newva1, newva2;
if(Env.qut_en){
    newva1 = va1.mulQ(Qut.avec2aqut(ka1.mulS(-jr))); // Qut
    newva2 = va2.mulQ(Qut.avec2aqut(ka2.mulS( jr))); // Qut
}else{
    newva1 = va1.addV(ka1.mulS(-jr)); // Vec3D
    newva2 = va2.addV(ka2.mulS( jr)); // Vec3D
}

    var newo1 = new Obj3D([o1.pl, o1.pa],
                          [newvl1, newva1],
                          o1.ml,
                          o1.sz); // Obj3D
    var newo2 = new Obj3D([o2.pl, o2.pa],
                          [newvl2, newva2],
                          o2.ml,
                          o2.sz); // Obj3D

    return [newo1, newo2];
}
