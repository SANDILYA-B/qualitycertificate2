namespace com.satinfotech.quality;
using {managed,cuid} from '@sap/cds/common';

entity quality1 : cuid,managed{ 

      @title: 'TC Number'
      tcnumber : String(80) @readonly;

      @title: 'OutBound Delivery'
      obdel : String(80);

      @title: 'OutBound Delivery Item'
      obdelitem : String(80);
}



entity numberrange: managed, cuid {
    @title: 'Object name'
    object_name: String(20);
    @title: 'Length of the Number'
    len_num: Integer;
    @title: 'Start Number'
    from_num: Integer64;
    @title: 'End Number'
    to_num: Integer64;
    @title: 'Current Number'
    current_num: Integer64 @readonly;
}
