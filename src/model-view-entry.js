import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import {STLLoader} from 'three/addons/loaders/STLLoader.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
window.YimuModelView=function(asset,url,onCover,options={}){
 const host=document.createElement('div');host.className='model-view';const message=document.createElement('small');message.textContent='正在读取模型…';host.append(message);
 let renderer,controls,object,resize,observer,disposed=false;const abort=new AbortController();
 function disposeObject(){object?.traverse(node=>{node.geometry?.dispose();for(const material of Array.isArray(node.material)?node.material:node.material?[node.material]:[]){for(const value of Object.values(material))if(value?.isTexture)value.dispose();material.dispose();}});}
 function dispose(){if(disposed)return;disposed=true;abort.abort();observer?.disconnect();resize?.disconnect();controls?.dispose();disposeObject();renderer?.dispose();renderer?.forceContextLoss();}
 observer=new MutationObserver(()=>{if(!host.isConnected)dispose();});
 setTimeout(async()=>{if(!host.isConnected)return;observer.observe(document.body,{subtree:true,childList:true});try{
  if(asset.size>64*1024*1024)throw Error('模型超过 64 MB，请用默认应用打开');
  const response=await fetch(url,{signal:abort.signal});if(!response.ok)throw Error('模型文件无法读取');const buffer=await response.arrayBuffer();
  if(asset.ext==='obj'){
   const text=new TextDecoder().decode(buffer),loader=new OBJLoader();
   if(/^\s*mtllib[ \t]/m.test(text)){const resources=await window.yimu.command('modelResources',asset.id),manager=new THREE.LoadingManager();manager.setURLModifier(value=>{if(/^(data:|blob:)/.test(value))return value;const parts=[];for(const part of value.replaceAll('\\','/').split('/')){if(part==='..')parts.pop();else if(part&&part!=='.')parts.push(part);}const normalized=parts.join('/');if(Object.hasOwn(resources,normalized))return resources[normalized];throw Error('OBJ 材质资源未收集：'+value);});
    const creators=[];for(const uri of Object.keys(resources).filter(u=>/\.mtl$/i.test(u))){const response=await fetch(resources[uri],{signal:abort.signal});if(!response.ok)throw Error('MTL 无法读取');creators.push(new MTLLoader(manager).parse(await response.text(),uri.includes('/')?uri.slice(0,uri.lastIndexOf('/')+1):''));}
    const loaded=new Promise((resolve,reject)=>{manager.onLoad=resolve;manager.onError=url=>reject(Error('材质贴图无法读取：'+url));});manager.itemStart('yimu-materials');for(const creator of creators)creator.preload();manager.itemEnd('yimu-materials');await loaded;
    loader.setMaterials({create:name=>{const creator=creators.find(c=>Object.hasOwn(c.materialsInfo,name));return creator?creator.create(name):new THREE.MeshPhongMaterial();}});
   }object=loader.parse(text);
  }
  else if(asset.ext==='stl')object=new THREE.Mesh(new STLLoader().parse(buffer),new THREE.MeshStandardMaterial({color:0xd5bc82,roughness:.65,metalness:0}));
  else{const resources=asset.ext==='fbx'?{}:await window.yimu.command('modelResources',asset.id),manager=new THREE.LoadingManager();manager.setURLModifier(value=>{if(/^(data:|blob:)/.test(value))return value;if(Object.hasOwn(resources,value))return resources[value];throw Error('模型资源未包含在同目录内：'+value);});object=asset.ext==='fbx'?new FBXLoader(manager).parse(buffer,''):(await new GLTFLoader(manager).parseAsync(buffer,'')).scene;}
  if(disposed){disposeObject();return;}
  const bounds=new THREE.Box3().setFromObject(object),size=bounds.getSize(new THREE.Vector3()),span=Math.max(size.x,size.y,size.z);if(!Number.isFinite(span)||span<=0)throw Error('模型没有可预览的几何体');
  object.position.sub(bounds.getCenter(new THREE.Vector3()));const scene=new THREE.Scene();scene.background=new THREE.Color(0x242424);scene.add(object,new THREE.HemisphereLight(0xffffff,0x555566,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(2,4,3);scene.add(light);
  renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.setAttribute('aria-label','三维模型预览');host.prepend(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(40,1,span/1000,span*100);camera.position.set(span*1.35,span*.9,span*1.5);controls=new OrbitControls(camera,renderer.domElement);controls.minDistance=span*.05;controls.maxDistance=span*20;controls.target.set(0,0,0);controls.update();
  function draw(){if(!disposed){renderer.render(scene,camera);host.dataset.rendered='true';}}
  function fit(){const width=Math.max(100,host.clientWidth),height=260;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();draw();}
  controls.addEventListener('change',draw);resize=new ResizeObserver(fit);resize.observe(host);fit();if(options.thumbnail){await onCover(renderer.domElement.toDataURL('image/jpeg',.9));dispose();host.remove();return;}
  message.textContent='拖动旋转 · 滚轮缩放 · 右键平移';const reset=document.createElement('button');reset.textContent='复位视角';reset.onclick=()=>{controls.reset();draw();};controls.saveState();const cover=document.createElement('button');cover.textContent='当前视角设为封面';cover.onclick=async()=>{cover.disabled=true;try{draw();await onCover(renderer.domElement.toDataURL('image/jpeg',.9));message.textContent='封面已保存';}catch(e){message.textContent=e.message;}finally{cover.disabled=false;}};host.append(reset,cover);
 }catch(e){if(!disposed){message.textContent='模型预览失败：'+e.message;host.dataset.error='true';options.onError?.(e);}dispose();}},0);
 return host;
};
