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

public partial class form_product_product : System.Web.UI.Page
{
    public class ListData
    {
        public bool addLog { get; set; }
        public int length { get; set; }
        public int order { get; set; }
        public int start { get; set; }
        public string productName { get; set; }
        public string sorting { get; set; }
    }
    public class SaveData
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
    public class InfoData
    {
        public string product_id { get; set; }
    }
    public class DeleteData
    {
        public string id { get; set; }
    }


    protected void Page_Load(object sender, EventArgs e)
    { }
    private static string set_order(ListData listData)
    {
        string sql_order = "order by ";

        switch (listData.sorting)
        {
            case "productName":
                sql_order += "Name";
                break;
            default:
                sql_order += "Name";
                break;
        }

        if (listData.order == 1)
            sql_order += " desc";

        return sql_order;
    }
    private static string set_search(ListData listData)
    {
        string sql_search = " where 1=1";
        if (!string.IsNullOrEmpty(listData.productName))
            sql_search += " and rtrim(ltrim(Products.Name)) like '%" + listData.productName + @"%' ";

        return sql_search;
    }

    [WebMethod]
    public static string list(ListData listData)
    {
        string queryErr = "";
        try
        {
            string builder = GlobalFunctions.GetConnectionString();
            using (SqlConnection conn = new SqlConnection(builder.ToString()))
            {
                conn.Open();
                using (SqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"
                                        select top " + listData.length + @" *
                                        from (
                                        select ROW_NUMBER() OVER (" + set_order(listData) + @") as RowNumber,
                                        Id as id ,rtrim(ltrim(Name)) as Name 
                                        From Products
                                      ";
                    cmd.CommandText += set_search(listData);
                    cmd.CommandText = "" + cmd.CommandText + @"
                                            ) T
                                        where RowNumber>" + listData.start + @"
                                        order by RowNumber";

                    queryErr = cmd.CommandText;
                    return Json.SerializeObject(GlobalFunctions.Serialize(cmd.ExecuteReader()));
                }
            }
        }
        catch (Exception ex)
        {
            GlobalFunctions.writeToLog("", GlobalFunctions.GetError(ex) + " >>>> queryErr=" + queryErr, "0", "0", "product.list");
            return "-1";
        }
    }

    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]//Specify return format.
    public static string save(SaveData saveData)
    {
        JsonResponse jresponse = new JsonResponse();
        jresponse.success = true;
        jresponse.Response = "product.aspx";

        string msg = "";
        string queryErr = "";
        try
        {
            if (string.IsNullOrEmpty(saveData.Name))
            {
                jresponse.errors.Add("[{ \"ProductName\":\"FieldErrorInvalid\" }]");
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
                                        From Products
                                        where Name=" + GlobalFunctions.ChkEmptyString(saveData.Name);
                    if (saveData.Id != "")
                        cmd.CommandText += @" and Id<>" + saveData.Id;

                    queryErr = cmd.CommandText;
                        using (SqlDataReader rdr = cmd.ExecuteReader())
                        {
                            if (rdr.Read() && Convert.ToUInt64(rdr["cnt"]) > 0)
                            {
                                jresponse.errors.Add("[{ \"ProductName\":\"FieldErrorInvalidCode\" }]");
                                jresponse.success = false;
                                return JsonConvert.SerializeObject(jresponse);
                            }
                        }

                    if (saveData.Id == "")
                    {
                        cmd.CommandText = @"
                                            insert into Products (Name)
                                            values(" + GlobalFunctions.ChkEmptyString(saveData.Name) +")";

                        msg = "הרשומה התווספה בהצלחה";
                    }
                    else
                    {
                        cmd.CommandText = @"
                                        update Products set
                                        Name=" + GlobalFunctions.ChkEmptyString(saveData.Name) + @"
                                        where Id=" + GlobalFunctions.ChkEmptyString(saveData.Id) + @"
                                       ";
                        msg = "הרשומה עודכנה בהצלחה";

                    }
                    queryErr = cmd.CommandText;
                    jresponse.data = Json.SerializeObject(GlobalFunctions.Serialize(cmd.ExecuteReader()));
                }
            }
        }
        catch (Exception ex)
        {
            GlobalFunctions.writeToLog("", GlobalFunctions.GetError(ex) + " >>>> queryErr=" + queryErr, "0", "0", "product.save");
            jresponse.success = false;
            msg = "כפילות בנתונים";
        }
        jresponse.messages.Add(new messages(msg));
        return JsonConvert.SerializeObject(jresponse);
    }

    [WebMethod]
    public static string get_form()
    {
        return File.ReadAllText(HttpContext.Current.Server.MapPath("product.html"));
    }

    [WebMethod]
    public static JsonResponse info(InfoData infoData)
    {
        JsonResponse jresponse = new JsonResponse();

        jresponse.success = true;
        jresponse.Response = "product.aspx";

        string queryErr = "";
        try
        {
            string builder = GlobalFunctions.GetConnectionString();
            using (SqlConnection conn = new SqlConnection(builder.ToString()))
            {
                conn.Open();
                using (SqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"
                                        select 
                                        rtrim(ltrim(Name)) as Name,Id
                                        From Products
                                        where Id=" + GlobalFunctions.ChkEmptyString(infoData.product_id);

                    queryErr = cmd.CommandText;
                    jresponse.data = Json.SerializeObject(GlobalFunctions.Serialize(cmd.ExecuteReader()));
                }
            }
        }
        catch (Exception ex)
        {
            GlobalFunctions.writeToLog("", GlobalFunctions.GetError(ex) + " >>>> queryErr=" + queryErr, "0", "0", "product.info");
            jresponse.success = false;
        }
        return jresponse;
    }

    [WebMethod]
    public static JsonResponse delete(DeleteData deleteData)
    {
        JsonResponse jresponse = new JsonResponse();

        jresponse.success = true;
        string msg = "", queryErr = "";
        jresponse.Response = "product.aspx";

        try
        {

            string builder = GlobalFunctions.GetConnectionString();
            using (SqlConnection conn = new SqlConnection(builder.ToString()))
            {
                conn.Open();
                using (SqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"
                                    delete
                                    From Products
                                    where Id=" + GlobalFunctions.ChkEmptyString(deleteData.id);
                    queryErr = cmd.CommandText;
                    cmd.ExecuteReader();
                    msg = "הרשומה נמחקה בהצלחה";
                }
            }
        }
        catch (Exception ex)
        {
            GlobalFunctions.writeToLog("", GlobalFunctions.GetError(ex) + " >>>> queryErr=" + queryErr, "0", "0", "product.delete");
            jresponse.success = false;
            msg = "כפילות בנתונים";
        }
        jresponse.messages.Add(new messages(msg));
        return jresponse;
    }
}