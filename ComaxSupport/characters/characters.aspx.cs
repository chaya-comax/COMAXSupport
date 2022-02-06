using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class characters_characters : System.Web.UI.Page
{
    string queryErr = "";
    string builder;
    protected void Page_Load(object sender, EventArgs e)
    {
        string action = Request["action"];
        switch (action)
        {

            case "edit":
                Response.Write(Json.SerializeObject(info()));
                Response.End();
                break;
            default:
                break;
        }
    }
    [WebMethod]
    public static string get_form()
    {
        return File.ReadAllText(HttpContext.Current.Server.MapPath("characters.html"));
    }
    public JsonResponse info()
    {
        string company = HttpContext.Current.Session["CurrCompany"].ToString();
        JsonResponse jresponse = new JsonResponse();
        jresponse.success = true;
        jresponse.Response = "characters.aspx";
        try
        {


            builder = GlobalFunctions.GetConnectionString();
            using (SqlConnection conn = new SqlConnection(builder.ToString()))
            {
                conn.Open();
                using (SqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"
                                        SELECT Idx_Default.Sug,
                                        Idx_Default.Idx as id,
                                        Idx.Kod as Kod,
                                        rtrim(Idx.Kod)+ ' - ' + ltrim(rtrim(Idx.Nm)) as text 
                                        from Idx_Default 
                                        inner join Idx on Idx.C=Idx_Default.Idx 
                                        where isnull(Idx_Default.Snif,0)=0 and Idx_Default.Company=" + company + @" and Idx_Default.Sug in (25, 31, 33, 35, 38, 39, 40, 41, 52, 53, 60, 61, 62, 63, 64, 80, 81, 82)";

                    queryErr = cmd.CommandText;
                    string sug;
                    Dictionary<string, string> idx = new Dictionary<string, string>();
                    using (SqlDataReader rdr = cmd.ExecuteReader())
                    {
                        while (rdr.Read())
                        {
                            sug = rdr["Sug"].ToString();

                            idx.Add("Idx" + sug, rdr["id"].ToString());
                            idx.Add("Idx" + sug + "__nm", rdr["text"].ToString());
                        }
                    }
                    var results = new List<Dictionary<string, string>>();
                    results.Add(idx);
                    jresponse.data = Json.SerializeObject(results);
                }


            }
        }
        catch (Exception ex)
        {
            GlobalFunctions.writeToLog("", GlobalFunctions.GetError(ex) + " >>>> queryErr=" + queryErr, "0", "0", "generalCashAccount.info");
            jresponse.success = false;
        }
        return jresponse;
    }

    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]//Specify return format.
    public static string save(string Idx25, string Idx31, string Idx33, string Idx35, string Idx38, string Idx52, string Idx53, string Idx39, string Idx40, string Idx41, string Idx60, string Idx61, string Idx62, string Idx63, string Idx64, string Idx80, string Idx81, string Idx82)
    {
        string[] ArIdx = {  Idx25,  Idx31,  Idx33,  Idx35,  Idx38,  Idx52,  Idx53,  Idx39,  Idx40,  Idx41,  Idx60,  Idx61,  Idx62,  Idx63,  Idx64,  Idx80,  Idx81,  Idx82 };
        int[] ArrM = { 25, 31, 33, 35, 38, 39, 40, 41, 52, 53, 60, 61, 62, 63, 64, 80, 81, 82 };
        int[] arrIndex = ArrM;

        JsonResponse jresponse = new JsonResponse();
        jresponse.success = true;
        jresponse.Response = "characters.aspx";
        string msg = "";
        string sql = "";
        string company = HttpContext.Current.Session["CurrCompany"].ToString();
        string user = HttpContext.Current.Session["UserC"].ToString();
        string snif = HttpContext.Current.Session["CurrSnif"].ToString();
        if (string.IsNullOrEmpty(snif)) snif = "0";

        try
        {

            string builder = GlobalFunctions.GetConnectionString();
            using (SqlConnection conn = new SqlConnection(builder.ToString()))
            {
                int i = 0;
                while (i < ArrM.Length)
                {
                    sql = @" Insert Into Idx_Default_Log(Snif,Sug,Company,Idx,ByDate,Usr) 
                                            select Idx_Default.Snif ,Idx_Default.Sug ," + company + @" ,Idx_Default.Idx , getdate(), " + user + @"
                                            from Idx_Default
                                            Where Sug=" + ArrM[i] + @" and isnull(Snif,0)=" + snif + @" and Company=" + company;
                    GlobalFunctions.SqlIo(sql, conn);
                    i++;
                }



                i = 0;
                while (i < ArIdx.Length)
                {
                    sql = "Delete from Idx_Default Where Sug=" + arrIndex[i] + " and isnull(Snif,0)=" + snif + " and Company=" + company;
                    GlobalFunctions.SqlIo(sql, conn);

                    sql = @" Insert Into Idx_Default(Snif,Sug,Company,Idx,ByDate,Usr) 
                                    Values ('" + snif + @"'," + arrIndex[i].ToString() + @"," + company + @"," + GlobalFunctions.ChkEmptyString(ArIdx[i]) + @",getdate(),'" + user + @"')";
                    i++;
                    GlobalFunctions.SqlIo(sql, conn);

                }
                conn.Close();
                msg = "עודכן בהצלחה";

            }
        }
        catch (Exception ex)
        {
            GlobalFunctions.writeToLog("", GlobalFunctions.GetError(ex) + " >>>> queryErr=" + sql, "0", "0", "characters.save");
            jresponse.success = false;
            msg = "כפילות בנתונים";
        }
        jresponse.messages.Add(new messages(msg));
        return JsonConvert.SerializeObject(jresponse);

    }
}