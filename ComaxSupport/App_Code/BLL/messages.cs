/// <summary>
/// Summary description for messages
/// </summary>
public class messages
{
    public messages()
    {
        message = "";
        type = "success";
    }
    public messages(string m)
    {
        message = m;
    }

    public messages(string m,string t)
    {
        message = m;
        type = t;
    }

    public string message { get; set; }
    public string type { get; set; }
}