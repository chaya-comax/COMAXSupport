using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Newtonsoft.Json;
using System.Data.SqlClient;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Web.Script.Services;
using System.Web.Services;
using Excel = Microsoft.Office.Interop.Excel;

public partial class institution_theme_institution_theme : System.Web.UI.Page
{
    string queryErr = "";
    string builder;
    protected void Page_Load(object sender, EventArgs e)
    {
        string action = Request["action"];


        switch (action)
        {
            case "remove":
                Response.Write(Json.SerializeObject(delete()));
                Response.End();
                break;
            case "edit":
                Response.Write(Json.SerializeObject(info()));
                Response.End();
                break;
            default:
                Response.Clear();
                Response.ContentType = "application/json; charest=utf-8";
                Response.Write(list());
                Response.End();
                break;
        }

    }
    public string list()
    {
        try
        {
            builder = GlobalFunctions.GetConnectionString();
            using (SqlConnection conn = new SqlConnection(builder.ToString()))
            {
                conn.Open();
                using (SqlCommand cmd = conn.CreateCommand())
                {
                    string length = Request["length"];
                    string start = Request["start"];
                    cmd.CommandText = @"
                                        select top " + length + @" *
                                        from (
                                        select ROW_NUMBER() OVER (" + set_order() + @") as RowNumber,
                                        C as id, Kod ,rtrim(ltrim(Nm)) as Description 
                                        From Tas_Nose
                                      ";
                    cmd.CommandText += set_search();
                    cmd.CommandText = "" + cmd.CommandText + @"
                                            ) T
                                        where RowNumber>" + start + @"
                                        order by RowNumber";

                    queryErr = cmd.CommandText;
                    return Json.SerializeObject(GlobalFunctions.Serialize(cmd.ExecuteReader()));
                }
            }
        }
        catch (Exception ex)
        {
            GlobalFunctions.writeToLog("", GlobalFunctions.GetError(ex) + " >>>> queryErr=" + queryErr, "0", "0", "institution_theme.list");
            return "-1";
        }
    }
    private string set_order()
    {
        string order = Request["order"];
        string sorting = Request["sorting"];
        string sql_order = "order by ";

        switch (sorting)
        {
            case "description":
                sql_order += "Nm";
                break;
            default:
                sql_order += "Kod";
                break;
        }

        if (order == "1")
            sql_order += " desc";

        return sql_order;
    }
    private string set_search()
    {
        string id = Request["id"];
        string description = Request["description"];
        string sql_search = " where 1=1";
        if (!string.IsNullOrEmpty(description))
            sql_search += " and rtrim(ltrim(Tas_Nose.Nm)) like '%" + description + @"%' ";
        if (!string.IsNullOrEmpty(id))
            sql_search += " and Tas_Nose.Kod like '%" + id + @"%' ";

        return sql_search;
    }

