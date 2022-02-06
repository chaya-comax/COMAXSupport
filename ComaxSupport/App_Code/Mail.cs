using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;


public class Mail
{
    /* ***************************
    * Smtp Server 
    * **************************
    * Test - d02.native.local
    * ONLINE1 - mail.comax.co.il
    * ONLINE2 - mrelay.comax.co.il
    * ***************************/

    private List<string> _fileAttachments;
    private const string MAIL_FROM_ADDRESS = "comaxopr@comax.co.il";
    private const string SVNURL = "https:////dev-svn.comaxdev.local//svn//comax-dev//trunk//ComaxSupport";

    public string MailFrom { get; set; }
    public string[] MailTo { get; set; }
    public List<string> _MailTo { get; set; }
    public string MailSubject { get; set; }
    public string MailBody { get; set; }
    // public string MailBcc { get; set;}


    string _smtpServer;

    /// <summary>
    /// Default Constructor
    /// </summary>
    public Mail()
    {
        _fileAttachments = new List<string>();
        MailFrom = MAIL_FROM_ADDRESS;
        MailTo = DefaultEmail;
        _MailTo = new List<string>();
        try
        {
            _smtpServer = "mrelay.comax.co.il";
            //   _smtpServer = "native-exchange.native.local"; //--TEST
        }
        catch
        {
            _smtpServer = "native-exchange.native.local";
        }

    }

    public void FMailTo(string sMailTo)
    {
        _MailTo.Add(sMailTo);
    }

    public void SendtEmail(string sSubject, string sBodyOfMail)
    {
        try
        {
            sBodyOfMail = sBodyOfMail + "\n" + SVNURL;
            MailMessage oMail = new MailMessage(MailFrom, "sarahs@comax.co.il", sSubject, sBodyOfMail.Replace("/n", "<br>").Replace("\n", "<br>"));


            foreach (string item in MailTo)
            {
                oMail.To.Add(item);
            }

            foreach (string iteml in _MailTo)
            {
                oMail.To.Add(iteml);
            }

            SmtpClient oClient = new SmtpClient(_smtpServer);
            oMail.IsBodyHtml = true;
            oMail.BodyEncoding = System.Text.Encoding.UTF8;
            oClient.Send(oMail);
        }
        catch (Exception ex)
        {

        }

    }

    public bool SendMail(string iProgramNm, string iMikom, string iDocText, string iDocNm, string iFileNm, string iDivor_HafakaC, string iRemark, string iTomEmail, string iOdbc, string iUserCounter,
    string iSwSql, string iSugEmail, string iBodyText_File, string iFromEmail, string SwBodyText_File)
    {
        try
        {
            Type t = Type.GetTypeFromProgID("SendEmail_Spool.Insert_SpoolEmail_Send");
            if (t != null)
            {
                object obj = Activator.CreateInstance(t);
                if (obj != null)
                {
                    object[] prm = { iProgramNm,  iMikom,  iDocText,
                                          iDocNm,  iFileNm,  iDivor_HafakaC,
                                          iRemark,  iTomEmail,
                                          iOdbc,  iUserCounter,
                                          iSwSql,  iSugEmail,  iBodyText_File,
                                          iFromEmail,  SwBodyText_File, "null", "null"};

                    object result = t.InvokeMember("Main", System.Reflection.BindingFlags.InvokeMethod, null, obj, prm);
                    return result.ToString().IndexOf("1") == 0 ? true : false;
                }
            }
        }
        catch (Exception ex)
        {
            return false;
        }
        return false;
    }


    #region [   Static Methods    ]



    public static string[] DefaultEmail
    {

        get
        {

            string[] DefaultEmailArr = { "prog_err@comax.co.il", "sarahs@comax.co.il" };
            return DefaultEmailArr;
        }
    }

    #endregion
}
