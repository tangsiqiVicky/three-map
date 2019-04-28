<template>
  <div :id="id">
  </div>
</template>

<script>
import * as THREE from "three";
import * as SVGLoader from "three-svg-loader";
import * as TWEEN from "three-tween";
import SpriteText from '../assets/MapLibs/SpriteText';
import 'three-trackballcontrols'
// import * as OrbitControls from "three-orbit-controls";
const OrbitControls = require('three-orbit-controls')(THREE);
// const SVGLoader = require('three-svg-loader')(THREE);
export default {
  name: 'Map',
  data(){
    return {
      scene: '',
      renderer: '',
      light: '',
      light2: '',
      light3: '',
      camera: '',
      fov: 65,
      controls: '',
      loader: '',
      tween: '',
      raycaster: new THREE.Raycaster(),
      mouse: new THREE.Vector2(),
      intersected: '',
      }
    },
  props:['param','id'],
  methods:{
    init(){
      this.scene = new THREE.Scene();
      // this.scene.add(new THREE.AmbientLight(0x999999));//环境光

      this.camera = new THREE.PerspectiveCamera(this.fov, window.innerWidth / window.innerHeight, 0.1, 10000);
      // this.camera.position.set(0, 800, 800);

        if(this.param.defaultMapScaleLevel && this.param.defaultMapScaleLevel<23) {
            var ScaleLevel=500+300*(20-this.param.defaultMapScaleLevel);
            this.camera.position.set(this.camera.position.x,ScaleLevel,ScaleLevel);
          }else{
            this.camera.position.set( 0, 600, 600);
          }
           //渲染
      this.renderer = new THREE.WebGLRenderer({antialias: true, precision:'highp',logarithmicDepthBuffer: true});//会在body里面生成一个canvas标签,
      //为了兼容高清屏幕
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      let ClearColor=this.param.theme?this.param.theme:"#ffffff";
      this.renderer.setClearColor(ClearColor,1);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.shadowMap.enabled = true;



      const container = document.getElementById(this.id);
      container.appendChild(this.renderer.domElement);


      // //三维辅助线
      // var axes=new THREE.AxisHelper(20);
      // this.scene.add(axes);
      //辅助格
      // var gridHelper = new THREE.GridHelper( 1000, 10 );
      //this.scene.add(gridHelper);

       //初始化控制器
      this.controls = new OrbitControls(this.camera);


      this.light = new THREE.PointLight("#ffffff");
      this.light.position.set(100,500,100);
      this.light.castShadow=true;
        this.scene.add(this.light);

      this.light2 = new THREE.DirectionalLight("#a4f6ff");
      this.light2.position.set(100,50,100);
      this.light2.castShadow=true;
      this.scene.add(this.light2);

      this.light3 = new THREE.DirectionalLight("#a4f6ff");
      this.light3.position.set(100,100,-1600);
      this.light3.castShadow=true;
      this.scene.add(this.light3);



      this.loadSvgObj(this.param.SVG)

      this.initControls()

      //位置x，位置z(相当于平面y)，绘制圆的半径，楼层的高度，楼层数
      // this.drawShape(100,100,20,62,1);

  	},
    initControls(){

      this.controls.enableDamping = true;
      //动态阻尼系数 就是鼠标拖拽旋转灵敏度
      // this.controls.dampingFactor = 0.25;
      //是否可以缩放
      this.controls.enableZoom = true;
      //是否自动旋转
      this.controls.autoRotate = true;
      //设置相机距离原点的最近距离
      //controls.minDistance  = 0;
      //设置相机距离原点的最远距离
      //controls.maxDistance  = 5200;
      //是否开启右键拖拽
      this.controls.enablePan = true;
      //最大仰视角和俯视角
      this.controls.minPolarAngle =  0; // radians
      //this.controls.maxPolarAngle = Math.PI/2+0.5; // radians

      //水平方向视角限制
      this.controls.minAzimuthAngle = - Infinity; // radians
      this.controls.maxAzimuthAngle = Infinity; // radians
      //惯性滑动，滑动大小默认0.25
      this.controls.enableDamping = false;
      this.controls.dampingFactor = 0.25;


    },
    loadSvgObj(SVGparam){
      this.loader = new SVGLoader()
        //子健的数量
      let counterNub=Object.keys(SVGparam).length;
      //最大负楼层
      let undergroundFloor=0;

      for(let k in SVGparam){
        let depthY = 0
        if(this.param.gapValue && counterNub>1){
          if(typeof SVGparam[k].floor!=="number"){
            undergroundFloor=(-SVGparam[k].floor.match(/\d+/g)[0])<undergroundFloor?(-SVGparam[k].floor.match(/\d+/g)[0]):undergroundFloor;
            depthY=(-SVGparam[k].floor.match(/\d+/g)[0]+1)*SVGparam[k].depth+(-SVGparam[k].floor.match(/\d+/g)[0])*this.param.gapValue
          }else{
             depthY=SVGparam[k].floor*SVGparam[k].depth+(SVGparam[k].floor-1)*this.param.gapValue
          }
        }else{
              depthY=SVGparam[k].depth
        }

        this.loadSvgFn(SVGparam[k].SVGurl,depthY,SVGparam[k].depth,SVGparam)

      }
    if(counterNub>1){
        if(undergroundFloor<0){
          this.camera.lookAt(new THREE.Vector3(0,(counterNub+undergroundFloor-1)/2*this.param.gapValue,0));
          this.controls.target = new THREE.Vector3(0,(counterNub+1)/2*this.param.gapValue,0)
        }else{
          this.camera.lookAt(new THREE.Vector3(0,(counterNub+1)/2*this.param.gapValue,0));
          this.controls.target = new THREE.Vector3(0,(counterNub+1)/2*this.param.gapValue,0);
        }

        this.controls.maxPolarAngle = Math.PI/2+0.5; // radians
      }else{
        this.camera.lookAt(new THREE.Vector3(0,(counterNub+1)/2*this.param.gapValue,0));
        this.controls.target = new THREE.Vector3(0,(counterNub+1)/2*this.param.gapValue,0);
        // this.controls.maxPolarAngle = Math.PI/2; // radians
      }

  	},
    loadSvgFn(url,depthY,paramDepth,SVGparam){

      this.loader.load(url,(pathsObj)=> {
        //把svg每块绘制到组里，对组进行变形转换
        let group = new THREE.Group();
        group.scale.multiplyScalar( 1 );


        if(viewBoxW && viewBoxH){
          //向左移动SVG地图画布宽度的一半
          group.position.x =-viewBoxW/2;
          //向上移动SVG地图画布高度的一半
          group.position.z =-viewBoxH/2;
        }
          //需要和生成的模型顶部高度相同  createMesh()中的options.depth 默认30
          //group.position.y =SVGparam[k].depth?SVGparam[k].depth:30;

          group.position.y =depthY?depthY:30;
          group.rotation.x = Math.PI / 2;

        for(var i in pathsObj){
          var path = pathsObj[ i ];
          var material = new THREE.MeshBasicMaterial({
              color: path.color,
              side: THREE.DoubleSide,
              depthWrite: false
            })
          var shapes = path.toShapes( true );
          for ( var j = 0; j < shapes.length; j ++ ) {
            var shape = shapes[ j ];
            var geometry = new THREE.ShapeBufferGeometry( shape );
            var mesh = new THREE.Mesh( geometry, material );

            //对svg边缘添加线并不是生成的模型添加线，如果是给模型添加放入createMesh()里面的对象
                var edgesMtl =  new THREE.LineBasicMaterial({color: "#0a2c61"});//#0a2c61
                var cubeEdges = new THREE.EdgesGeometry(geometry, 1);
                var cubeLine = new THREE.LineSegments(cubeEdges, edgesMtl);
                //只要包含高度的都不显示边缘线
            if(!(i.match(/plane/g)) && !(i.match(/height/g))){
              group.add( mesh );
            }
                mesh.add(cubeLine);
          }
          //如果svg中的i包含高度信息，那么他就生成相应的高度，否则生成SVGparam[k].depth的高度

            if(i.match(/height\d+/g)){
              var depthValue=i.match(/height\d+/g)[0].replace("height","");
              var planeHeight=i.match(/plane/g)?depthValue:30
              var differenceValue=depthValue-planeHeight;
              if(!(i.match(/plane/g))){
                this.createMesh(shapes,path.color,{X:group.position.x,Y:depthY-paramDepth+differenceValue+2,Z:group.position.z},i,depthValue);
              }else{
                this.createMesh(shapes,path.color,{X:group.position.x,Y:depthY-paramDepth,Z:group.position.z},i,depthValue);
              }

            }else{
              //把svg每块传入createMesh模型中
              this.createMesh(shapes,path.color,{X:group.position.x,Y:depthY,Z:group.position.z},i,paramDepth);
            }
        }
        //把svg绘制的组放入场景中
        this.scene.add( group );

        for(let k in SVGparam){
          if("undefined" !== typeof newTextCont){
            this.storeName(newTextCont,depthY,SVGparam.textSize)
          };
          // // //把svg中的文本传入店铺名称模型
          if("undefined" !== typeof newImgCont){
            this.safeIcon(newImgCont,depthY, SVGparam.iconScale)
          };
        }
          // //把svg中的文本传入店铺名称模型

      })

    },
    //店铺文字内容 默认14及位置模型
    storeName(newTextCont,Py,textSize){

      var arrayOptions = {
        textSize: textSize?textSize:14
      };

      for(var i in newTextCont){

        let sprite=new SpriteText(i, {
            center: new THREE.Vector2( 0.5, 0.5 ),
            position: new THREE.Vector3( newTextCont[i][0]-viewBoxW/2+i.length*arrayOptions.textSize/2, arrayOptions.textSize/2+Py, newTextCont[i][1]-viewBoxH/2-arrayOptions.textSize/2 ),
            fontColor: "#000000",
            textHeight: arrayOptions.textSize,
            bold: false,
            italic: false,
        });

        this.scene.add(sprite)
      }
    },

    //公共icon及位置信息模型
    //生成粒子的方法
    safeIcon(newImgCont,Py,iconScale){
      for(var i in newImgCont){
        //console.log(i)
        var newIName=i.replace(/more\d+/,"")
        var texture = new THREE.TextureLoader().load(require('@/assets/image/'+newIName+'.png'));
        var spriteMaterial = new THREE.SpriteMaterial({
              opacity: 1,
              color: "#ffffff",
              transparent: true,
              map: texture
          });

          //spriteMaterial.depthTest = false;
          //spriteMaterial.blending = THREE.AdditiveBlending;
          var sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.x=sprite.scale.y=sprite.scale.z=iconScale?iconScale:30;
            sprite.position.set(newImgCont[i][0]-viewBoxW/2+15, sprite.scale.x/2+Py, newImgCont[i][1]-viewBoxH/2+15);
            sprite.rotation.y = -Math.PI / 2;
            this.scene.add(sprite);
      }
    },
    //生成模型
    createMesh(obj,color,position,objName,depth) {
      var group = new THREE.Group();
      // 创建基础纹理
      var meshMaterial = new THREE.MeshLambertMaterial({
              color:color,
              name:objName,
              flatShading: THREE.FlatShading,
              transparent: true,
              opacity: 0.8
      });

      //深度(拔出的高度)默认30,斜角的深度，斜角的高度，斜角的分段数，斜角开关，定拉伸体沿深度方向分成多少段
      var options = {
              depth:depth?depth:30,
              bevelEnabled: false
          };
      var mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(obj,options), meshMaterial);
        mesh.position.x = position.X;
        mesh.position.y = position.Y;
        mesh.position.z = position.Z;
        //由于图形时反的，让图形翻个个
            mesh.rotation.x = Math.PI/2;
            //mesh.rotation.z = -Math.PI/2;
            //给每个模型添加名称：svg中的id
            mesh.name=meshMaterial.name;
          this.scene.add(mesh);

    },
    drawShape(Px,Pz,aRadius,heightfloor,nubfloor){

    var Py=(nubfloor<0)?((nubfloor+1)*heightfloor+nubfloor*this.param.gapValue+1 ): (nubfloor*heightfloor+(nubfloor-1)*this.param.gapValue+1)
    var shape = new THREE.Shape();
        shape.arc(0,0,aRadius,0,2*Math.PI,false);

        var newShape = new THREE.ShapeGeometry(shape);
        var colorRandom=["#ff9c00","#8fcb1c","#ff2929","#29b1ff"]
        // 创建纹理
        var material = new THREE.MeshBasicMaterial({
          color:0xff0000,//colorRandom[Math.floor(Math.random()*4)],
      flatShading: THREE.FlatShading,
      transparent: true,
      opacity: 1
        });
        material.side = THREE.DoubleSide;//设置成两面都可见
        var mesh = new THREE.Mesh(newShape,material);
        mesh.position.x=Px;
        mesh.position.y=Py;
        mesh.position.z=Pz;
        mesh.rotation.x = -Math.PI / 2;

        var edgesMtl =  new THREE.LineBasicMaterial({
          color: "#ff0000",
          flatShading: THREE.FlatShading,
      transparent: true,
      opacity:1
      });//#0a2c61
    var cubeEdges = new THREE.EdgesGeometry(newShape, 1);
    var cubeLine = new THREE.LineSegments(cubeEdges, edgesMtl);
      cubeLine.scale.x=cubeLine.scale.y=1
      mesh.add(cubeLine)


        if(material.color.getHexString()=="ff2929"){
          mesh.name="shapeRed";
        }else{
          mesh.name="no";
        }
        this.scene.add(mesh);

        //补间动画方法调用与参数
        //对象，变化的属性，开始值，结束值，变化时间
        this.initTween({
          obj:cubeLine,
          attrName:cubeLine.scale,
          strat:4,
          end:0,
          time:600
        });

  },
  initTween(param){

      var changeName = {
        x:param.attrName.x?param.attrName.x:console.log("不存在：param.attrName.x"),
        y:param.attrName.y?param.attrName.y:console.log("不存在：param.attrName.y"),
        z:param.attrName.z?param.attrName.z:console.log("不存在：param.attrName.z"),
      };

          this.tween = new TWEEN.Tween(changeName).to({x:param.attrName.x+param.strat}, param.time);
          this.tween.easing(TWEEN.Easing.Sinusoidal.InOut);

          var tweenBack = new TWEEN.Tween(changeName).to({x:param.attrName.x-param.end}, param.time);
          tweenBack.easing(TWEEN.Easing.Sinusoidal.InOut);
          this.tween.chain(tweenBack);
          tweenBack.chain(this.tween);

          //回调
          var onUpdate = function () {
              param.attrName.x=param.attrName.y=changeName.x;
          };

          this.tween.onUpdate(onUpdate);
          tweenBack.onUpdate(onUpdate);
          this.tween.start();
    },
    animate(){

      if(this.param.upDateAct){
        this.controls.update();
      }
      TWEEN.update();
      //获取角度
      let angle = this.controls.getAzimuthalAngle();
      this.render()
      requestAnimationFrame(this.animate);

    },
    render() {
        this.renderer.render(this.scene, this.camera)
    },
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    },
    onMouseClick(event){

    //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
    //手机端的兼容
    if(event.clientX){
      this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }else{
        this.mouse.x = ( event.changedTouches[0].clientX / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ( event.changedTouches[0].clientY / window.innerHeight ) * 2 + 1;
    }

    // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
    this.raycaster.setFromCamera( this.mouse, this.camera );
    // 获取raycaster直线和所有模型相交的数组集合
    var intersects = this.raycaster.intersectObjects( this.scene.children);
    //console.log(intersects);
    if(intersects.length > 0){
                          //不能选择属性是“PlaneGeometry”的对象，这是大地
      //console.log(intersects[ 0 ].object.name)
      if(this.intersected != intersects[ 0 ].object && (!intersects[ 0 ].object.name.match(/plane/g))){
        if ( this.intersected ) this.intersected.material.color.setHex( this.intersected.currentHex );
        this.intersected = intersects[ 0 ].object;
        this.intersected.currentHex = this.intersected.material.color.getHex();
        this.intersected.material.color.setHex(this.param.clickColor);

        //console.log(intersects[ 0 ].object)
      }
    }else{
      if ( this.intersected ) this.intersected.material.color.setHex( this.intersected.currentHex );
      this.intersected = null;
    }
  }
  },

  mounted(){
    this.init()
    this.animate()
    window.addEventListener('scroll', e => e.preventDefault())

    //点击事件因为有参数，所以匿名
    window.addEventListener( 'click',  e =>{this.onMouseClick(e)}, false );
    //手机端点击事件
    window.addEventListener( 'touchstart', e =>{this.onMouseClick(e)}, false );
    //监听窗口大小的改变
    window.addEventListener( 'resize', this.onWindowResize, false );



  }
}
</script>