    public JsonResponse info()
    {
        JsonResponse jresponse = new JsonResponse();

        jresponse.success = true;
        jresponse.Response = "institution_theme.aspx";
        try
        {
            builder = GlobalFunctions.GetConnectionString();
            using (SqlConnection conn = new SqlConnection(builder.ToString()))
            {
                conn.Open();
                using (SqlCommand cmd = conn.CreateCommand())
                {
                    string institution_theme_id = Request["institution_theme_id"];

                    cmd.CommandText = @"
                                        select
                                        C as id, Kod ,rtrim(ltrim(Nm)) as Description
                                        From Tas_Nose
                                        where C = " + GlobalFunctions.ChkEmptyString(institution_theme_id);

                    queryErr = cmd.CommandText;
                    jresponse.data = Json.SerializeObject(GlobalFunctions.Serialize(cmd.ExecuteReader()));
                }
            }
        }
        catch (Exception ex)
        {
            GlobalFunctions.writeToLog("", GlobalFunctions.GetError(ex) + " >>>> queryErr=" + queryErr, "0", "0", "institution_theme.info");
            jresponse.success = false;
        }
        return jresponse;
    }
    public JsonResponse delete()
    {
        JsonResponse jresponse = new JsonResponse();

        jresponse.success = true;
        string msg = "";
        jresponse.Response = "institution_theme.aspx";

        try
        {
            string id = Request["id"];

            builder = GlobalFunctions.GetConnectionString();
            using (SqlConnection conn = new SqlConnection(builder.ToString()))
            {
                conn.Open();
                using (SqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"
                                    delete
                                    From Tas_Nose
                                    where C=" + GlobalFunctions.ChkEmptyString(id);
                    queryErr = cmd.CommandText;
                    cmd.ExecuteReader();
                    msg = "הרשומה נמחקה בהצלחה";
                }
            }
        }
        catch (Exception ex)
        {
            GlobalFunctions.writeToLog("", GlobalFunctions.GetError(ex) + " >>>> queryErr=" + queryErr, "0", "0", "institution_theme.delete");
            jresponse.success = false;
            msg = "כפילות בנתונים";
        }
        jresponse.messages.Add(new messages(msg));
        return jresponse;
    }

    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]//Specify return format.
    public static string save(string Kod, string Description, string id = "")
    {
        JsonResponse jresponse = new JsonResponse();
        jresponse.success = true;
        jresponse.Response = "institution_theme.aspx";

        string msg = "";
        string queryErr = "";
        try
        {
            if (string.IsNullOrEmpty(Kod))
            {
                jresponse.errors.Add("[{ \"Kod\":\"FieldErrorInvalid\" }]");
                jresponse.success = false;
                return JsonConvert.SerializeObject(jresponse);
            }
            if (string.IsNullOrEmpty(Description))
            {
                jresponse.errors.Add("[{ \"Description\":\"FieldErrorInvalid\" }]");
                jresponse.success = false;
                return JsonConvert.SerializeObject(jresponse);
            }

            string builder = GlobalFunctions.GetConnectionString();
            using (SqlConnection conn = new SqlConnection(builder.ToString()))
            {
                conn.Open();
                using (SqlCommand cmd = conn.CreateCommand())
                {

                    cmd.CommandText = @"
                                        select 
                                        count(*) as cnt
                                        From Tas_Nose
                                        where Kod=" + GlobalFunctions.ChkEmptyString(Kod);
                    if (id != "")
                        cmd.CommandText += @" and C<>" + id;

                    string company = HttpContext.Current.Session["CurrCompany"].ToString();

                    queryErr = cmd.CommandText;
                    using (SqlDataReader rdr = cmd.ExecuteReader())
                    {
                        if (rdr.Read() && Convert.ToUInt64(rdr["cnt"]) > 0)
                        {
                            jresponse.errors.Add("[{ \"Kod\":\"FieldErrorInvalidCode\" }]");
                            jresponse.success = false;
                            return JsonConvert.SerializeObject(jresponse);
                        }
                    }

                    if (id == "")
                    {
                        cmd.CommandText = @"
                                            insert into Tas_Nose (Kod,Nm,Company)
                                            values(" + Kod + @",'" + Description + @"'," + company + @")
                                            select SCOPE_IDENTITY() as new_id;  
                                           ";
                        queryErr = cmd.CommandText;
                        var new_id = "0";
                        using (SqlDataReader rdr = cmd.ExecuteReader())
                        {
                            if (rdr.Read())
                            {
                                new_id = rdr["new_id"].ToString();
                            }
                        }

                        jresponse.data = "{\"id\": \"" + new_id + "\",\"Kod\": \"" + Kod + "\",\"Description\": \"" + Description + "\"}";
                        msg = "הרשומה התווספה בהצלחה";

                    }
                    else
                    {
                        cmd.CommandText = @"
                                        update Tas_Nose set
                                        Kod=" + Kod + @",
                                        Nm='" + Description + @"'
                                        where C=" + id + @"
                                       ";
                        queryErr = cmd.CommandText;
                        jresponse.data = Json.SerializeObject(GlobalFunctions.Serialize(cmd.ExecuteReader()));
                        msg = "הרשומה עודכנה בהצלחה";

                    }
                }
            }
        }
        catch (Exception ex)
        {
            GlobalFunctions.writeToLog("", GlobalFunctions.GetError(ex) + " >>>> queryErr=" + queryErr, "0", "0", "institution_theme.save");
            jresponse.success = false;
            msg = "כפילות בנתונים";
        }
        jresponse.messages.Add(new messages(msg));
        return JsonConvert.SerializeObject(jresponse);
    }
    [WebMethod]
    public static string get_form()
    {
        return File.ReadAllText(HttpContext.Current.Server.MapPath("institution_theme.html"));
    }
}