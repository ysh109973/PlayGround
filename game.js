import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const world = document.querySelector('#world');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#c9e6df');
scene.fog = new THREE.Fog('#c9e6df', 52, 145);
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 220);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.35));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
world.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight('#e9fff0', '#7b9673', 2.15));
const sun = new THREE.DirectionalLight('#fff1cf', 3.2);
sun.position.set(-32, 54, 18); sun.castShadow = true;
sun.shadow.mapSize.set(512, 512);
sun.shadow.camera.left = -48; sun.shadow.camera.right = 48; sun.shadow.camera.top = 48; sun.shadow.camera.bottom = -48;
sun.shadow.bias = -.00035; scene.add(sun);
const mat = (color, roughness=.9) => new THREE.MeshStandardMaterial({ color, roughness });
const mats = {
 grass:mat('#a9c994'), grass2:mat('#b9d1a0'), road:mat('#7d8c83'), sidewalk:mat('#dfddc9'),
 white:mat('#f3eedc'), cream:mat('#eee5ca'), coral:mat('#de9874'), roof:mat('#b97e66'),
 roof2:mat('#7a9c87'), blue:mat('#83b3b0'), window:mat('#9bc9c1',.35), dark:mat('#536d5b'),
 bark:mat('#8d7359'), leaf:mat('#67956b'), leaf2:mat('#87ae72'), yellow:mat('#edc56c'),
 asphalt:mat('#677b74'), water:mat('#87c5c0',.32), line:mat('#eee6c5'),
};
const boxGeo = new THREE.BoxGeometry(1,1,1);
function cube(parent, x,y,z, sx,sy,sz, material, cast=true) {
 const m=new THREE.Mesh(boxGeo,material); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow=cast; m.receiveShadow=true; parent.add(m); return m;
}
function cylinder(parent,x,y,z, rt,rb,h, material, segments=8){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function sphere(parent,x,y,z,r,material,segments=12){const m=new THREE.Mesh(new THREE.SphereGeometry(r,segments,10),material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}

// Soft, walkable neighborhood ground.
const ground = new THREE.Mesh(new THREE.PlaneGeometry(150,150),mats.grass); ground.rotation.x=-Math.PI/2; ground.position.y=-.12; ground.receiveShadow=true;scene.add(ground);
for(let i=0;i<76;i++){
 const x=(Math.random()-.5)*140,z=(Math.random()-.5)*140;
 if(Math.abs(z)<6 || Math.abs(x-12)<6 || x < -27 && Math.abs(z)<30) continue;
 const patch=new THREE.Mesh(new THREE.CircleGeometry(.18+Math.random()*.38,7),Math.random()>.5?mats.grass2:mat('#c5d5a5'));
 patch.rotation.x=-Math.PI/2;patch.position.set(x,-.1,z);patch.scale.set(1+Math.random(),.45+Math.random()*.5,1);scene.add(patch);
}
// Roads, sidewalks, lane marks.
cube(scene,0,-.045,1,128,.12,7.2,mats.asphalt,false);
cube(scene,0,.005,-3.15,128,.14,1.05,mats.sidewalk,false);
cube(scene,0,.005,5.15,128,.14,1.05,mats.sidewalk,false);
cube(scene,12,-.035,0,7.2,.12,110,mats.asphalt,false);
cube(scene,7.85,.005,0,1.05,.14,110,mats.sidewalk,false);
cube(scene,16.15,.005,0,1.05,.14,110,mats.sidewalk,false);
for(let x=-58;x<62;x+=7) cube(scene,x,.027,1,.95,.025,.11,mats.line,false);
// A narrow creek with pale banks, winding along the neighborhood's west side.
function creek(){
 const points=[];for(let i=0;i<=30;i++){const z=-56+i*3.75;points.push(new THREE.Vector3(-25+Math.sin(z*.09)*3,-.035,z));}
 const curve=new THREE.CatmullRomCurve3(points);const geometry=new THREE.TubeGeometry(curve,120,1.45,8,false);const stream=new THREE.Mesh(geometry,mats.water);stream.scale.y=.035;stream.position.y=.12;scene.add(stream);
 const banks=new THREE.Mesh(new THREE.TubeGeometry(curve,120,2.1,8,false),mat('#d2d7b5'));banks.scale.y=.035;banks.position.y=-.005;scene.add(banks);
}
creek();
// Organic paths through the park.
function path(x,z,sx,sz,rotation=0){const p=new THREE.Mesh(new THREE.PlaneGeometry(sx,sz),mat('#d9d5b9'));p.rotation.x=-Math.PI/2;p.rotation.z=rotation;p.position.set(x,.012,z);scene.add(p);}
path(-8,24,32,2.6,-.3);path(-5,17,2.2,17,.1);path(-16,29,18,2.2,.3);path(-9,35,2.2,13,-.3);

// Houses/apartments create a recognizable, intimate Korean neighborhood.
function house(x,z,w,d,color,roofColor,kind='house',rot=0){
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);
 let height=kind==='apt'?8.5:kind==='shop'?4.2:3.5;
 cube(g,0,height/2,0,w,height,d,mat(color));
 if(kind==='apt'){
   cube(g,0,height+.1,0,w+.45,.4,d+.45,mat(roofColor));
   for(let floor=0;floor<4;floor++)for(let col=0;col<Math.max(2,Math.floor(w/2.5));col++) cube(g,-w/2+1.1+col*2.35,1.25+floor*1.72,d/2+.055,1.2,.9,.09,mats.window,false);
   for(let floor=0;floor<4;floor++)for(let col=0;col<Math.max(2,Math.floor(w/2.5));col++) cube(g,-w/2+1.1+col*2.35,1.25+floor*1.72,-d/2-.055,1.2,.9,.09,mats.window,false);
 }else{
   const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.78,1.7,4),mat(roofColor));roof.position.y=height+.75;roof.rotation.y=Math.PI/4;roof.scale.set(1,1,d/Math.max(w,d));roof.castShadow=true;g.add(roof);
   cube(g,0,1.3,d/2+.06,1.05,1.35,.08,mats.window,false);
   cube(g,-w*.28,1.55,d/2+.055,.65,.7,.08,mats.window,false);cube(g,w*.28,1.55,d/2+.055,.65,.7,.08,mats.window,false);
   if(kind==='shop'){cube(g,0,3.55,d/2+.22,w*.8,.5,.28,mats.yellow,false);}
 }
 // little garden wall and planter
 if(kind==='house'){cube(g,0,.34,d/2+.9,w*.77,.65,.2,mat('#d8c9a7'),false);}
 return g;
}
house(-3,-19,8,7,'#eee4c9','#c87f64','house',-.15);
house(5,-30,10,7,'#e3d6b7','#829d83','house',.08);
house(23,-17,8,9,'#e9dfc6','#b98069','house',.2);
house(27,-31,10,8,'#d7e3ce','#77988a','house',-.1);
house(-6,-40,7,8,'#f1e4c9','#c78d6c','house',.15);
house(29,15,12,10,'#e1e6d2','#789685','apt',.08);
house(31,29,11,9,'#ecddc3','#c78e6a','apt',-.04);
house(-10,-5,9,7,'#f5e7cc','#cc8b6a','shop',0);
house(-1,-6,8,7,'#e7e1c9','#718f7e','shop',0);
// School grounds, low classroom wings, yard lines and sign.
cube(scene,-2,.15,40,28,.32,16,mat('#7c9f79'),false);
house(-1,43,17,5,'#efe6cb','#b77963','shop',0);
house(8,43,8,5,'#e8e0c8','#789587','shop',0);
for(let i=0;i<5;i++)cube(scene,-10+i*3,.34,34,2,.035,.15,mat('#f1e5c4'),false);
cube(scene,-2,2.25,36,7,.35,.3,mat('#e6c374'),false);
// Park pavilion and walking loop.
cylinder(scene,-11,.14,28,3.3,3.3,.28,mat('#d7cba9'),12);
cylinder(scene,-11,2.75,28,3.9,3.9,.35,mat('#c98265'),8);
for(let i=0;i<6;i++){let a=i*Math.PI/3;cylinder(scene,-11+Math.cos(a)*2.5,1.35,28+Math.sin(a)*2.5,.12,.12,2.5,mats.white,6);}
cube(scene,-11,.5,28,3,.18,2.5,mat('#977b5e'),false);
// Market, benches and local signposts.
cube(scene,-8,2.2,-1,7,.4,.32,mat('#f1e6c9'),false);
for(let i=0;i<4;i++){cube(scene,-12+i*2.6,.6,6,2.2,.3,.45,mat('#9a815e'),false);cube(scene,-12+i*2.6,1.15,5.8,2.15,.12,.14,mat('#9a815e'),false);}

