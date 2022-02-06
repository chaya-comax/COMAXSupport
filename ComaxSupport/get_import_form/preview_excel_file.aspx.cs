using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

public class ff
{
    public string files;
    public string header;
}
public partial class get_import_form_preview_excel_file : System.Web.UI.Page
{
    private const string CONNECTION_STRING = "Provider=Microsoft.ACE.OLEDB.12.0; Data Source=<FILENAME>;Extended Properties='Excel 8.0;HDR=Yes;';";

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
        #region Commented code for importing data from CSV file.
        //              string strConnectionString = "Provider=Microsoft.Jet.OLEDB.4.0;" +"Data Source=" + System.IO.Path.GetDirectoryName(fullFileName) +";" +"Extended Properties=\"Text;HDR=YES;FMT=Delimited\"";
        //
        //              System.Data.OleDb.OleDbConnection conText = new System.Data.OleDb.OleDbConnection(strConnectionString);
        //              new System.Data.OleDb.OleDbDataAdapter("SELECT * FROM " + System.IO.Path.GetFileName(fullFileName).Replace(".", "#"), conText).Fill(dsImport);
        //              return dsImport.Tables[0];

        #endregion
    }

    /// <summary>
    /// This method checks if the user entered sheetName exists in the Schema Table
    /// </summary>
    /// <param name="sheetName">Sheet name to be verified</param>
    /// <param name="dtSchema">schema table </param>
    private static bool CheckIfSheetNameExists(string sheetName, DataTable dtSchema)
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


    protected void Page_Load(object sender, EventArgs e)
    {
        string files = Request["files"];
        Response.Write(@"");
        Response.End();
    }

    [WebMethod]
    public static string insert(object files, object header)
    {
        string html = "";
        Mail Mail = new Mail();
        try
        {
            byte[] bytes = Convert.FromBase64String(files.ToString().Replace("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,", String.Empty));
            string f = "import" + "_" + DateTime.Now.ToString("dd_MM_yyyy_hh_mm_ss");

            string fileNm = GlobalFunctions.GetPath_Spool_UpLoad_UNC() + @"\" + f + ".xlsx";
            //string fileNm = @"\\comax-fs\x\InetPub\Comax\Max2000Upload\2475\" + f + ".xlsx";
            File.WriteAllBytes(fileNm, bytes);
            string sheet = null, tbl1 = "", tbl2 = "", thPrice = "", tdPrice = "";
            DataTable dt = GetDataTableFromExcelFile(fileNm, ref sheet);
            bool swPrice = false;
            string titleNm = "שם";
            switch (header.ToString())
            {
            }

            string rows = GetRows(tbl1, tbl2, swPrice);
            html = @"
            <div style='width:100%;'>
                <div class='enable-horizontal'>
                    <div class='col-sm-12'>
                        <table class='table dark-gray-color'>
                            <thead class='show-border'>
                                <tr>
                                    <th style='width:60px;'>סטטוס</th>
                                    <th style='width:80px;' class='text-right'>קוד</th>
                                    <th style='width:100px;'>" + titleNm + @"</th>" +
                                    thPrice + @"
                                </tr>
                            </thead>
                        </table>
                        <div class='row modal-complete-height scrollable'>
                            <div class='col-sm-12'>
                                <table class='table import-preview dark-gray-color'>
                                    <tbody>" +
                                            rows +
                                      @"</tbody>
                                    <tfoot>
                                        <tr>
                                            <td>
                                                <div class='spinner'>
                                                    <div></div>
                                                    <div></div>
                                                    <div></div>" +
                                                    tdPrice + @"
                                                </div>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ";
        }
        catch (Exception e)
        {
            Mail.SendtEmail("insert error", e.ToString());
        }
        return html;
    }

    private static string GetRows(string tbl1, string tbl2, bool swPrice)
    {
        string color, status, tr = "", sqlSelect = "", td = "";
        string builder = GlobalFunctions.GetConnectionString();

        if (swPrice)
            sqlSelect = ",t1.price";
        using (SqlConnection conn = new SqlConnection(builder.ToString()))
        {
            conn.Open();
            using (SqlCommand cmd = conn.CreateCommand())
            {
                string sql = @"
                                select isnull(t1.remarkErr,case when t2.C is null then 'חדש' else 'עדכון' end) as status,t1.code,t1.nm" + sqlSelect + @"
                                From " + tbl1 + @" t1
                                left join " + tbl2 + @" t2 on t1.code=t2.Kod
                              ";

                DataTable Dt = new DataTable();
                SqlDataAdapter Adpt = new SqlDataAdapter(sql, conn);
                Adpt.Fill(Dt);
                conn.Close();
                foreach (DataRow row in Dt.Rows)
                {
                    status = row["status"].ToString();
                    if (status == "שגוי")
                        color = "color:red;";
                    else
                        color = "";
                    if (swPrice)
                        td = @"<td style='width:80px;' class='text-right'>" + row["price"] + @"</td>";
                    tr += @"
                            <tr>
                                <td style='width:60px;" + color + @"'>
                                    " + row["status"] + @"
                                </td>
                                <td style='width:80px;'>" + row["code"] + @"</td>
                                <td style='width:100px;' class='text-right'>" + row["nm"] + @"</td>" +
                                td + @"
                            </tr>";
                }
            }
        }
        return tr;
    }


    
}