// Background test only. Preserve the clipboard unless the user changes it.
using System;using System.Runtime.InteropServices;using System.Text;using System.Windows.Forms;using System.Web.Script.Serialization;
class ProbeRequest {public string[] files;public string format;}
class ClipboardTransferProbe {
 [DllImport("user32.dll")] static extern uint GetClipboardSequenceNumber();
 [STAThread] static void Main(){Console.InputEncoding=Encoding.UTF8;Console.OutputEncoding=new UTF8Encoding(false);var request=new JavaScriptSerializer().Deserialize<ProbeRequest>(Console.ReadLine());var saved=new DataObject();var old=Clipboard.GetDataObject();if(old!=null)foreach(var format in old.GetFormats(false)){try{var value=old.GetData(format,false);if(value!=null)saved.SetData(format,false,value);}catch{}}
 uint ours=0;try{YimuTransfer.PrepareClipboard(request.files,request.format);ours=GetClipboardSequenceNumber();Console.WriteLine("ready");Console.Out.Flush();Console.ReadLine();}finally{if(ours!=0&&ours==GetClipboardSequenceNumber())Clipboard.SetDataObject(saved,true,5,50);}
 }
}