// Trees and flowering corners.
function tree(x,z,scale=1, autumn=false){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);cylinder(g,0,1.15,0,.25,.38,2.3,mats.bark,7);
 const leaf=autumn?mat('#c6a765'):Math.random()>.5?mats.leaf:mats.leaf2;
 sphere(g,0,2.65,0,1.45,leaf,9);sphere(g,-.7,2.35,.15,1.05,leaf,8);sphere(g,.72,2.3,-.12,1.05,leaf,8);return g;}
for(const [x,z,s] of [[-21,17,1.2],[-19,24,1.1],[-20,34,1.3],[-15,38,.85],[-3,27,1.1],[2,31,.85],[4,21,1],[-20,5,1.15],[-19,-10,1.25],[-14,-19,.9],[18,-8,1],[19,-27,1.2],[23,-37,.9],[38,-14,1.1],[39,4,1.2],[39,23,1.1],[39,39,1.3],[-16,48,1.1],[14,50,1.2],[-40,13,1.4],[44,-42,1.3],[47,50,1.5]])tree(x,z,s,Math.random()<.14);
function flower(x,z,color){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);cylinder(g,0,.28,0,.035,.04,.55,mat('#7d9c67'),5);sphere(g,0,.58,0,.16,mat(color),7);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;sphere(g,Math.cos(a)*.17,.57,Math.sin(a)*.17,.11,mat('#fff1ce'),7);}}
for(let i=0;i<24;i++){const x=-20+Math.random()*14,z=15+Math.random()*24;flower(x,z,['#f2d47b','#fff0d0','#d99e9a'][i%3]);}
// Roadside lamps and subtle fence.
for(let z=-49;z<50;z+=13){cylinder(scene,19,.9,z,.07,.08,1.8,mat('#718478'),7);sphere(scene,19,1.9,z,.23,mat('#f5dda0'),8);}
for(let x=-18;x< -2;x+=2.2){cylinder(scene,x,.55,37,.055,.06,1.1,mat('#f0ead4'),6);}

