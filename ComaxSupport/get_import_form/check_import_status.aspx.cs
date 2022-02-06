using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class get_import_form_check_import_status : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        var id = Request["id"];
        Response.Write(Json.SerializeObject(Status(id)));
        Response.End();
    }

    public ImportStatus Status(string id)
    {
        ImportStatus ImportStatus = new ImportStatus();
        ImportStatus.count = 1;
        ImportStatus.total = 1;
        ImportStatus.imported = 1;
        ImportStatus.updated = 0;
        return ImportStatus;
    }
}