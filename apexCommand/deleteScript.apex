/**
 * @description       : 
 * @author            : Kyle Tan
 * @group             : 
 * @last modified on  : 01-04-2025
 * @last modified by  : Kyle Tan
**/
delete [SELECT Id FROM WindFarmSite__c WHERE Country__c = 'Philippines' ORDER BY CreatedDate DESC];