// Player: a little walker with a soft colored jacket and satchel.
const player=new THREE.Group();scene.add(player);
const bodyMat=mat('#d98968'), pantsMat=mat('#577c70'), skinMat=mat('#e9b995'), hairMat=mat('#594a3e');
cylinder(player,0,.86,0,.34,.42,1.05,bodyMat,9);
sphere(player,0,1.65,0,.36,skinMat,12);sphere(player,0,1.86,-.05,.36,hairMat,10);
cube(player,0,1.55,-.33,.42,.3,.16,hairMat,false);
const armL=cylinder(player,-.42,.84,0,.11,.14,.72,skinMat,7);armL.rotation.z=-.17;
const armR=cylinder(player,.42,.84,0,.11,.14,.72,skinMat,7);armR.rotation.z=.17;
cube(player,-.24,.45,-.08,.24,.18,.3,mat('#e7c56e'));
const legL=cylinder(player,-.16,.22,0,.12,.15,.45,pantsMat,7),legR=cylinder(player,.16,.22,0,.12,.15,.45,pantsMat,7);
player.position.set(-5,0,13); player.rotation.y=Math.PI;

// Five little glimmers placed at local points of interest.
const collectiblePositions=[[-13,0,22],[2,0,28],[-5,0,-1],[5,0,38],[26,0,-27]];
const collectibles=[];
for(const [x,y,z] of collectiblePositions){const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);
 const glow=new THREE.Mesh(new THREE.SphereGeometry(.31,12,10),new THREE.MeshBasicMaterial({color:'#fff1ab',transparent:true,opacity:.43}));g.add(glow);
 const core=new THREE.Mesh(new THREE.OctahedronGeometry(.2,0),new THREE.MeshStandardMaterial({color:'#ffe78b',emissive:'#d6a542',emissiveIntensity:1.2,roughness:.3}));core.position.y=.05;g.add(core);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.36,.035,6,20),new THREE.MeshBasicMaterial({color:'#fff2bd',transparent:true,opacity:.8}));ring.rotation.x=Math.PI/2;g.add(ring);collectibles.push({group:g,core,ring,found:false,baseY:1.1});}

