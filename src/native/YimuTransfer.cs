// Local attachment handoff. Never presses Enter or clicks a send/generate button.
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;
using Accessibility;
using System.Windows.Forms;

class Target {public string id,name,process,pathHint,title,format;}
class Request {public string action; public Target target; public string[] files;}
class Window {public long handle;public string process,path,title;}
class YimuTransfer {
 delegate bool EnumProc(IntPtr window,IntPtr param);
 [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc callback,IntPtr param);
 [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll")] static extern bool IsIconic(IntPtr h);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetWindowText(IntPtr h,StringBuilder text,int max);
 [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);
 [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr h);
 [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] static extern bool ShowWindow(IntPtr h,int cmd);
 [StructLayout(LayoutKind.Sequential)] struct KeyInput {public ushort key,scan;public uint flags,time;public UIntPtr extra;}
 [StructLayout(LayoutKind.Sequential)] struct MouseInput {public int x,y;public uint data,flags,time;public UIntPtr extra;}
 [StructLayout(LayoutKind.Explicit)] struct InputUnion {[FieldOffset(0)] public KeyInput key;[FieldOffset(0)] public MouseInput mouse;}
 [StructLayout(LayoutKind.Sequential)] struct NativeInput {public uint type;public InputUnion data;}
 [DllImport("user32.dll",SetLastError=true)] static extern uint SendInput(uint count,NativeInput[] input,int size);
 [DllImport("user32.dll")] static extern short GetAsyncKeyState(int key);
 static NativeInput Key(ushort key,bool up){return new NativeInput{type=1,data=new InputUnion{key=new KeyInput{key=key,flags=up?2u:0u}}};}
 static void Paste(IntPtr target){if(GetForegroundWindow()!=target)throw new Exception("目标窗口已切换，未粘贴文件");if((GetAsyncKeyState(0x12)&0x8000)!=0||(GetAsyncKeyState(0x5B)&0x8000)!=0||(GetAsyncKeyState(0x5C)&0x8000)!=0)throw new Exception("请松开 Alt / Windows 键再发送");var inputs=new[]{Key(0x11,false),Key(0x56,false),Key(0x56,true),Key(0x11,true)};if(SendInput((uint)inputs.Length,inputs,Marshal.SizeOf(typeof(NativeInput)))!=inputs.Length)throw new Exception("系统未接收粘贴按键，请检查两个程序是否使用相同权限运行");}
 [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,[MarshalAs(UnmanagedType.Interface)] out IAccessible accessible);
 [DllImport("oleacc.dll")] static extern int AccessibleChildren(IAccessible parent,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)] object[] children,out int obtained);
 [DllImport("kernel32.dll")] static extern IntPtr OpenProcess(uint access,bool inherit,uint pid);
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode)] static extern bool QueryFullProcessImageName(IntPtr process,int flags,StringBuilder name,ref int size);
 [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr h);
 static string ProcessPath(uint pid){var h=OpenProcess(0x1000,false,pid);if(h==IntPtr.Zero)return "";try{var text=new StringBuilder(2048);int size=text.Capacity;return QueryFullProcessImageName(h,0,text,ref size)?text.ToString():"";}finally{CloseHandle(h);}}
 static readonly JavaScriptSerializer json=new JavaScriptSerializer();
 static List<Window> Windows(){var result=new List<Window>();EnumWindows((h,p)=>{try{if(!IsWindowVisible(h))return true;var title=new StringBuilder(1024);GetWindowText(h,title,1024);if(title.Length==0)return true;uint pid;GetWindowThreadProcessId(h,out pid);var file=ProcessPath(pid);if(file.Length>0)result.Add(new Window{handle=h.ToInt64(),process=Path.GetFileNameWithoutExtension(file),path=file,title=title.ToString()});}catch{}return true;},IntPtr.Zero);return result;}
 static bool Contains(string text,string match){return string.IsNullOrEmpty(match)||(text??"").IndexOf(match,StringComparison.OrdinalIgnoreCase)>=0;}
 static void Send(Request request){
  var t=request.target;if(t==null||request.files==null||request.files.Length==0||request.files.Length>100)throw new Exception("传图参数无效");
  foreach(var file in request.files)if(!Path.IsPathRooted(file)||!File.Exists(file))throw new Exception("原文件不存在，未发送");
  var windows=Windows().Where(w=>string.Equals(w.process,t.process,StringComparison.OrdinalIgnoreCase)&&Contains(w.path,t.pathHint)&&Contains(w.title,t.title)).ToList();
  if(windows.Count==0)throw new Exception("请先打开 "+t.name+" 的对话输入框");
  if(windows.Count>1)throw new Exception(t.name+" 有多个窗口；请在发送设置中填写更具体的窗口标题");
  var h=new IntPtr(windows[0].handle);if(IsIconic(h))ShowWindow(h,9);SetForegroundWindow(h);Thread.Sleep(160);
  if(GetForegroundWindow()!=h)throw new Exception("未能切换到目标窗口，未粘贴文件");
  string focusError=null;var phase="查找输入框";var focus=new Thread(()=>{try{
  var guid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible root;if(AccessibleObjectFromWindow(h,0xFFFFFFFC,ref guid,out root)!=0||root==null)throw new Exception("目标没有可访问的输入框");
  int rx,ry,rw,rh;root.accLocation(out rx,out ry,out rw,out rh,0);var queue=new Queue<IAccessible>();queue.Enqueue(root);IAccessible composer=null;int best=-1,visited=0;
  while(queue.Count>0&&visited++<12000){var a=queue.Dequeue();try{int state=Convert.ToInt32(a.get_accState(0)),role=Convert.ToInt32(a.get_accRole(0));if(role==42&&(state&0x100000)!=0&&(state&0x18041)==0){int x,y,w,hh;a.accLocation(out x,out y,out w,out hh,0);if(w>120&&hh>15&&y>ry+rh*.35&&y+hh>best){composer=a;best=y+hh;}}
   int count=Math.Min(5000,a.accChildCount);if(count>0){var children=new object[count];int got;AccessibleChildren(a,0,count,children,out got);for(int n=0;n<got;n++){var child=children[n] as IAccessible;if(child!=null)queue.Enqueue(child);}}
  }catch{}}
  if(composer==null)throw new Exception("没有找到 "+t.name+" 的输入框；请打开对话后再试");
  phase="聚焦输入框";composer.accSelect(1,0);Thread.Sleep(60);
  if(GetForegroundWindow()!=h||(Convert.ToInt32(composer.get_accState(0))&4)==0)throw new Exception("输入框未获得焦点，未粘贴文件");
  }catch(Exception e){focusError=e.Message;}});focus.SetApartmentState(ApartmentState.MTA);focus.IsBackground=true;focus.Start();if(!focus.Join(8000))throw new Exception(phase+"超时，未粘贴文件");if(focusError!=null)throw new Exception(focusError);
  PrepareClipboard(request.files,t.format);
  if(GetForegroundWindow()!=h)throw new Exception("目标窗口已切换，未粘贴文件");
  Paste(h);Console.Write(json.Serialize(new {ok=true,target=t.name,count=request.files.Length,status="pasted",message="已执行粘贴，请核对附件；未发送消息"}));
 }
 internal static void PrepareClipboard(string[] files,string format){
  var data=new DataObject();var list=new StringCollection();list.AddRange(files);data.SetFileDropList(list);
  // Browsers consume PNG/Bitmap; Explorer and file-aware clients retain original paths.
  if(format=="image"&&files.Length==1){try{using(var image=Image.FromFile(files[0])){var png=new MemoryStream();image.Save(png,System.Drawing.Imaging.ImageFormat.Png);png.Position=0;data.SetData("PNG",false,png);data.SetData(DataFormats.Bitmap,true,new Bitmap(image));}}catch(ArgumentException){} }
  Clipboard.SetDataObject(data,true,5,60);
 }
 [STAThread] static void Main(){Console.InputEncoding=Encoding.UTF8;Console.OutputEncoding=new UTF8Encoding(false);try{var request=json.Deserialize<Request>(Console.In.ReadToEnd());if(request.action=="windows")Console.Write(json.Serialize(new {windows=Windows()}));else if(request.action=="send")Send(request);else throw new Exception("未知操作");}catch(Exception e){Console.Write(json.Serialize(new {error=e.Message}));}}
}
