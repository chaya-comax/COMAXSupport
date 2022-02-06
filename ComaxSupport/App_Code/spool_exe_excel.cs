using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for spool_exe_excel
/// </summary>
public class Spool_exe_excel : GlobalFunctions
{
    public Spool_exe_excel()
    {
        C = "0";
        sResult = "";
        SwErr = "";
    }

    public string C { get; set; }
    public string sResult { get; set; }
    public string SwErr { get; set; }


    public string Write_spool_exe_excel(string Exe_Nm, string PrmL)
    {
        try
        {
            string OdbcUserName = HttpContext.Current.Session["OdbcUserName"].ToString();
            string OdbcPassword = HttpContext.Current.Session["OdbcPassword"].ToString();
            string Odbc = HttpContext.Current.Session["Odbc"].ToString();
            string SwSQL = HttpContext.Current.Session["SwSQL"].ToString();
            string Prt_Company = HttpContext.Current.Session["Prt_Company"].ToString();
            string CurrCompany = HttpContext.Current.Session["CurrCompany"].ToString();
            string userC = HttpContext.Current.Session["userC"].ToString();

            PrmL += setStr(Odbc, "Odbc") + setStr(OdbcUserName, "OdbcUserName") + setStr(OdbcPassword, "OdbcPassword") + setStr(Prt_Company, "Prt_Company") + setStr(CurrCompany, "CurrCompany");

            string res = "";
            using (SqlConnection conn = new SqlConnection(getLkConnString("Max2000_BackOffice", "").ToString()))
            {
                conn.Open();
                using (SqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"insert into Max2000_RunDoc..Spool_EXE_Excel (SwSQL,DB,Exe_Nm,PrmL,Start_Date,SessionID,Usr)
                               values (" + ChkEmptyNumeric(SwSQL) + ",'" + Odbc + "','" + Exe_Nm + "','" + PrmL + "',getdate()," + SessionID() + "," + userC + @")
                               select SCOPE_IDENTITY() as res;";
                    using (SqlDataReader rdr = cmd.ExecuteReader())
                    {
                        if (rdr.Read())
                        {
                            res = rdr["res"].ToString();
                        }
                    }
                }
            }
            return res;

        }
        catch (Exception e)
        {
            return "0;null; בעיה בהפעלה ראשונית !";
        }
    }
    public string Chk_Spool_EXE_Excel(string counter)
    {
        try
        {
            string res;
            string userC = HttpContext.Current.Session["userC"].ToString();
            using (SqlConnection conn = new SqlConnection(getLkConnString("Max2000_BackOffice", "").ToString()))
            {
                conn.Open();
                using (SqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"select isnull(SwErr,0) as SwErr, isnull(sResult, '') as sResult,C, 1 as swCaseSent
                                        from Max2000_RunDoc..Spool_EXE_Excel
                                        where Usr=" + userC + @" and C=" + counter + @"
                                        and (isnull(SwActive,0)=2 or isnull(SwActive,0)=9) ";
                    res = Json.SerializeObject(Serialize(cmd.ExecuteReader()));
                }
                conn.Close();
                return res;
            }
        }
        catch (Exception e)
        {
            return "0;null; בעיה בהפעלה ראשונית !";
        }
    }
    public string do_query_next(string counter, Spool_exe_excel res)
    {
        string spool = Chk_Spool_EXE_Excel(counter);
        if (spool != "[]")
        {
            spool = spool.Replace(@"\", "/");
            spool = spool.TrimStart('[').TrimEnd(']');
            res = JsonConvert.DeserializeObject<Spool_exe_excel>(spool);
        }
        if (res.C == "0" && res.sResult == "")
            return do_query_next(counter, res);
        return res.sResult;
    }
}