// Tiny cars follow the quiet neighborhood roads.
function makeCar(color,x,z,rotation=0){const g=new THREE.Group();scene.add(g);g.position.set(x,.1,z);g.rotation.y=rotation;
 cube(g,0,.55,0,2.05,.58,1.08,mat(color));cube(g,0,1.02,-.05,1.18,.5,.85,mat('#b9d5ce',.35));
 for(const wx of [-.67,.67])for(const wz of [-.57,.57]){const wheel=cylinder(g,wx,.27,wz,.23,.23,.17,mat('#45544e'),8);wheel.rotation.z=Math.PI/2;}
 cube(g,0,.28,.57,.45,.17,.04,mat('#f8df9b'),false);return g;}
const cars=[makeCar('#c98066',-26,1,0),makeCar('#e6c67c',34,1,Math.PI),makeCar('#789c92',12,-35,Math.PI/2),makeCar('#d6e0c5',12,42,-Math.PI/2)];
let carT=0;

// A few slow clouds keep the sky alive without pulling attention away from the walk.
const clouds=[];
for(let i=0;i<6;i++){
 const cloud=new THREE.Group();cloud.position.set(-45+i*18,16+Math.random()*5,-48+Math.random()*26);scene.add(cloud);
 for(let j=0;j<4;j++)sphere(cloud,(j-1.5)*1.25,Math.random()*.38,0,1.05,mat('#f3f5e8'),9);
 clouds.push(cloud);
}

const keys=new Set();let joy={x:0,y:0,active:false};let viewAngle=0,lookMode=false,started=false,foundCount=0,walkTime=0;
const startOverlay=document.querySelector('#start-overlay'),completeOverlay=document.querySelector('#complete-overlay');
const progressFill=document.querySelector('#progress-fill'),progressLabel=document.querySelector('#progress-label');
const playerDot=document.querySelector('#player-dot');
const locationLabel=document.querySelector('#location-label');
const toast=document.querySelector('#toast'),collectionToast=document.querySelector('#collection-toast');
let toastTimer,collectTimer;
function announce(text){toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2100);}
function showCollection(){collectionToast.classList.add('show');clearTimeout(collectTimer);collectTimer=setTimeout(()=>collectionToast.classList.remove('show'),1750);}
function updateProgress(){progressFill.style.width=`${foundCount*20}%`;progressLabel.innerHTML=`${foundCount} <span>/ 5</span>`;}

