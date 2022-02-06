using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;

namespace ComPlus
{
    public class BuildConnString
    {

        /// <summary>
        /// 
        /// </summary>
        /// <param name="ODBC"></param>
        /// <param name="SwSQL"></param>
        /// <returns></returns>
        public string bConnString(string ODBC, string SwSQL = "")
        {
            string OBJECT_NAME = "Build_ConnString.Main";

            try
            {
                if (!ODBC.ToLower().StartsWith("max2000_") && ODBC.ToString() != "")
                    ODBC = string.Concat("Max2000_", ODBC);
                Type objType = Type.GetTypeFromProgID(OBJECT_NAME);
                if (objType != null)
                {
                    object obj = Activator.CreateInstance(objType);
                    if (obj == null) throw new Exception("Failed to create object " + OBJECT_NAME);

                    GetParamOdbc p = new GetParamOdbc();
                    p.GetParams(ODBC, SwSQL);
                    object[] param = { ODBC, SwSQL, p.Username, p.Password, "1", "1" };
                    object result = objType.InvokeMember("bConnString", System.Reflection.BindingFlags.InvokeMethod, null, obj, param);
                    if (result == null) throw new Exception(string.Format("{0}.bConnstring failed", OBJECT_NAME));
                    Marshal.ReleaseComObject(obj);
                    obj = null;
                    return result.ToString();
                }
            }
            catch (Exception ex)
            {
                return "";
            }
            return null;
        }
        public string bConnStringLog(string DB, string SwSQL = "")
        {
            string OBJECT_NAME = "Build_ConnString.Main";

            try
            {
                
                Type objType = Type.GetTypeFromProgID(OBJECT_NAME);
                if (objType != null)
                {
                    object obj = Activator.CreateInstance(objType);
                    if (obj == null) throw new Exception("Failed to create object " + OBJECT_NAME);

                    object[] param = { DB, SwSQL, "sa", "J@ggal@p", "1", "1" };
                    object result = objType.InvokeMember("bConnString", System.Reflection.BindingFlags.InvokeMethod, null, obj, param);
                    if (result == null) throw new Exception(string.Format("{0}.bConnstring failed", OBJECT_NAME));
                    Marshal.ReleaseComObject(obj);
                    obj = null;
                    return result.ToString();
                }
            }
            catch (Exception ex)
            {
                return "";
            }
            return null;
        }
    }
}