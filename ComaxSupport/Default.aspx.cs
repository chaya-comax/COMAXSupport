using System;
using System.ComponentModel.DataAnnotations;
using System.Data.SqlClient;
using System.Web;
using System.Web.DynamicData;
using System.IO;
using Newtonsoft.Json;
using System.Collections.Generic;

public partial class _Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string status = Request["status"];
        if (status == "login")
        {

            string lk = Request["lk"];
            string user_pass = Request["user_pass"];
            string password_pass = Request["password_pass"];
            if (Request.Url.ToString().IndexOf("localhost") != -1 && !(lk == "911111" && user_pass == "12345678" && password_pass == "123456"))
            {
                lk = "מתכנתים";
                user_pass = "a12345678";
                password_pass = "a87654321";
            }

            Response.Write(Json.SerializeObject(LogIn(lk, user_pass, password_pass)));
            Response.End();
        }
        if (status == "changeLanguage")
        {
            string N_Lang = Request["N_Lang"];
            Response.Write(Json.SerializeObject(ChangeLanguage(N_Lang)));
            Response.End();
        }
        if (status == "SetPrm")
        {
            Response.Write(Json.SerializeObject(SetPrm()));
            Response.End();
        }
        if (status == "logout")
            Session.Clear();
    }
    private JsonResponse LogIn(string lk, string user_pass, string password_pass)
    {
        JsonResponse jresponse = new JsonResponse();

        jresponse.success = false;
        jresponse.Response = "Default.aspx";
        try
        {
            if (lk != "" && user_pass != "" && password_pass != "")
            {
                DetailsOdbc DetailsOdbc = GlobalFunctions.ReturnOdbc(lk);
                //SqlConnectionStringBuilder builder = GlobalFunctions.getLkConnString(DetailsOdbc.Odbc, DetailsOdbc.SwSQL);
                SqlConnectionStringBuilder builder = GlobalFunctions.getLogConnString("BinaIQ_PROD", "-2");

                if (DetailsOdbc.C.ToString() != "0")
                {

                    string s = GlobalFunctions.GetParamOdbc(DetailsOdbc.Odbc.ToString());
                    string OdbcUserName = GlobalFunctions.GetPrm(s, "oUsr");
                    string OdbcPassword = GlobalFunctions.GetPrm(s, "oPass");

                    ResetSession(DetailsOdbc, builder.ToString(), OdbcUserName, OdbcPassword);

                    var IP = Request.ServerVariables["REMOTE_ADDR"];
                    var SessionID = DateTime.Now.ToString("yyyyMMddHHmmss");
                    jresponse.success = true;
                    string msg = "Err";
                    /*msg = GlobalFunctions.login(IP, "0", DetailsOdbc.C.ToString(), "'" + user_pass + "'", "'" + password_pass + "'", SessionID, DetailsOdbc.Odbc, OdbcUserName, OdbcPassword);
                    if (msg != "ErrIP" && msg != "Err" && msg != "ErrD" && msg != "0" && msg != "ErrCountUsr" && msg != "ErrInUsr")
                    {
                        string LogInC = GlobalFunctions.getVfS(msg, "LogInC");
                        string C = GlobalFunctions.getVfS(msg, "C");
                        if (LogInC != "")
                        {

                            using (SqlConnection conn = new SqlConnection(GlobalFunctions.getLkConnString("Max2000_BackOffice", "").ToString()))
                            {
                                conn.Open();
                                using (SqlCommand cmd = conn.CreateCommand())
                                {
                                    cmd.CommandText = @"update Max2000_Lib..LogInsUsers set TimeLogOut=getdate(),SwIn=9 where C=" + LogInC;
                                    cmd.ExecuteReader();
                                }
                                conn.Close();
                            }

                            using (SqlConnection conn = new SqlConnection(builder.ToString()))
                            {
                                conn.Open();
                                using (SqlCommand cmd = conn.CreateCommand())
                                {
                                    cmd.CommandText = @"SELECT SwTest = (SELECT isnull(SwTest, 0) From Max2000_BackOffice..Lk where C = " + DetailsOdbc.C + @"),
                                                        Desktop_Coordimatot as YX,isnull(SwLoMhrUpdate,0) as SwLoMhrUpdate,
                                                        isnull(Wcompany,0) as Wcompany,isnull(Wyear,0) as Wyear, isnull(Users.WSnif,0) as WSnif,
                                                        Desktop_Date as Dat,isnull(SwBooker,0) as SwBooker, 
                                                        rtrim(Desktop_UserName) as UName, 
                                                        Users.C as C,Users.Kod,
                                                        isnull(FullGrafika,0) as FullGrafika,
                                                        rtrim(Users.Nm) as Nm,
                                                        isnull(LastApp,0) as LastApp, 
                                                        isnull(Super,0) as Super, 
                                                        isnull(Table_Rows,4) as Table_Rows, 
                                                        isnull(FastLine,0) as FastLine, 
                                                        isnull(ProgNm,0) as ProgNm, 
                                                        isnull(SwOrderCell,0) as SwOrderCell, 
                                                        isnull(SwEnter,0) as SwEnter, 
                                                        isnull(ViewOnly,0) as ViewOnly, 
                                                        isnull(SwLoMhrM,0) as SwLoMhrM, isnull(SwLoMhrR,0) as SwLoMhrR, isnull(SwLoSaveLine,0) as SwLoSaveLine,
                                                        isnull(SelectType,0) as SelectType, 
                                                        isnull(SwTblBorder,0) as SwTblBorder, 
                                                        isnull(SwCalender,0) as SwCalender,
                                                        isnull(A.SwCompany,0) as SwCompany,
                                                        (case when isnull(SelectLines,0)=0 or (isnull(SelectLines,0)<>20 and isnull(SelectLines,0)<>40 and isnull(SelectLines,0)<>50 and isnull(SelectLines,0)<>70 and isnull(SelectLines,0)<>90 and isnull(SelectLines,0)<>100) then 50 else SelectLines end) as SelectLines 
                                                        FROM Users 
                                                        left join Max2000_Lib..Applications as A on A.Kod=Users.LastApp 
                                                        WHERE Users.C=" + C;

                                    using (SqlDataReader rdr = cmd.ExecuteReader())
                                    {
                                        if (rdr.Read())
                                        {
                                            HttpContext.Current.Session["UserC"] = GlobalFunctions.SetString(rdr["C"]).ToString();
                                            HttpContext.Current.Session["UserNm"] = GlobalFunctions.SetString(rdr["Nm"]).ToString();
                                            HttpContext.Current.Session["UserKod"] = GlobalFunctions.SetString(rdr["Kod"]).ToString();
                                            HttpContext.Current.Session["UserAdmin"] = GlobalFunctions.SetString(rdr["Super"]).ToString();
                                            HttpContext.Current.Session["ZorbaApp"] = GlobalFunctions.SetString(rdr["LastApp"]).ToString();
                                            HttpContext.Current.Session["CurrCompany"] = rdr["Wcompany"].ToString();
                                            HttpContext.Current.Session["CurrSnif"] = rdr["WSnif"].ToString();
                                            HttpContext.Current.Session["CompanyName"] = "";
                                            HttpContext.Current.Session["Prt_Company"] = "";
                                            HttpContext.Current.Session["SwSnif"] = "";
                                            HttpContext.Current.Session["SnifNm"] = "";
                                            jresponse.success = true;
                                            jresponse.msg = DetailsOdbc.Name;
                                        }
                                    }
                                }

                                using (SqlCommand cmd = conn.CreateCommand())
                                {
                                    cmd.CommandText = @"select case when isnull(SwBO,0)= 1 then 'B' else case when SwVisit = 0 then '' else convert(char, SwVisit) end end as cn from LogInsUsers where C = " + LogInC;

                                    using (SqlDataReader rdr = cmd.ExecuteReader())
                                    {
                                        if (rdr.Read())
                                        {
                                            if (GlobalFunctions.SetString(rdr["SwBO"]).ToString() == "1" && HttpContext.Current.Session["UserKod"].ToString() == "9999")
                                                HttpContext.Current.Session["SwUserComax"] = "1";
                                        }
                                    }
                                }
                                using (SqlCommand cmd = conn.CreateCommand())
                                {
                                    cmd.CommandText = @"SELECT top 1 Company.Kod,ltrim(rtrim(Company.Nm)) as Nm,ltrim(rtrim(Company.eNm)) as eNm,isnull(Company.Prt_Company,Company.C) as Prt_Company, 
                                                        isnull(Company.Moadon_Company,Company.C) as Moadon_Company,
                                                        case when AczNikui is null then 0 else 1 end as SwAczNikui,convert(money,isnull(AczNikui,0))  as AczNikui,isnull(NoMaam,0) as NoMaam,
                                                        isnull(Snif.Kod,0) as SnifKod, rtrim(ltrim(Snif.Nm)) as SnifNm,isnull(SwCompEilat,0) as SwCompEilat,
                                                        case when isnull(NSnif,0)=0 then 0 else 1 end  as SwSnif,isnull(Prt_NoUpdate,0) as Prt_NoUpdate, 
                                                        isnull(PageSize,0) as PageSize,isnull(TimeZone,0) as TimeZone 
                                                        FROM Company 
                                                        left join Snif on Snif.C=" + HttpContext.Current.Session["CurrSnif"].ToString() + @"
                                                        left JOIN(select Count(*) as NSnif,Company from Snif group by Company) as ns ON ns.Company = Company.C
                                                        WHERE Company.C =" + HttpContext.Current.Session["CurrCompany"].ToString();

                                    using (SqlDataReader rdr = cmd.ExecuteReader())
                                    {
                                        if (rdr.Read())
                                        {
                                            DetailsOdbc.Name = GlobalFunctions.SetString(rdr["Nm"]).ToString();
                                            HttpContext.Current.Session["CompanyName"] = DetailsOdbc.Name;
                                            HttpContext.Current.Session["Prt_Company"] = GlobalFunctions.SetString(rdr["Prt_Company"]).ToString();
                                            HttpContext.Current.Session["SwSnif"] = GlobalFunctions.SetString(rdr["SwSnif"]).ToString();
                                            HttpContext.Current.Session["SnifNm"] = GlobalFunctions.SetString(rdr["SnifNm"]).ToString();
                                            jresponse.success = true;
                                            jresponse.msg = DetailsOdbc.Name;
                                        }
                                    }
                                }
                                conn.Close();
                            }
                        }
                    }
                    else
                        jresponse.msg = msg.ToString();*/
                }
            }
        }
        catch (Exception ex)
        { }
        return jresponse;
    }
    private JsonResponse SetPrm()
    {
        JsonResponse jresponse = new JsonResponse();

        jresponse.success = false;
        jresponse.Response = "Default.aspx";
        try
        {
            jresponse.messages.Add(new messages(HttpContext.Current.Session["CompanyName"].ToString(), "title"));
            jresponse.messages.Add(new messages(DateTime.Now.Year.ToString(), "year"));
            jresponse.messages.Add(new messages(HttpContext.Current.Session["UserNm"].ToString(), "user"));
            jresponse.messages.Add(new messages(HttpContext.Current.Session["SwSnif"].ToString(), "SwSnif"));
            jresponse.messages.Add(new messages(HttpContext.Current.Session["CurrSnif"].ToString(), "CurrSnif"));
            jresponse.messages.Add(new messages(HttpContext.Current.Session["SnifNm"].ToString(), "SnifNm"));

            using (SqlConnection conn = new SqlConnection(GlobalFunctions.GetConnectionString().ToString()))
            {
                conn.Open();
                using (SqlCommand cmd = conn.CreateCommand())
                {
                    /*cmd.CommandText = @"select Users.C,Users.Nm,Users.Kod,isnull(Users.N_Lang,0) as N_Lang
                                        from Users
                                        where C=" + HttpContext.Current.Session["UserC"].ToString();
                    using (SqlDataReader rdr = cmd.ExecuteReader())
                    {
                        if (rdr.Read())
                            jresponse.messages.Add(new messages(GlobalFunctions.SetString(rdr["N_Lang"]).ToString(), "N_Lang"));
                    }*/
                    jresponse.messages.Add(new messages(GlobalFunctions.SetString("0"), "N_Lang"));
                }
                conn.Close();
            }

            jresponse.success = true;
        }
        catch (Exception ex)
        { }
        return jresponse;
    }
    private JsonResponse ChangeLanguage(string N_Lang)
    {
        JsonResponse jresponse = new JsonResponse();

        jresponse.success = false;
        jresponse.Response = "Default.aspx";
        try
        {
            string userC = HttpContext.Current.Session["UserC"].ToString();
            string builder = GlobalFunctions.GetConnectionString();
            using (SqlConnection conn = new SqlConnection(builder.ToString()))
            {
                conn.Open();
                using (SqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"update Users set N_Lang=" + N_Lang + @" where C=" + userC;
                    cmd.ExecuteReader();
                    jresponse.success = true;
                }
                conn.Close();
            }
            GetDictionary(N_Lang);
        }
        catch (Exception ex)
        { }
        return jresponse;
    }
    private void GetDictionary(string N_Lang)
    {
        try
        {
            string path;
            using (SqlConnection conn = new SqlConnection(GlobalFunctions.getLkConnString("Max2000_BackOffice", "").ToString()))
            {
                conn.Open();
                using (SqlCommand cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"select Code,Word from Max2000_Lib..Dictionary_Pages_Words where Language=";
                    if (N_Lang == "1")
                    {
                        cmd.CommandText += @"1033";
                        path = AppDomain.CurrentDomain.BaseDirectory + @"locales\en-US.json";
                    }
                    else
                    {
                        cmd.CommandText += @"1037";
                        path = AppDomain.CurrentDomain.BaseDirectory + @"locales\he.json";
                    }

                    var result = new Dictionary<string, object>();
                    SqlDataReader reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        result.Add(reader["Code"].ToString(), reader["Word"].ToString());
                    }
                    string json = Json.SerializeObject(result).Replace("[", "").Replace("]", "");
                    File.WriteAllText(path, json);
                }
            }
        }
        catch (Exception ex)
        { }
    }
    private void ResetSession(DetailsOdbc DetailsOdbc, string builder, string OdbcUserName, string OdbcPassword)
    {
        HttpContext.Current.Session["Odbc"] = DetailsOdbc.Odbc.ToString();
        HttpContext.Current.Session["SwSQL"] = DetailsOdbc.SwSQL.ToString();
        HttpContext.Current.Session["builder"] = builder;
        HttpContext.Current.Session["Lk"] = DetailsOdbc.C.ToString();
        HttpContext.Current.Session["OdbcUserName"] = OdbcUserName;
        HttpContext.Current.Session["OdbcPassword"] = OdbcPassword;
        HttpContext.Current.Session["UserC"] = "";
        HttpContext.Current.Session["UserNm"] = "";
        HttpContext.Current.Session["UserKod"] = "";
        HttpContext.Current.Session["UserAdmin"] = "";
        HttpContext.Current.Session["ZorbaApp"] = "";
        HttpContext.Current.Session["CurrCompany"] = "";
        HttpContext.Current.Session["CurrSnif"] = "";
        HttpContext.Current.Session["CompanyName"] = "";
        HttpContext.Current.Session["Prt_Company"] = "";
        HttpContext.Current.Session["SwSnif"] = "";
        HttpContext.Current.Session["SnifNm"] = "";
        HttpContext.Current.Session["CompanyName"] = "";
        HttpContext.Current.Session["Prt_Company"] = "";
        HttpContext.Current.Session["SwSnif"] = "";
        HttpContext.Current.Session["SnifNm"] = "";
        HttpContext.Current.Session["SwUserComax"] = "";
        HttpContext.Current.Session["swVisit"] = "0";//todo
        HttpContext.Current.Session["CurrYear"] = DateTime.Now.Year.ToString();//todo
    }
}
