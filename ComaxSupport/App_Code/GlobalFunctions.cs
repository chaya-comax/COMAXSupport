using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Web;
using Excel = Microsoft.Office.Interop.Excel;

/// <summary>
/// Summary description for GlobalFunctions
/// </summary>
public class GlobalFunctions
{
    // Shared DbF As DbFunctions = New DbFunctions()
    public static SqlDataReader Rs;
    public static StringBuilder sql_Script;
    public static SqlConnectionStringBuilder builder;
    public static SqlConnection ConnTo;
    public static SqlCommand cmd, cmdTo;
    public static string Framelocation = "";
    private const string CONNECTION_STRING = "Provider=Microsoft.ACE.OLEDB.12.0; Data Source=<FILENAME>;Extended Properties='Excel 8.0;HDR=Yes;';";
    public static string GetError(Exception ex, string userMessage = "")
    {
        StringBuilder str = new StringBuilder();
        try
        {
            StackTrace st = new StackTrace(ex, true);
            foreach (StackFrame sf in st.GetFrames())
            {
                if (sf.GetFileLineNumber() > 0)
                    str.AppendFormat("Line: {0}{1}", sf.GetFileLineNumber() + " Filename: " + System.IO.Path.GetFileName(sf.GetFileName()), Environment.NewLine);
            }

            if (ex.HelpLink != null)
                str.AppendFormat("HelpLink: {0}{1}", ex.HelpLink, Environment.NewLine);
            if (ex.InnerException != null)
                str.AppendFormat("InnerException: {0}{1}", ex.InnerException.ToString(), Environment.NewLine);
            if (ex.Message != null)
                str.AppendFormat("Message: {0}{1}", ex.Message, Environment.NewLine);
            if (ex.Source != null)
                str.AppendFormat("Source: {0}{1}", ex.Source, Environment.NewLine);
            if (ex.StackTrace != null)
                str.AppendFormat("StackTrace: {0}{1}", ex.StackTrace, Environment.NewLine);
            if (ex.TargetSite != null)
                str.AppendFormat("TargetSite: {0}{1}", ex.TargetSite.ToString(), Environment.NewLine);

            if (!string.IsNullOrEmpty(userMessage))
                str.AppendFormat("Function Parameters: {0}{1}", userMessage, Environment.NewLine);
        }
        catch (Exception ex2)
        {
            return string.Empty;
        }
        return str.ToString();
    }
    public static SqlConnectionStringBuilder getLkConnString(string Lk, string SwSQL)
    {
        ComPlus.BuildConnString bConn = new ComPlus.BuildConnString();
        string connS = bConn.bConnString(Lk, SwSQL);
        SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder(connS);
        return builder;
    }
    public static SqlConnectionStringBuilder getLogConnString(string DB, string SwSQL)
    {
        ComPlus.BuildConnString bConn = new ComPlus.BuildConnString();
        string connS = bConn.bConnStringLog(DB, SwSQL);
        SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder(connS);
        return builder;
    }
    public static DetailsOdbc ReturnOdbc(string CustomerCode)
    {
        DetailsOdbc DetailsOdbc = new DetailsOdbc();
        try
        {
            builder = getLkConnString("Max2000_BackOffice", "");
            using (SqlConnection conn = new SqlConnection(builder.ToString()))
            {
                conn.Open();
                using (SqlCommand cmdBo = conn.CreateCommand())
                {
                    cmdBo.CommandText = " select Lk.C as C,Lk_Pratim.SwSQL as SwSQL,rtrim(ltrim(Lk.Nm)) as Nm,rtrim(ltrim(LoginKod)) as LoginKod " +
                                        " from Max2000_BackOffice..Lk Lk" +
                                        " left join Max2000_BackOffice..Lk_Pratim on Lk_Pratim.Lk=Lk.C" +
                                        " where Lk.LoginKod='" + CustomerCode + "'";
                    using (SqlDataReader rdr = cmdBo.ExecuteReader())
                    {
                        if (rdr.Read())
                        {
                            DetailsOdbc.Odbc = "Max2000_" + rdr["C"].ToString();
                            DetailsOdbc.Code = rdr["LoginKod"].ToString();
                            DetailsOdbc.SwSQL = rdr["SwSQL"].ToString();
                            DetailsOdbc.C = rdr["C"].ToString();
                            DetailsOdbc.Name = rdr["Nm"].ToString();
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            writeToLog("", GetError(ex), "0", "0", "ComaxSupport.GlobalFunctions.ReturnOdbc");
            return DetailsOdbc;
        }
        return DetailsOdbc;
    }
    public static void writeToLog(string ODBC, string Msgerr, string UserCounter, string DocType, string Dll_Nm)
    {
        try
        {
            string DocsErr = ComPlus.ComPlus.sDo("Docs_Err.Main", "Write_Err", new object[] { ODBC, Msgerr, UserCounter, DocType, Dll_Nm });
        }
        catch (Exception ex)
        { }
    }


    public static string GetParamOdbc(string ODBC)
    {
        string d = "";
        try
        {
            d = ComPlus.ComPlus.sDo("GetParamOdbc.Main", "Main", new object[] { ODBC, "ComaxSupport" });
        }
        catch (Exception ex)
        { }
        return d;
    }
    public static string GetPrm(string s, string nm)
    {
        string d = "";
        try
        {
            d = ComPlus.ComPlus.sDo("NtvRptPrm.GetPrm", "Main", new object[] { s, nm });
        }
        catch (Exception ex)
        { }
        return d;
    }
    public static string login(string IP, string swVisit, string lk, string user, string password, string SessionID, string Odbc, string OdbcUserName, string OdbcPassword)
    {
        string msg = "";

        try
        {
            msg = ComPlus.ComPlus.sDo("NtvGate.ChkLogIn", "Main", new object[] { IP, swVisit, lk, user, password, SessionID, Odbc, OdbcUserName, OdbcPassword });
        }
        catch (Exception ex)
        { }
        return msg;
    }





    public static IEnumerable<Dictionary<string, object>> Serialize(SqlDataReader reader)
    {
        var results = new List<Dictionary<string, object>>();
        var cols = new List<string>();
        for (var i = 0; i < reader.FieldCount; i++)
            cols.Add(reader.GetName(i));

        while (reader.Read())
            results.Add(SerializeRow(cols, reader));

        return results;
    }
    private static Dictionary<string, object> SerializeRow(IEnumerable<string> cols, SqlDataReader reader)
    {
        var result = new Dictionary<string, object>();
        foreach (var col in cols)
            result.Add(col, reader[col]);
        return result;
    }




    public static string exportExl(SqlConnection conn, string sql, List<string> columns, string fileNm)
    {
        string result = "";
        string lineErr = "0";
        try
        {
            Excel.Application xlApp = null;
            Excel.Workbook xlWorkBook = null;
            Excel.Worksheet xlWorkSheet = null;
            lineErr = "1";
            lineErr = "111";

            xlApp = new Excel.Application();
            lineErr = "1.1";
            object misValue = Missing.Value;
            lineErr = "1.2";

            xlWorkBook = xlApp.Workbooks.Add();
            lineErr = "1.3";

            xlWorkBook = xlApp.Workbooks.Add();
            lineErr = "1.4";

            xlWorkSheet = (Excel.Worksheet)xlApp.ActiveSheet;
            lineErr = "1.5";

            xlWorkSheet.Name = "Details";
            lineErr = "2";
            for (int x = 0; x < columns.Count; x++)
            {
                xlWorkSheet.Cells[1, x + 1] = columns[x];
                ((Excel.Range)xlWorkSheet.Cells[1, x + 1]).WrapText = true;
                ((Excel.Range)xlWorkSheet.Cells[1, x + 1]).Interior.Color = System.Drawing.Color.SkyBlue;
            }
            lineErr = "3";
            conn.Open();
            using (SqlCommand cmd = conn.CreateCommand())
            {
                lineErr = "4";
                cmd.CommandText = sql;
                lineErr = "5";
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    int i = 1;
                    while (reader.Read())
                    {
                        i++;
                        for (int j = 0; j < columns.Count; j++)
                        {
                            ((Excel.Range)xlWorkSheet.Cells[i, j + 1]).Value = Convert.ToString(reader[j]);
                        }
                    }
                }
            }
            lineErr = "6";
            string folder = @"/Upload/ExcelFiles";
            string path = HttpContext.Current.Server.MapPath("~" + folder);
            fileNm = fileNm + "_" + DateTime.Now.ToString("dd_MM_yyyy_hh_mm_ss");
            string fileExt = "xlsx";
            if (!Directory.Exists(path)) Directory.CreateDirectory(path);
            lineErr = "7";
            string filePath = path + @"\" + fileNm + "." + fileExt;
            result = folder + @"/" + fileNm + "." + fileExt;
            if (File.Exists(filePath))
                File.Delete(filePath);
            lineErr = "8";
            xlWorkBook.SaveCopyAs(filePath);
            lineErr = "9";
            Marshal.ReleaseComObject(xlWorkSheet);
            Marshal.ReleaseComObject(xlWorkBook);
            Marshal.ReleaseComObject(xlApp);
            lineErr = "10";
            System.GC.Collect();
            System.GC.WaitForPendingFinalizers();
            lineErr = "11";
        }
        catch (Exception ex)
        {
            Mail m = new Mail();
            m.SendtEmail("exportExl", ex.ToString() + " >>>> lineErr=" + lineErr);
            GlobalFunctions.writeToLog("", GlobalFunctions.GetError(ex) + " >>>> lineErr=" + lineErr, "0", "0", "exportExl");
        }
        return result;
    }


    public static DataTable GetDataTableFromExcelFile(string fullFileName, ref string sheetName)
    {
        Mail m = new Mail();
        DataSet dsImport = new DataSet();
        string lineErr = "0";
        try
        {
            OleDbConnection objConnection = new OleDbConnection();
            lineErr = "1";
            objConnection = new OleDbConnection(CONNECTION_STRING.Replace("<FILENAME>", fullFileName));
            lineErr = "2";
            try
            {
                objConnection.Open();
                lineErr = "3";
                DataTable dtSchema = objConnection.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, null);
                lineErr = "4";
                if ((null == dtSchema) || (dtSchema.Rows.Count <= 0))
                {
                    //raise exception if needed
                    lineErr = "5";
                }

                if ((null != sheetName) && (0 != sheetName.Length))
                {
                    m.SendtEmail("GetDataTableFromExcelFile sheetName 1", sheetName);
                    lineErr = "6";
                    if (!CheckIfSheetNameExists(sheetName, dtSchema))
                    {
                        m.SendtEmail("GetDataTableFromExcelFile sheetName 2", sheetName);
                        lineErr = "7";
                    }
                    else
                        m.SendtEmail("GetDataTableFromExcelFile sheetName 3", sheetName);

                }
                else
                {
                    //Reading the first sheet name from the Excel file.
                    sheetName = dtSchema.Rows[0]["TABLE_NAME"].ToString();
                    m.SendtEmail("GetDataTableFromExcelFile sheetName 4", sheetName);

                    lineErr = "8";
                }

                new OleDbDataAdapter("SELECT * FROM [" + sheetName + "]", objConnection).Fill(dsImport);
            }
            catch (Exception e)
            {
                m.SendtEmail("GetDataTableFromExcelFile error 9", e.ToString() + " </br>" + lineErr + " </br>" + fullFileName + " </br>" + sheetName);
                lineErr = "9";
            }
            finally
            {
                lineErr += "10";
                // Clean up.
                if (objConnection != null)
                {
                    objConnection.Close();
                    objConnection.Dispose();
                }
            }
        }
        catch (Exception e)
        {
            m.SendtEmail("GetDataTableFromExcelFile error", e.ToString() + " </br>" + lineErr + " </br>" + fullFileName + " </br>" + sheetName);
        }
        m.SendtEmail("GetDataTableFromExcelFile end ghgg", lineErr + " </br>" + fullFileName + " </br>" + sheetName);

        return dsImport.Tables[0];
    }

    public static string SaveExlFile(object files, string tblNm)
    {
        byte[] bytes = Convert.FromBase64String(files.ToString().Replace("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,", String.Empty));
        string f = tblNm + "_" + DateTime.Now.ToString("dd_MM_yyyy_hh_mm_ss");
        //string fileNm = GetPath_Spool_UpLoad_UNC() + @"\" + f + ".xlsx";
        string fileNm = GetPath_BackUp_UpLoad_UNC() + @"\" + f + ".xlsx";
        File.WriteAllBytes(fileNm, bytes);
        return fileNm;
    }
    public static bool CheckIfSheetNameExists(string sheetName, DataTable dtSchema)
    {
        foreach (DataRow dataRow in dtSchema.Rows)
        {
            if (sheetName == dataRow["TABLE_NAME"].ToString())
            {
                return true;
            }
        }
        return false;
    }

    public static string getVfS(string str, string fieldNm)
    {
        string nm = "##" + fieldNm + ":";
        string s = "";
        int j = str.IndexOf(nm);
        int j1 = 0;
        if (j >= 0)
            j1 = str.IndexOf("%^", j + 1);
        if (j1 >= 0)
            s = str.Substring(j + nm.Length, j1 - j - nm.Length);
        return s;
    }

    public static string GetConnectionString()
    {
        string builder_str = "";
        if (HttpContext.Current.Session["builder"] == null || string.IsNullOrEmpty(HttpContext.Current.Session["builder"].ToString()))
            return "-1";
        builder_str = HttpContext.Current.Session["builder"].ToString();
        SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder(builder_str);
        return builder.ToString();
    }

    public static string SetString(object Str)
    {
        var RetStr = "";
        if (Str != System.DBNull.Value) RetStr = Convert.ToString(Str).Trim();
        return RetStr;
    }

    public static string GetFileExtension(string base64String)
    {
        var data = base64String.Substring(0, 5);

        switch (data.ToUpper())
        {
            case "IVBOR":
                return "png";
            case "/9J/4":
                return "jpg";
            case "AAAAF":
                return "mp4";
            case "JVBER":
                return "pdf";
            case "AAABA":
                return "ico";
            case "UMFYI":
                return "rar";
            case "E1XYD":
                return "rtf";
            case "U1PKC":
                return "txt";
            case "MQOWM":
            case "77U/M":
                return "srt";
            default:
                return string.Empty;
        }
    }
    public static void SqlIo(string sql, SqlConnection conn)
    {
        conn.Open();
        using (SqlCommand cmd = conn.CreateCommand())
        {
            cmd.CommandText = sql;
            cmd.ExecuteReader();
        }
        conn.Close();
    }
    public static string ChkEmptyString(string val)
    {
        if (string.IsNullOrEmpty(val))
            return "null";
        return "'" + val.Trim() + "'";
    }

    public static string ChkEmptyNumeric(string val)
    {
        if (string.IsNullOrEmpty(val) || !IsNumber(val))
            return "null";
        return val.Trim();
    }
    public static string ChkDate(string val)
    {
        if (string.IsNullOrEmpty(val))
            return "null";
        return "'" + DateTime.Parse(val).ToString("MM/dd/yyyy hh:mm:ss") + "'";
    }

    /// <summary>
    /// When the 
    /// is on retrun 1, else - return 0.
    /// </summary>
    public static string CheckValueCheckBox(string val)
    {
        if (val == "on")
            return "1";
        return "0";
    }

    public static string GetPath_Spool_UpLoad_UNC()
    {
        return ComPlus.ComPlus.sDo("ComaxBackUp.Main", "GetPath_Spool_UpLoad_UNC", new object[] { }) + HttpContext.Current.Session["Lk"].ToString();
    }
    public static string GetPath_BackUp_UpLoad_UNC()
    {
        return ComPlus.ComPlus.sDo("ComaxBackUp.Main", "GetPath_BackUp_UpLoad_UNC", new object[] { }) + HttpContext.Current.Session["Lk"].ToString();
    }
    public static string GetUserC()
    {
        return string.IsNullOrEmpty(HttpContext.Current.Session["UserC"].ToString()) ? "0" : HttpContext.Current.Session["UserC"].ToString();
    }
    public static Boolean IsNumber(string str)
    {
        int n;
        return int.TryParse(str, out n);
    }

    public static Boolean IsDouble(string str)
    {
        double n;
        return double.TryParse(str, out n);
    }

    public static string Apostrophe(string str)
    {
        return str.Replace("'", "''");
    }
    public static string getDateNow()
    {
        Random rnd = new Random();
        int rndNum = rnd.Next(1, 1000);
        string d = DateTime.Now.ToString("ddMMyyyyhhmmss");
        return "_" + d + "_" + rndNum;
    }

    public static string setStr(string vl, string nm)
    {
        if (string.IsNullOrEmpty(vl))
            vl = "";
        return "##" + nm.Trim() + ":" + vl.Trim() + "%^";
    }
    public static string SessionID()
    {
        return DateTime.Now.ToString("ddMMyyyyhhmmssfff");
    }

    public static string PrintSend(string param, string frame)
    {
        return PrintSend(param, frame, "", "");
    }
    public static string PrintSend(string param, string frame, string param1, string paramNosaf)
    {
        string company = HttpContext.Current.Session["CurrCompany"].ToString();
        string userC = HttpContext.Current.Session["UserC"].ToString();
        string currYear = HttpContext.Current.Session["CurrYear"].ToString();
        string odbc = HttpContext.Current.Session["Odbc"].ToString();
        string SwSQL = HttpContext.Current.Session["SwSQL"].ToString();
        string OdbcUserName = HttpContext.Current.Session["OdbcUserName"].ToString();
        string OdbcPassword = HttpContext.Current.Session["OdbcPassword"].ToString();
        string swVisit = HttpContext.Current.Session["swVisit"].ToString();
        string currSnif = HttpContext.Current.Session["CurrSnif"].ToString();
        string App = HttpContext.Current.Session["ZorbaApp"].ToString();
        string SwBorder = "-1";
        string page = "0";
        string pDate = "null";
        string pTime = "null";
        string SortNo = "null";
        param = "'" + param + "'";
        param1 = "'" + param1 + "'";
        paramNosaf = "'" + paramNosaf + "'";

        string res = ComPlus.ComPlus.sDo("NtvDB.GetSpool", "WriteData", new object[] {
            currSnif,SwBorder,App, "1", userC,page,pDate,pTime,param,frame,SortNo,param1,company,currYear,odbc,OdbcUserName,OdbcPassword, "null", swVisit,SwSQL,paramNosaf
        });
        if (res == "Err")
            return "! תקלה בהפעלת דו''ח";
        return "";

    }
}