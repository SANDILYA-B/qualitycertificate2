const cds = require("@sap/cds");
const { create } = require('xmlbuilder2');

module.exports = cds.service.impl(async function () {
  const inspect = await cds.connect.to("API_INSPECTIONLOT_SRV");
  const outbound = await cds.connect.to("API_OUTBOUND_DELIVERY_SRV_0002");
  const { quality1, numberrange } = this.entities;

  const { inslot, inschar, insres, obitem, obaddr } = this.entities;

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

  // this.on('printForm', 'quality1', async (req) => {
  //   try {
  //     const out_ids = req.params[0].ID;
  //     console.log("Outbound ID--->", out_ids);

  //     const post = await cds.run(SELECT.from(quality1).where({ ID: out_ids }));
  //     console.log("Post Data--->", post);

  //     const outboundtId = post[0].outbound;
  //     const outboundItem = post[0].outbounditem;

  //     const obItemQuery = await outbound.run(
  //       SELECT.from(obitem).where({ DeliveryDocument: outboundtId, DeliveryDocumentItem: outboundItem })
  //     );

  //     if (!obItemQuery.length) {
  //       return req.error(404, "Outbound item not found");
  //     }

  //     const { ReferenceSDDocument, ReferenceSDDocumentItem } = obItemQuery[0];

  //     const insLotQuery = await inspect.run(
  //       SELECT.from(inslot).where({ SalesOrder: ReferenceSDDocument, SalesOrderItem: ReferenceSDDocumentItem })
  //     );

  //     if (!insLotQuery.length) {
  //       return req.error(404, "Inspection Lot not found");
  //     }

  //     const inspectionLots = await Promise.all(insLotQuery.map(async (lot) => {
  //       const inspectionLotId = lot.InspectionLot;

  //       console.log("Inspection Lot ID--->", inspectionLotId);

  //       const insCharQuery = await inspect.run(
  //         SELECT.from(inschar).where({ InspectionLot: inspectionLotId })
  //       );

  //       const insResQuery = await inspect.run(
  //         SELECT.from(insres).where({ InspectionLot: inspectionLotId })
  //       );

  //       return {
  //         ...lot,
  //         InspectionCharacteristics: insCharQuery.length
  //           ? insCharQuery.map(result => ({
  //             ...result,
  //             InspectionResults: insResQuery.filter(char => char.InspectionLot === inspectionLotId)
  //           }))
  //           : []
  //       };
  //     }));

  //     const obAddrQuery = await outbound.run(
  //       SELECT.from(obaddr).where({ DeliveryDocument: outboundtId })
  //     );

  //     const structuredData = {
  //       QualityCertificate: {
  //         OutboundAddress: obAddrQuery.length ? obAddrQuery[0] : {},
  //         InspectionLots: inspectionLots.length ? inspectionLots : {},
  //         OutboundItem: obItemQuery[0],
  //       }
  //     };

  //     function ensureEmptyTags(obj) {
  //       if (Array.isArray(obj)) {
  //         return obj.length === 0 ? {} : obj.map(ensureEmptyTags);
  //       } else if (typeof obj === 'object' && obj !== null) {
  //         return Object.fromEntries(
  //           Object.entries(obj).map(([key, value]) => [key, ensureEmptyTags(value)])
  //         );
  //       }
  //       return obj;
  //     }

  //     const updatedJsonData = ensureEmptyTags(structuredData);

  //     const xml = create(updatedJsonData).end({ prettyPrint: true });

  //     console.log("Generated XML:", xml);

  //     return xml;
  //   } catch (error) {
  //     console.error("Error generating XML:", error);
  //     return req.error(500, "Error generating XML");
  //   }
  // });

  //   const fs = require('fs'); // Required for file writing

  // this.on('printForm', 'quality1', async (req) => {
  //   try {
  //     const out_ids = req.params[0]?.ID;
  //     if (!out_ids) {
  //       console.error("Outbound ID is missing");
  //       return req.error(400, "Outbound ID is required");
  //     }
  //     console.log("Outbound ID--->", out_ids);

  //     const post = await cds.run(SELECT.from(quality1).where({ ID: out_ids }));
  //     if (!post.length) {
  //       console.error("No data found for the given Outbound ID");
  //       return req.error(404, "Quality1 data not found");
  //     }
  //     console.log("Post Data--->", post);

  //     const outboundtId = post[0].outbound;
  //     const outboundItem = post[0].outbounditem;

  //     const obItemQuery = await outbound.run(
  //       SELECT.from(obitem).where({ DeliveryDocument: outboundtId, DeliveryDocumentItem: outboundItem })
  //     );
  //     if (!obItemQuery.length) {
  //       console.error("Outbound item not found for outboundtId:", outboundtId);
  //       return req.error(404, "Outbound item not found");
  //     }
  //     const { ReferenceSDDocument, ReferenceSDDocumentItem } = obItemQuery[0];

  //     const insLotQuery = await inspect.run(
  //       SELECT.from(inslot).where({ SalesOrder: ReferenceSDDocument, SalesOrderItem: ReferenceSDDocumentItem })
  //     );
  //     if (!insLotQuery.length) {
  //       console.error("Inspection Lot not found for SalesOrder:", ReferenceSDDocument);
  //       return req.error(404, "Inspection Lot not found");
  //     }

  //     const inspectionLots = await Promise.all(insLotQuery.map(async (lot) => {
  //       const inspectionLotId = lot.InspectionLot;
  //       console.log("Inspection Lot ID--->", inspectionLotId);

  //       const insCharQuery = await inspect.run(
  //         SELECT.from(inschar).where({ InspectionLot: inspectionLotId })
  //       );

  //       const insResQuery = await inspect.run(
  //         SELECT.from(insres).where({ InspectionLot: inspectionLotId })
  //       );

  //       return {
  //         ...lot,
  //         InspectionCharacteristics: insCharQuery.length
  //           ? insCharQuery.map(result => ({
  //             ...result,
  //             InspectionResults: insResQuery.filter(char => char.InspectionLot === inspectionLotId)
  //           }))
  //           : []
  //       };
  //     }));

  //     const obAddrQuery = await outbound.run(
  //       SELECT.from(obaddr).where({ DeliveryDocument: outboundtId })
  //     );

  //     const structuredData = {
  //       QualityCertificate: {
  //         OutboundAddress: obAddrQuery.length ? obAddrQuery[0] : {},
  //         InspectionLots: inspectionLots.length ? inspectionLots : {},
  //         OutboundItem: obItemQuery[0],
  //       }
  //     };

  //     function ensureEmptyTags(obj) {
  //       if (Array.isArray(obj)) {
  //         return obj.length === 0 ? {} : obj.map(ensureEmptyTags);
  //       } else if (typeof obj === 'object' && obj !== null) {
  //         return Object.fromEntries(
  //           Object.entries(obj).map(([key, value]) => [key, ensureEmptyTags(value)])
  //         );
  //       }
  //       return obj;
  //     }

  //     const updatedJsonData = ensureEmptyTags(structuredData);


  //     let xmlContent = '';
  //     for (const lot of inspectionLots) {
  //       const lotData = {
  //         QualityCertificate: {
  //           OutboundAddress: obAddrQuery.length ? obAddrQuery[0] : {},
  //           InspectionLots: [lot], // Wrap in array for consistent structure
  //           OutboundItem: obItemQuery[0],
  //         }
  //       };
  //       const lotJsonData = ensureEmptyTags(lotData);
  //       const xml = create(lotJsonData).end({ prettyPrint: true });
  //       xmlContent += xml + "\n\n"; // Add some space between each XML block
  //     }

  //     fs.writeFileSync('qualitycertificate.txt', xmlContent);

  //     console.log("Generated XML and saved to qualitycertificate.txt");

  //     return { message: "XML generated and saved to qualitycertificate.txt" };

  //   } catch (error) {
  //     console.error("Error generating XML:", error);
  //     return req.error(500, "Error generating XML");
  //   }
  // });

  this.on('printForm', 'quality1', async (req) => {
    try {
      const out_ids = req.params[0]?.ID;
      if (!out_ids) {
        console.error("Outbound ID is missing");
        return req.error(400, "Outbound ID is required");
      }
      console.log("Outbound ID--->", out_ids);

      const post = await cds.run(SELECT.from(quality1).where({ ID: out_ids }));
      if (!post.length) {
        console.error("No data found for the given Outbound ID");
        return req.error(404, "Quality1 data not found");
      }
      console.log("Post Data--->", post);

      const outboundtId = post[0].outbound;
      const outboundItem = post[0].outbounditem;

      const obItemQuery = await outbound.run(
        SELECT.from(obitem).where({ DeliveryDocument: outboundtId, DeliveryDocumentItem: outboundItem })
      );
      if (!obItemQuery.length) {
        console.error("Outbound item not found for outboundtId:", outboundtId);
        return req.error(404, "Outbound item not found");
      }
      const { ReferenceSDDocument, ReferenceSDDocumentItem } = obItemQuery[0];

      const insLotQuery = await inspect.run(
        SELECT.from(inslot).where({ SalesOrder: ReferenceSDDocument, SalesOrderItem: ReferenceSDDocumentItem })
      );
      if (!insLotQuery.length) {
        console.error("Inspection Lot not found for SalesOrder:", ReferenceSDDocument);
        return req.error(404, "Inspection Lot not found");
      }

      const inspectionLotsData = [];

      for (const lot of insLotQuery) {
        const inspectionLotId = lot.InspectionLot;
        console.log("Inspection Lot ID--->", inspectionLotId);

        const insCharQuery = await inspect.run(
          SELECT.from(inschar).where({ InspectionLot: inspectionLotId })
        );

        const insResQuery = await inspect.run(
          SELECT.from(insres).where({ InspectionLot: inspectionLotId })
        );

        const inspectionLotData = {
          ...lot,
          InspectionCharacteristics: insCharQuery.length
            ? insCharQuery.map(result => ({
              ...result,
              InspectionResults: insResQuery.filter(char => char.InspectionLot === inspectionLotId)
            }))
            : []
        };

        inspectionLotsData.push(inspectionLotData);
      }

      const obAddrQuery = await outbound.run(
        SELECT.from(obaddr).where({ DeliveryDocument: outboundtId })
      );

      const structuredData = {
        QualityCertificate: {
          OutboundAddress: obAddrQuery.length ? obAddrQuery[0] : {},
          InspectionLots: inspectionLotsData.length ? inspectionLotsData : {},
          OutboundItem: obItemQuery[0],
        }
      };

      function ensureEmptyTags(obj) {
        if (Array.isArray(obj)) {
          return obj.length === 0 ? {} : obj.map(ensureEmptyTags);
        } else if (typeof obj === 'object' && obj !== null) {
          return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, ensureEmptyTags(value)])
          );
        }
        return obj;
      }

      const updatedJsonData = ensureEmptyTags(structuredData);

      const xml = create(updatedJsonData).end({ prettyPrint: true });

      console.log("Generated XML:", xml);

      const fs = require('fs');
      fs.appendFileSync('qualitycertificate.txt', xml + "\n");

      return xml;

    } catch (error) {
      console.error("Error generating XML:", error);
      return req.error(500, "Error generating XML");
    }
  });



});