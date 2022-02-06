using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using System.Diagnostics;

namespace ComPlus
{
    public class GetParamOdbc
    {
        private static string OBJECT_NAME = "GetParamOdbc.Main";

        private string _Odbc = "";
        private string _username = "";
        private string _password = "";



        #region Properties

        /// <summary>
        /// Username
        /// </summary>
        public string Username
        {
            get { return _username; }
        }

        public string Odbc
        {
            get { return _Odbc; }
        }


        /// <summary>
        /// Password
        /// </summary>
        public string Password
        {
            get { return _password; }
        }

        #endregion


        /// <summary>
        /// Constructor.
        /// </summary>
        public GetParamOdbc()
        {
            _username = _password = string.Empty;
        }


        public GetParamOdbc(object Lk, object SwSQL)
            : this()
        {
            GetParams(Lk, SwSQL.ToString());

        }


        public bool GetParams(object Lk, string SwSQL = "")
        {
            return GetParams("Max2000_" + Lk.ToString(), SwSQL);
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="ODBCName"></param>
        /// <param name="SwSQL"></param>
        /// <returns></returns>
        public bool GetParams(string ODBCName, string SwSQL = "")
        {
            string fromCode = "Copy_Tbl_To_Servers";
            string splitPattern = "###";
            _Odbc = ODBCName;
            _username = _password = string.Empty;
            try
            {
                Type objType = Type.GetTypeFromProgID(OBJECT_NAME);
                if (objType != null)
                {
                    object obj = Activator.CreateInstance(objType);
                    if (obj == null) return false;
                    object[] param = { ODBCName, fromCode, splitPattern, SwSQL };
                    object result = objType.InvokeMember("Main", System.Reflection.BindingFlags.InvokeMethod, null, obj, param);
                    if (result == null) return false;
                    // we have answer --> parse it
                    string[] arr = Regex.Split(result.ToString(), splitPattern);
                    _username = arr[0];
                    _password = arr[1];
                    Marshal.ReleaseComObject(obj);
                    obj = null;
                    return true;
                }
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
            }
            return false;
        }
    }
}
