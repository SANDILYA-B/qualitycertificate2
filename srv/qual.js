const cds = require("@sap/cds");
const { XMLBuilder } = require("fast-xml-parser");

module.exports = cds.service.impl(async function () {
  const inspect = await cds.connect.to("API_INSPECTIONLOT_SRV");
  const outbound = await cds.connect.to("API_OUTBOUND_DELIVERY_SRV_0002");
  const { quality1, numberrange } = this.entities;

  this.on("READ", "inslot", async (req) => inspect.run(req.query));
  this.on("READ", "inschar", async (req) => inspect.run(req.query));
  this.on("READ", "insres", async (req) => inspect.run(req.query));
  this.on("READ", "obitem", async (req) => outbound.run(req.query));
  this.on("READ", "obaddr", async (req) => outbound.run(req.query));

  this.before('CREATE', 'quality1', async req => {
    const { NumberRange } = this.entities;
    let nquery = SELECT.from(NumberRange).where({object_name: 'outboundqc'});
    res = await cds.run(nquery);
    if(res.length==1){ // If the requested object exists.
        if(res[0].current_num){
            new_num = Number(res[0].current_num) + 1
        }else{
            new_num = Number(res[0].from_num) + 1
        }
        updqry = UPDATE(NumberRange).data({current_num: new_num}).where({object_name: 'outboundqc'});
        await cds.run(updqry);
        req.data.certno=String(new_num);
    }else{
        req.error({'code': 'NOOUTBNUM',message:'Outbound Number Not Set,Please set the Number Range'});
    }
  });

  this.on('printForm', 'quality1', async (req) => {
    const { inslot,inschar,insres,obitem,obaddr, } = this.entities;
    let nquery = SELECT.from(quality1).where({ID: req.params[0].ID});
    let res = await cds.run(nquery);

    let inslotqry = SELECT.from(inslot).where({inspection_lot: res[0].inspection_lot});
    let inslotres = await cds.run(inslotqry);

    let inscharqry = SELECT.from(inschar).where({inspection_lot: res[0].inspection_lot});
    let inscharres = await cds.run(inscharqry);

    let insresqry = SELECT.from(insres).where({inspection_lot: res[0].inspection_lot});
    let insresres = await cds.run(insresqry);

    let obitemqry = SELECT.from(obitem).where({delivery: res[0].delivery});
    let obitemres = await cds.run(obitemqry);

    let obaddrqry = SELECT.from(obaddr).where({delivery: res[0].delivery});
    let obaddrres = await cds.run(obaddrqry);

    let xmlData = {
      "inspection_lot": res[0],
      "inslot": inslotres,
      "inschar": inscharres,
      "insres": insresres,
      "obitem": obitemres,
      "obaddr": obaddrres
    };

    return XMLBuilder.buildObject(xmlData);
    
  });
});