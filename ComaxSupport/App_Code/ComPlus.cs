using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;

namespace ComPlus
{
    public class ComPlus
    {
        public static string sDo(string Object_Name, string Function_Name, object[] param)
        {
            return sDo(Object_Name, Function_Name, param, false);
        }

        public static string sDo(string Object_Name, string Function_Name, object[] param, bool SwEscape)
        {
            string s_result = string.Empty;
            try
            {
                Type objType = Type.GetTypeFromProgID(Object_Name);
                if (objType != null)
                {
                    object obj = Activator.CreateInstance(objType);
                    if (obj != null)
                    {
                        object result = objType.InvokeMember(Function_Name, System.Reflection.BindingFlags.InvokeMethod, null, obj, param);
                        if (result != null)
                        {
                            s_result = result.ToString();
                            if (SwEscape)
                            {
                                //s_result = Microsoft.JScript.GlobalObject.unescape(s_result);
                            }
                            Marshal.ReleaseComObject(obj);
                            obj = null;
                        }
                    }
                }
            }
            catch (Exception e)
            {
                return "";
            }
            return s_result;
        }
    }
}