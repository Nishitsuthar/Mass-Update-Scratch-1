public class TestVFController {
	public string lexOrigin {get{ 
    return URL.getOrgDomainUrl().toExternalForm().split('.my.')[0]+'.lightning.force.com';
    } set;}
}