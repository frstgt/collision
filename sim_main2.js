onload = function () {
    var canvas = document.getElementById("sim_canvas");
    if (!canvas || !canvas.getContext) { return false; }
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ceceff";//描画色を指定

    Env.context = ctx;

    /**/

    var sim3D = true;
    var objNum = 5;

    function World3D(size, func, num) {
        this.pl = size;
        this.sz = size;
        this.ax = Mat3D.unit(size);

        this.obj = [];
        while(this.obj.length < num){
            var o = func();
            var c = false;
            for(var i=0; i<this.obj.length; i++){
                c = Obj3D.collision_check(o, this.obj[i]);
                if(c){
                     break;
                }
            }
            if(!c){
                this.obj.push(o);
            }
        }
        this.collision = [];

	this.border_bound = function(w, o, e) {
	    if(Math.abs(o.pl.x - w.pl.x) > w.sz.x){
		o.vl.x = -e * o.vl.x;
	    }
	    if(Math.abs(o.pl.y - w.pl.y) > w.sz.y){
		o.vl.y = -e * o.vl.y;
	    }
	    if(Math.abs(o.pl.z - w.pl.z) > w.sz.z){
		o.vl.z = -e * o.vl.z;
	    }
	}
        this.update = function(dt){

	    var new_obj = [];

            // create new object
            for(var i=0; i<this.obj.length; i++) {
                new_obj.push(this.obj[i].update(dt));
            }

            // collision check
            this.collision = [];
            for(var o1_i=0; o1_i<this.obj.length; o1_i++) {
                for(var o2_i=0; o2_i<this.obj.length; o2_i++) {
                    if(o1_i < o2_i){
                        var c = Obj3D.collision_check(new_obj[o1_i],
                                                      new_obj[o2_i]);
                        if(c){
                            this.collision.push([o1_i, o2_i]);
			}
                    }
                }
            }

            if(this.collision.length <= 0){
		// update
		for(var i=0; i<this.obj.length; i++) {
                    this.obj[i] = new_obj[i];
		}

		// world bound
		for(var i=0; i<this.obj.length; i++) {
                    this.border_bound(this, this.obj[i], 1.00);
		}
	    }else{

		for(var i=0; i<this.collision.length; i++){
                    var o1_i = this.collision[i][0];
                    var o2_i = this.collision[i][1];
		    var rn = Obj3D.collision_point(this.obj[o1_i],
						   this.obj[o2_i]);
		    var r = rn[0];
		    var n = rn[1];

                    Draw3D.draw_point(r);
                    n.mulS(10).draw(r);

		    var oo = Obj3D.collision_update(this.obj[o1_i],
						    this.obj[o2_i],
						    r, n, 0.9);
		    this.obj[o1_i] = oo[0];
		    this.obj[o2_i] = oo[1];
		}
            }
        }
        this.draw = function(){
            // draw world
            Box3D.draw(this.pl, this.ax);

            // draw objects
            for(var i=0; i<this.obj.length; i++) {
                this.obj[i].draw();
            }
        }
    }

    /**/

    var timer;//タイマー
    var delay = 10;//タイマーを実行する間隔

    var obj3d_rand = function() {
if(Env.qut_en){
        return new Obj3D([Vec3D.rand(0, 500),
			  Qut.aqut_rand(-Math.PI/4, Math.PI/4)],
                         [Vec3D.rand(200, 500),
			  Vec3D.avec_rand(-Math.PI/4, Math.PI/4)],
                         Scalar.rand(1e-6, 5e-6), Vec3D.rand(50, 100));
}else{
        return new Obj3D([Vec3D.rand(0, 500),
			  Vec3D.avec_rand(-Math.PI/4, Math.PI/4)],
                         [Vec3D.rand(200, 500),
			  Vec3D.avec_rand(-Math.PI/4, Math.PI/4)],
                         Scalar.rand(1e-6, 5e-6), Vec3D.rand(50, 100));
}
    }
    var w = new World3D(new Vec3D(250, 250, 250), obj3d_rand, objNum);

//    console.log("start");

    var loop = function() {
        Env.context.clearRect(0, 0, canvas.width, canvas.height);

        w.draw();
        w.update(0.001);

        clearTimeout(timer);
        timer = setTimeout(loop, delay);
    }
    loop();
}
