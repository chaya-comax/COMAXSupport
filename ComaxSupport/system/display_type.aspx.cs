using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class system_display_type : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string is_list = Request["is_list"];
        string tab_id = Request["tab_id"];


        Response.Clear();
        Response.ContentType = "application/json; charest=utf-8";
        if (string.IsNullOrEmpty(is_list))
            Response.Write(DisplayType(tab_id));
        else
            Response.Write(ChangeType(tab_id, is_list));
        Response.End();

    }
    private string DisplayType(string tab_id)
    {

        string list = "0";
        string company = "1";//HttpContext.Current.Session["Company"].ToString();
        string user = HttpContext.Current.Session["UserC"].ToString();
        string builder = GlobalFunctions.GetConnectionString();
        /*using (SqlConnection conn = new SqlConnection(builder.ToString()))
        {
            using (SqlCommand cmd = conn.CreateCommand())
            {
                cmd.CommandText = " select 1 as list from DisplayType where userC=" + user + @" and program='" + tab_id + @"' and company=" + company;
                SqlDataReader reader;
                conn.Open();
                reader = cmd.ExecuteReader();
                if (reader.Read())
                    list = reader["list"].ToString();
                conn.Close();
            }
        }*/
        list = "1";
        return list;
    }
    public bool ChangeType(string tab_id, string is_list)
    {
        string company = HttpContext.Current.Session["CurrCompany"].ToString();
        string user = HttpContext.Current.Session["UserC"].ToString();
        string builder = GlobalFunctions.GetConnectionString();
        using (SqlConnection conn = new SqlConnection(builder.ToString()))
        {
            conn.Open();
            using (SqlCommand cmd = conn.CreateCommand())
            {
                if (is_list == "0")
                {
                    cmd.CommandText = @"delete from DisplayType where userC=" + user + @" and program='" + tab_id + @"' and company=" + company;
                }
                else
                {
                    cmd.CommandText = @"insert into DisplayType (userC,program,company) values (" + user + @" ,'" + tab_id + @"'," + company + @")";
                }
                cmd.ExecuteReader();
            }
            conn.Close();
        }

        return true;
    }
}