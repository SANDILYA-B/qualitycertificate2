const cds = require("@sap/cds");
const { XMLBuilder } = require("fast-xml-parser");

module.exports = cds.service.impl(async function () {
  const inspect = await cds.connect.to("API_INSPECTIONLOT_SRV");
  const outbound = await cds.connect.to("API_OUTBOUND_DELIVERY_SRV_0002");
  const { quality1, numberrange } = this.entities;

  this.on('READ', 'inslot', async (req) => {
    return await inspect.run(req.query);
  });

  this.on('READ', 'inschar', async (req) => {
    return await inspect.run(req.query);
  });

  this.on('READ', 'insres', async (req) => {
    return await inspect.run(req.query);
  });

  this.on('READ', 'obitem', async (req) => {
    return await outbound.run(req.query);
  });

  this.on('READ', 'obaddr', async (req) => {
    return await outbound.run(req.query);
  });

  this.before('CREATE', 'quality1', async req => {
    const { NumberRange } = this.entities;
    let nquery = SELECT.from(NumberRange).where({ object_name: 'outboundqc' });
    res = await cds.run(nquery);
    if (res.length == 1) {
      if (res[0].current_num) {
        new_num = Number(res[0].current_num) + 1
      } else {
        new_num = Number(res[0].from_num) + 1
      }
      updqry = UPDATE(NumberRange).data({ current_num: new_num }).where({ object_name: 'outboundqc' });
      await cds.run(updqry);
      req.data.certno = String(new_num);
    } else {
      req.error({ 'code': 'NOOUTBNUM', message: 'Outbound Number Not Set,Please set the Number Range' });
    }
  });

  this.on('printForm', 'quality1', async (req) => {
    try {
      const { inslot, inschar, insres, obitem, obaddr } = this.entities;

      console.log("Request Params--->", req.params[0]);

      const out_ids = req.params[0].ID;

      console.log("Outbound ID--->", out_ids);

      const post = await cds.run(SELECT.from(quality1).where({ ID: out_ids }));

      console.log("Post Data--->", post);

      const outboundtId = post[0].outbound;
      const outboundItem = post[0].outbounditem;

      // Fetch Outbound Item Data
      const obItemQuery = await outbound.run(
        SELECT.from(obitem).where({ DeliveryDocument: outboundtId, DeliveryDocumentItem: outboundItem })
      );

      if (!obItemQuery.length) {
        return req.error(404, "Outbound item not found");
      }

      const { ReferenceSDDocument, ReferenceSDDocumentItem } = obItemQuery[0];

      // Fetch Inspection Lot Data
      const insLotQuery = await inspect.run(
        SELECT.from(inslot).where({ SalesOrder: ReferenceSDDocument, SalesOrderItem: ReferenceSDDocumentItem })
      );

      if (!insLotQuery.length) {
        return req.error(404, "Inspection Lot not found");
      }

      // Map Inspection Lot Data with Characteristics and Results
      const inspectionLots = await Promise.all(insLotQuery.map(async (lot) => {
        const inspectionLotId = lot.InspectionLot;

        const insCharQuery = await inspect.run(
          SELECT.from(inschar).where({ InspectionLot: inspectionLotId })
        );

        const insResQuery = await inspect.run(
          SELECT.from(insres).where({ InspectionLot: inspectionLotId })
        );

        return {
          ...lot,
          InspectionCharacteristics: insCharQuery.length ? insCharQuery : {},
          InspectionResults: insResQuery.length ? insResQuery : {}
        };
      }));

      // Fetch Outbound Address Data
      const obAddrQuery = await outbound.run(
        SELECT.from(obaddr).where({ DeliveryDocument: outboundtId })
      );

      // Construct XML Data
      const xmlData = {
        QualityCertificate: {
          OutboundAddress: obAddrQuery.length ? obAddrQuery[0] : {},
          InspectionLots: inspectionLots.length ? inspectionLots : {},
          OutboundItem: obItemQuery[0],
        }
      };

      // Convert JSON to XML
      const xmlBuilder = new XMLBuilder({ format: true });
      const xmlOutput = xmlBuilder.build(xmlData);

      console.log("Generated XML:", xmlOutput);
      return xmlOutput;

    } catch (error) {
      console.error("Error generating XML:", error);
      return req.error(500, "Error generating XML");
    }
  });


});