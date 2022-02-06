using System.Collections.Generic;

/// <summary>
/// Summary description for JsonResponse
/// </summary>
public class JsonResponse
{
    public JsonResponse()
    {
        success = true;
        Errors = new JsonSortableDictionary<string, string>();
        InfoResult = new List<string>();
        messages = new List<messages>();
        errors = new List<string>();
        errors_list = new List<Dictionary<string, string>>();
        msg = "";
    }

    public static JsonResponse SuccessResult(JsonSortableDictionary<string, string> result)
    {
        return new JsonResponse()
        {
            Info = result,
            success = true,
        };
    }

    public JsonSortableDictionary<string, string> Info { get; set; }
    public bool success { get; set; }
    public JsonSortableDictionary<string, string> Errors { get; set; }
    public List<string> InfoResult { get; set; }
    public object data { set; get; }
    public List<messages> messages { get; set; }
    public List<string> errors { get; set; }
    public List<Dictionary<string, string>> errors_list { get; set; }
    public string Framelocation { get; set; }
    public string Prm { get; set; }
    public string Response { get; set; }
    public string msg { get; set; }
}