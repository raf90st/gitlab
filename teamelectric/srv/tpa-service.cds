using { tpa } from '../db/data-model';

service tpaService {
    entity chargeInfo as select from tpa.T_CHARGEINFO {*};
    entity correctionData as select from tpa.T_DATAQUALITY {*};
    entity log as select from tpa.T_LOG {*};

    type typeChargeInfo {
        CI_DATASOURCE : String;
	    CI_ACTUALDATE : String;
	    CI_KWH : String;
	    CI_CHARGEDURATION : String;
	    CI_NETCOST : String;
	    CI_CURRENCY : String;
	    CI_GROSSCOST : String;
	    CI_CHARGEID : String;
        CI_PROVIDER: String;
        CI_LOCATION: String;
        CI_LICENSEPLATE: String;
    }

    action updateChargeInfo(aCsvData : array of typeChargeInfo);
}