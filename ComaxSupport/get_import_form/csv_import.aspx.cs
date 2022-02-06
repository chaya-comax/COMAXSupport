using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class get_import_form_csv_import : System.Web.UI.Page
{
    string builder;
    protected void Page_Load(object sender, EventArgs e)
    {
        string data = Request["data"];
        string tbl = data + "_" + DateTime.Now.ToString("dd_MM_yyyy");

        switch (data)
        {
        }
    }

    
 }