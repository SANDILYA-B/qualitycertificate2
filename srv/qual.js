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

  this.before("CREATE", quality1, async (req) => {
    if (!req.data.Items || req.data.Items.length === 0) {
      let res = await cds.run(
        SELECT.from(numberrange).where({ object_name: "outboundqc" })
      );

      if (res.length === 1) {
        let new_num = res[0].current_num
          ? Number(res[0].current_num) + 1
          : Number(res[0].from_num) + 1;

        await cds.run(
          UPDATE(numberrange)
            .data({ current_num: new_num })
            .where({ object_name: "outboundqc" })
        );

        req.data.tcnumber = String(new_num).padStart(res[0].len_num, "0");
      }
    }
  });

  this.on('printForm', 'quality1', async (req) => {
    const { obdel, material } = req.data;
    console.log("hi",req.data)
    if (!obdel || !material) return req.reject(400, "Invalid input");

    // Fetch outbound delivery items
    const obItems = await cds.run(
      SELECT.from(obitem)
        .where({ DeliveryDocument: obdel, Material: material })
    );
    if (!obItems.length) return req.reject(404, "No outbound delivery found");

    const refSDDocument = obItems[0].ReferenceSDDocument;

    // Fetch inspection lot details using ReferenceSDDocument as SalesOrder
    const inslot = await cds.run(
      SELECT.from(inslot)
        .where({ SalesOrder: refSDDocument })
    );

    if (!inslot.length) return req.reject(404, "No inspection lot found");

    const inspectionLot = inslot[0];

    // Fetch inspection characteristics
    const inschar = await cds.run(
      SELECT.from(inschar)
        .where({ InspectionLot: inspectionLot.InspectionLot })
    );

    // Fetch inspection results
    const insres = await cds.run(
      SELECT.from(insres)
        .where({ InspectionLot: inspectionLot.InspectionLot })
    );

    // Fetch address details
    const obaddr = await cds.run(
      SELECT.from(obaddr)
        .where({ DeliveryDocument: obdel })
    );

    const xmlData = {
      QualityCertificate: {
        DeliveryDocument: obdel,
        BusinessPartnerName1: obaddr[0]?.BusinessPartnerName1 || "",
        StreetName: obaddr[0]?.StreetName || "",
        CityName: obaddr[0]?.CityName || "",
        Region: obaddr[0]?.Region || "",
        Country: obaddr[0]?.Country || "",
        PostalCode: obaddr[0]?.PostalCode || "",
        InspectionLot: {
          InspectionLotObjectText: inspectionLot.InspectionLotObjectText,
          Material: inspectionLot.Material,
          Batch: inspectionLot.Batch,
          Characteristics: inschar.map((char) => {
            const result = insres.find(res => res.InspectionLot === char.InspectionLot) || {};
            return {
              InspectionCharacteristic: char.InspectionCharacteristic,
              InspectionSpecification: char.InspectionSpecification,
              InspectionResultMeanValue: result.InspectionResultMeanValue || "",
              InspectionResultMinimumValue: result.InspectionResultMinimumValue || "",
              InspectionResultMaximumValue: result.InspectionResultMaximumValue || "",
            };
          })
        }
      }
    };

    const builder = new XMLBuilder({ format: true });
    const xmlOutput = builder.build(xmlData);
    return xmlOutput;
  });
});