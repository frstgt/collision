onload = function () {
    var canvas = document.getElementById("test_canvas");
    if (!canvas || !canvas.getContext) { return false; }
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ceceff";//描画色を指定

    Env.context = ctx;

    /**/

    var sim2D = true;
    var sim3D = !sim2D;

    var timer;//タイマー
    var delay = 10;//タイマーを実行する間隔

if(sim2D){
    var c1 = new Vec2D(canvas.width * 0.25, canvas.height * 0.5);
    var c2 = new Vec2D(canvas.width * 0.75, canvas.height * 0.5);

    var m1 = new Mat2D(new Vec2D(100, 0), new Vec2D(0, 80));
    var m1r = Mat2D.rot(Scalar.deg2rad(-0.3));

    var m2 = new Mat2D(new Vec2D(120, 0), new Vec2D(0, 60));
    var m2r = Mat2D.rot(Scalar.deg2rad(0.7));
}

if(sim3D){
    var c1 = new Vec3D(canvas.width * 0.25, canvas.height * 0.5, 200);
    var c2 = new Vec3D(canvas.width * 0.75, canvas.height * 0.5, 200);

    var m1 = new Mat3D(new Vec3D(100, 0, 0),
                       new Vec3D(0, 80, 0),
                       new Vec3D(0, 0, 60));
    var m1r = Mat3D.rot(new Vec3D(2,3,7).unit(), Scalar.deg2rad(0.3));

    var m2 = new Mat3D(new Vec3D(120, 0, 0),
                       new Vec3D(0, 60, 0),
                       new Vec3D(0, 0, 40));
    var m2r = Mat3D.rot(new Vec3D(11,13,17).unit(), Scalar.deg2rad(0.7));
}

    var loop = function() {
        Env.context.clearRect(0, 0, canvas.width, canvas.height);

if(sim2D){
        Box2D.draw(c1, m1);
        Box2D.draw(c2, m2);

        var mg = Box2D.magnet(c1, m1, c2, m2);

        var t1 = c1.addV(mg[0][0]);
        var t2 = c2.addV(mg[1][0]);

        Draw2D.draw_point(t1);
        Draw2D.draw_point(t2);   
        Draw2D.draw_line(t1, t2);

        m1 = m1r.mulM(m1);
        m2 = m2r.mulM(m2);
}

if(sim3D){
        Box3D.draw(c1, m1);
        Box3D.draw(c2, m2);

        var mg = Box3D.magnet(c1, m1, c2, m2);

        var t1 = c1.addV(mg[0][0]);
        var t2 = c2.addV(mg[1][0]);

        Draw3D.draw_point(t1);
        Draw3D.draw_point(t2);   
        Draw3D.draw_line(t1, t2);

        m1 = m1r.mulM(m1);
        m2 = m2r.mulM(m2);
}

        clearTimeout(timer);
        timer = setTimeout(loop, delay);
    }
    loop();
}
