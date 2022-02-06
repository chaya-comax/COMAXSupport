using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for Json
/// </summary>
public class Json
{
    public static string SerializeObject(object obj)
    {
        return Newtonsoft.Json.JsonConvert.SerializeObject(obj);
    }
}