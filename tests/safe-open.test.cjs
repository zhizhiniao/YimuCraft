const test=require('node:test'),assert=require('node:assert/strict'),{assertSafeOpen}=require('../src/safe-open.cjs');
test('OS open rejects executable, script and unknown associations based on actual path',()=>{
 for(const ext of ['exe','msi','msp','hta','com','scr','cpl','pif','url','lnk','wsf','wsh','vbe','jse','ps1','jsx','jsxbin','bat','cmd','unknown'])assert.throws(()=>assertSafeOpen('C:\\素材\\cover.txt.'+ext),/不支持直接打开/);
 for(const ext of ['PNG','mov','mp3','aep','prproj','pdf','txt'])assert.doesNotThrow(()=>assertSafeOpen('C:\\素材\\测试.'+ext));
});