// Optional gentle chime, enabled by a direct user gesture for browser audio policies.
let audioContext=null,soundOn=false;
function chime(){if(!soundOn)return;try{audioContext??=new AudioContext();const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=660+Math.random()*220;gain.gain.setValueAtTime(.0001,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.055,audioContext.currentTime+.04);gain.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+.75);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+.8);}catch{}}
document.querySelector('#sound-toggle').addEventListener('click',e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?'♫':'♪';e.currentTarget.setAttribute('aria-label',soundOn?'소리 끄기':'소리 켜기');if(soundOn){audioContext??=new AudioContext();chime();}});

function beginWalk(){started=true;startOverlay.classList.add('hidden');announce('상안동 산책길에 오신 걸 환영해요');}
document.querySelector('#start-button').addEventListener('click',beginWalk);
document.querySelector('#again-button').addEventListener('click',()=>{foundCount=0;updateProgress();collectibles.forEach(c=>{c.found=false;c.group.visible=true;});player.position.set(-5,0,13);completeOverlay.classList.add('hidden');started=true;});
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key==='Shift')keys.add('shift');});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));

// Thumbstick for touch screens.
const joystick=document.querySelector('#joystick'),knob=document.querySelector('#joy-knob');let joyPointer=null;
function setJoy(e){const r=joystick.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),max=r.width*.34,len=Math.hypot(dx,dy),scale=len>max?max/len:1;joy.x=dx*scale/max;joy.y=dy*scale/max;knob.style.transform=`translate(calc(-50% + ${dx*scale}px),calc(-50% + ${dy*scale}px))`;}
joystick.addEventListener('pointerdown',e=>{e.preventDefault();joyPointer=e.pointerId;joystick.setPointerCapture(joyPointer);joy.active=true;setJoy(e);});
joystick.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)setJoy(e);});
function releaseJoy(){joyPointer=null;joy.active=false;joy.x=0;joy.y=0;knob.style.transform='translate(-50%,-50%)';}
joystick.addEventListener('pointerup',releaseJoy);joystick.addEventListener('pointercancel',releaseJoy);

// Dragging the 3D view gently orbits; it never affects movement or browser page scroll.
let drag=null;
renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;viewAngle+=(e.clientX-drag.x)*.004;drag.x=e.clientX;drag.y=e.clientY;});
renderer.domElement.addEventListener('pointerup',()=>drag=null);renderer.domElement.addEventListener('pointercancel',()=>drag=null);
const lookButton=document.querySelector('#look-button');lookButton.addEventListener('click',()=>{lookMode=!lookMode;lookButton.style.background=lookMode?'#e7f2dd':'#f8faefdc';announce(lookMode?'둘러보기 모드예요 · 화면을 드래그해보세요':'산책 모드로 돌아왔어요');});

function nearbyPlace(){const x=player.position.x,z=player.position.z;
 if(Math.hypot(x+11,z-28)<13)return '상안공원';
 if(Math.hypot(x+2,z-40)<12)return '상안초등학교 앞';
 if(Math.hypot(x+4,z+3)<11)return '마을상점 거리';
 if(Math.hypot(x-22,z+24)<14)return '조용한 주택가';
 if(Math.hypot(x+24,z-2)<15)return '상안마을 산책길';
 return '상안마을 입구';
}
function updateMap(){const el=document.querySelector('#mini-map'),w=el.clientWidth,h=el.clientHeight;const px=Math.max(5,Math.min(w-9,(player.position.x+45)/90*w));const py=Math.max(5,Math.min(h-9,(52-player.position.z)/104*h));playerDot.style.left=`${px}px`;playerDot.style.top=`${py}px`;const place=nearbyPlace();if(locationLabel.textContent!==place)locationLabel.textContent=place;}

