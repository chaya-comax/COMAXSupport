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

public partial class password_password : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {

    }


    [WebMethod]
    public static string get_form()
    {
        return File.ReadAllText(HttpContext.Current.Server.MapPath("password.html"));
    }
    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]//Specify return format.
    public static string save(string kod, string password)
    {
        JsonResponse jresponse = new JsonResponse();
        jresponse.success = false;
        jresponse.Response = "password.aspx";

        string msg = "";
        string sql = "";
        string SwUserComax = HttpContext.Current.Session["SwUserComax"].ToString();
        string company = HttpContext.Current.Session["CurrCompany"].ToString();
        try
        {
            if (string.IsNullOrEmpty(password))
            {
                jresponse.errors.Add("[{ \"password\":\"ErrorPassword\" }]");
                return JsonConvert.SerializeObject(jresponse);
            }

            string MasterPass = "5885";
            if (SwUserComax == "1" && password == MasterPass)
                jresponse.success = true;
            else
            {
                string password_db = "";
                sql = @"select rtrim(ltrim(PassWord)) as password_db
                    from PassWords WHERE Company=" + company + @"
                    and Kod= " + kod;
                string builder = GlobalFunctions.GetConnectionString();
                using (SqlConnection conn = new SqlConnection(builder.ToString()))
                {
                    conn.Open();
                    using (SqlCommand cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = sql;
                        using (SqlDataReader rdr = cmd.ExecuteReader())
                        {
                            if (rdr.Read())
                                password_db = rdr["password_db"].ToString();
                        }
                    }
                    conn.Close();
                }

                if (password_db == password)
                    jresponse.success = true;
                else
                    jresponse.errors.Add("[{ \"password\":\"ErrorPassword\" }]");
            }
        }
        catch (Exception ex)
        {
            GlobalFunctions.writeToLog("", GlobalFunctions.GetError(ex) + " >>>> queryErr=" + sql, "0", "0", "password.save");
            jresponse.success = false;
            msg = "כפילות בנתונים";
        }
        jresponse.messages.Add(new messages(msg));
        return JsonConvert.SerializeObject(jresponse);
    }

    [WebMethod]
    public static Int16 chkPasswordSet(string kod)
    {
        Int16 count = -1;
        string sql = "";
        string company = HttpContext.Current.Session["CurrCompany"].ToString();
        string userC = HttpContext.Current.Session["UserC"].ToString();
        string builder = "";
        try
        {
            sql = @" Select count(PassWord) as count from PassWords 
                            left join PassWords_Users on PassWords_Users.Kod=PassWords.Kod and  
                            PassWords_Users.Company=PassWords.Company and PassWords_Users.Usr=" + userC +
                            @" where PassWords.Kod=" + kod + " and PassWords.Company= " + company + @" and 
                            ((isnull(PassWords.SwBlockUser,0)=0 and PassWords_Users.Usr is null) or (PassWords.SwBlockUser=1 and PassWords_Users.Usr is not null )) ";
            builder = GlobalFunctions.GetConnectionString();
            using (SqlConnection conn = new SqlConnection(builder.ToString()))
            {
                conn.Open();
                using (SqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = sql;
                    using (SqlDataReader rdr = cmd.ExecuteReader())
                    {
                        if (rdr.Read())
                            count = Convert.ToInt16(rdr["count"]);
                    }
                }
                conn.Close();
            }

        }
        catch (Exception ex)
        {
            GlobalFunctions.writeToLog("", GlobalFunctions.GetError(ex) + " >>>> queryErr=" + sql, "0", "0", "password.chkPasswordSet");
        }
        return count;
    }
}