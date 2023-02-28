public with sharing class TestAuraController {
    
     //API Secret Key
    private static string key = '816521585707-lvdkgvro4cmi69rnuu2308p7hkbqoeg4.apps.googleusercontent.com';
    //API Secret
    private Static string secert = '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';
    //API Redirect. Use your Lightning Tab or Lightning community URL
    private Static string redirect_uri = 'https://power-drive-2498-dev-ed.scratch.lightning.force.com/';
    private static string authUrl='https://accounts.google.com/o/oauth2/v2/auth';
    //private static string scope='https://www.googleapis.com/auth/fitness.activity.read';
    private static string scope='https://www.googleapis.com/auth/drive';
    
    private static string tokenUrl='https://accounts.google.com/o/oauth2/token';
    
    
	@AuraEnabled(cacheable=true)
	public static String createAuthURL() {
        String key = EncodingUtil.urlEncode(key,'UTF-8');
        String uri = EncodingUtil.urlEncode(redirect_uri,'UTF-8');
        String authuri = '';
        authuri = authUrl+'?'+
            'client_id='+key+
            '&response_type=code'+
            '&scope='+scope+
            '&redirect_uri='+uri+
            '&access_type=offline';
        return authuri;
    }
    
    @AuraEnabled
    public static boolean getAccessToken(String code)
    {
        //Getting access token from google
        HttpRequest req = new HttpRequest();
        req.setMethod('POST');
        req.setEndpoint(tokenUrl);
        req.setHeader('content-type', 'application/x-www-form-urlencoded');
        
        String messageBody ='code='+code+'&client_id='+key+
            '&client_secret='+secert+
            '&redirect_uri='+redirect_uri+
            '&grant_type=authorization_code';
        req.setHeader('Content-length', String.valueOf(messageBody.length()));
        req.setBody(messageBody);
        req.setTimeout(60*1000);
       	system.debug('messageBody:'+messageBody);
        
        Http callout = new Http();
        String responseText;
        HttpResponse response = callout.send(req);
        responseText = response.getBody();
        system.debug('responseText:'+responseText);
        Map<String,object> responseMap =(Map<String,object>)JSON.deserializeUntyped(responseText) ;  
        String token =  String.valueOf(responseMap.get('access_token'));
        system.debug('token:'+token);
        
        //Update token in custom metadata 
        //MetadataService.UpdateCustomMetadata(token);
        Metadata.CustomMetadata customMetadata =  new Metadata.CustomMetadata();
        customMetadata.fullName = 'GoogleAuthSetting.AccessToken';
        customMetadata.label = 'AccessToken';
        customMetadata.protected_x = true;
        
        Metadata.CustomMetadataValue accessToken = new Metadata.CustomMetadataValue();
        accessToken.field = 'AccessToken__c';
        accessToken.value = token;
        customMetadata.values.add(accessToken);
        
        Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();
        mdContainer.addMetadata(customMetadata);
        CustomMetadataCallback callback = new CustomMetadataCallback();
        Id jobId = Metadata.Operations.enqueueDeployment(mdContainer, callback);
        
        return true;
    }
    
}