const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04),time=clock.elapsedTime;
 if(started){
  let mx=0,mz=0;if(keys.has('w')||keys.has('arrowup'))mz-=1;if(keys.has('s')||keys.has('arrowdown'))mz+=1;if(keys.has('a')||keys.has('arrowleft'))mx-=1;if(keys.has('d')||keys.has('arrowright'))mx+=1;
  if(joy.active){mx+=joy.x;mz+=joy.y;}
  const mag=Math.hypot(mx,mz);if(mag>1){mx/=mag;mz/=mag;}
  if(mag>.08){const speed=(keys.has('shift')?2.05:4.15);const cos=Math.cos(viewAngle),sin=Math.sin(viewAngle);const dx=(mx*cos+mz*sin)*speed*dt,dz=(-mx*sin+mz*cos)*speed*dt;
   player.position.x=THREE.MathUtils.clamp(player.position.x+dx,-51,52);player.position.z=THREE.MathUtils.clamp(player.position.z+dz,-53,54);
   player.rotation.y=Math.atan2(dx,dz);walkTime+=dt*10;legL.rotation.x=Math.sin(walkTime)*.42;legR.rotation.x=-Math.sin(walkTime)*.42;armL.rotation.x=-Math.sin(walkTime)*.28;armR.rotation.x=Math.sin(walkTime)*.28;
  }else{legL.rotation.x*=.8;legR.rotation.x*=.8;armL.rotation.x*=.8;armR.rotation.x*=.8;}
  // Avoid walking through the creek or directly into the nearest house blocks.
  const creekX=-25+Math.sin(player.position.z*.09)*3;if(player.position.x<creekX+3.1&&player.position.x>creekX-4.1)player.position.x=creekX+3.2;
  const obstacles=[[-3,-19,5.1,4.7],[5,-30,6.1,5.1],[23,-17,5.2,5.8],[27,-31,6.2,5.5],[-6,-40,4.5,5.3],[29,15,7.2,6.1],[31,29,6.8,5.9],[-10,-5,5.7,4.8],[-1,-6,5.1,4.8]];
  for(const [x,z,rx,rz] of obstacles){const ox=player.position.x-x,oz=player.position.z-z;if(Math.abs(ox)<rx&&Math.abs(oz)<rz){if(Math.abs(ox/rx)>Math.abs(oz/rz))player.position.x=x+Math.sign(ox||1)*rx;else player.position.z=z+Math.sign(oz||1)*rz;}}
  collectibles.forEach(c=>{if(c.found)return;const d=player.position.distanceTo(c.group.position);if(d<2.1){c.found=true;c.group.visible=false;foundCount++;updateProgress();showCollection();chime();if(foundCount===5){setTimeout(()=>completeOverlay.classList.remove('hidden'),900);}else announce(['공원 길목에서','학교 담장 곁에서','가게 앞 골목에서','꽃밭 옆에서','조용한 주택가에서'][foundCount-1]+' 작은 빛을 발견했어요');}});
 }
 // Follow from above and behind; a soft orbit lets players look around the map.
 const offset=new THREE.Vector3(Math.sin(viewAngle)*19+14,22,Math.cos(viewAngle)*23+5);
 const target=new THREE.Vector3(player.position.x,1.3,player.position.z);
 camera.position.lerp(target.clone().add(offset),1-Math.exp(-dt*3.1));camera.lookAt(target.x,1.15,target.z-3);
 collectibles.forEach((c,i)=>{if(c.found)return;c.group.position.y=c.baseY+Math.sin(time*1.6+i)*.14;c.core.rotation.y=time*.65;c.ring.rotation.z=time*.55;});
 cars.forEach((car,i)=>{const dir=i%2===0?1:-1;car.position.x+=dir*dt*(i<2?2.5:0);if(i<2&&car.position.x>61)car.position.x=-61;if(i<2&&car.position.x< -61)car.position.x=61;if(i>=2){car.position.z+=dir*dt*1.8;if(car.position.z>54)car.position.z=-54;if(car.position.z< -54)car.position.z=54;}});
 clouds.forEach((c,i)=>{c.position.x+=dt*(.24+i*.025);if(c.position.x>75)c.position.x=-75;});
 updateMap();renderer.render(scene,camera);
}
animate();
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));});
