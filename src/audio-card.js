let activeAudioPreview=null;
function audioCard(asset){
 const box=document.createElement('div');box.className='audio-card';
 const wave=waveform(asset),audio=document.createElement('audio'),controls=document.createElement('div'),time=document.createElement('span'),mute=document.createElement('button');
 audio.src=url(asset,'preview');audio.preload='metadata';audio.muted=!!state.preferences?.audioMuted;audio.dataset.previewAudio='true';
 wave.tabIndex=0;wave.setAttribute('role','slider');wave.setAttribute('aria-label','音频波形，点击跳播，左右键调整位置');wave.setAttribute('aria-valuemin','0');wave.setAttribute('aria-valuemax','100');
 time.textContent='0:00 / —';mute.type='button';mute.className='audio-mute';mute.setAttribute('aria-label','音频静音');
 const format=n=>Number.isFinite(n)?Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0'):'—';
 let pendingFraction=null;
 function update(){const percent=Number.isFinite(audio.duration)&&audio.duration>0?100*audio.currentTime/audio.duration:0;time.textContent=format(audio.currentTime)+' / '+format(audio.duration);box.style.setProperty('--audio-progress',percent+'%');wave.setAttribute('aria-valuenow',String(Math.round(percent)));wave.setAttribute('aria-valuetext',time.textContent);box.dataset.playing=String(!audio.paused);mute.textContent=audio.muted?'静音':'有声';mute.setAttribute('aria-pressed',String(audio.muted));}
 box.start=async()=>{document.querySelectorAll('audio').forEach(other=>{if(other!==audio)other.pause();});if(activeAudioPreview&&activeAudioPreview!==audio)activeAudioPreview.pause();activeAudioPreview=audio;audio.muted=!!state.preferences?.audioMuted;try{await audio.play();box.title='点击波形任意位置跳播；左右键微调';}catch(e){box.title='播放未启动：'+e.message;}update();};
 function seekTo(fraction){if(!Number.isFinite(fraction))return;pendingFraction=Math.max(0,Math.min(1,fraction));if(Number.isFinite(audio.duration)&&audio.duration>0){audio.currentTime=Math.min(Math.max(0,audio.duration-.01),audio.duration*pendingFraction);pendingFraction=null;update();void box.start();}}
 audio.addEventListener('loadedmetadata',()=>{if(pendingFraction!==null)seekTo(pendingFraction);});
 for(const event of ['loadedmetadata','timeupdate','seeked','play','pause','ended','volumechange'])audio.addEventListener(event,update);
 audio.addEventListener('error',()=>{time.textContent='无法解码';box.title='此音频无法直接播放，可右键生成兼容预览';});
 for(const element of [wave,mute])for(const event of ['pointerdown','click','dblclick','keydown','dragstart'])element.addEventListener(event,e=>{e.stopPropagation();if(event==='dragstart')e.preventDefault();});
 wave.onclick=e=>{selectAsset(asset,e);const rect=wave.getBoundingClientRect();seekTo((e.clientX-rect.left)/rect.width);};
 wave.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();seekTo((audio.currentTime+(e.key==='ArrowRight'?1:-1))/audio.duration);}else if(e.key===' '){e.preventDefault();audio.paused?void box.start():audio.pause();}};
 mute.onclick=()=>run(()=>quickPreference({audioMuted:!audio.muted}));
 controls.className='audio-controls';controls.append(time,mute);box.append(wave,controls,audio);audio.hidden=true;
 box.stop=()=>{audio.pause();update();};update();return box;
}
