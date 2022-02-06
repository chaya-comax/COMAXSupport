using System.Collections.Generic;

public class JsonResponseReport
{
    public JsonResponseReport()
    {
        success = true;
    }

    public bool success { get; set; }
    public object data { set; get; }
    public string Response { get; set; }
    public double total_documents_count { get; set; }
}